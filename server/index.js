import express from "express";
import { existsSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Read Supabase credentials from environment.
// Priority: SUPABASE_URL/SUPABASE_ANON_KEY (production) >
//           VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY (Vite dev) >
//           .env file (local convenience)
function loadSupabaseEnv() {
  // 1. Non-VITE-prefixed env vars (production — Railway, Fly, etc.)
  let url = process.env.SUPABASE_URL;
  let key = process.env.SUPABASE_ANON_KEY;

  // 2. VITE-prefixed env vars (Vite dev or .env file)
  if (!url) url = process.env.VITE_SUPABASE_URL;
  if (!key) key = process.env.VITE_SUPABASE_ANON_KEY;

  // 3. Read from .env file (local dev without export)
  if (!url || !key) {
    try {
      const env = readFileSync(join(__dirname, "..", ".env"), "utf-8");
      for (const line of env.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eq = trimmed.indexOf("=");
        if (eq <= 0) continue;
        const k = trimmed.slice(0, eq).trim();
        const v = trimmed.slice(eq + 1).trim();
        if (!url && (k === "SUPABASE_URL" || k === "VITE_SUPABASE_URL")) url = v;
        if (!key && (k === "SUPABASE_ANON_KEY" || k === "VITE_SUPABASE_ANON_KEY")) key = v;
      }
    } catch { /* .env not found */ }
  }

  return { url, key };
}

const { url: supabaseUrl, key: supabaseAnonKey } = loadSupabaseEnv();

const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const app = express();
app.set('trust proxy', 1);
app.use(express.json());

// --- Report API (must be before the username route) ---

function getClientIP(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.ip || req.socket.remoteAddress || "unknown";
}

app.post("/api/report", async (req, res) => {
  const { username, reason, details } = req.body;
  const ip = getClientIP(req);

  if (!username || !reason) {
    return res.status(400).json({ error: "Username and reason are required." });
  }

  if (!supabase) {
    return res.status(500).json({ error: "Report service unavailable." });
  }

  try {
    // Check if this IP already reported this profile
    const { data: existing } = await supabase
      .from("reported_profiles")
      .select("id")
      .eq("username", username.toLowerCase())
      .eq("ip_address", ip)
      .maybeSingle();

    if (existing) {
      return res.status(409).json({ error: "You have already reported this profile." });
    }

    const { error } = await supabase.from("reported_profiles").insert({
      username: username.toLowerCase(),
      ip_address: ip,
      reason,
      details: details || null,
      created_at: new Date().toISOString(),
    });

    if (error) {
      if (error.code === "23505") {
        return res.status(409).json({ error: "You have already reported this profile." });
      }
      return res.status(500).json({ error: error.message });
    }

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Something went wrong." });
  }
});

// --- Serve static assets (images, JS, CSS) ---

const distPath = join(__dirname, "..", "dist");
const serveSPA = existsSync(distPath);

if (serveSPA) {
  app.use(express.static(distPath));

  // Cache the built index.html
  let cachedHtml = null;
  function getIndexHtml() {
    if (!cachedHtml) {
      cachedHtml = readFileSync(join(distPath, "index.html"), "utf-8");
    }
    return cachedHtml;
  }

  // Profile pages: inject OG meta tags
  app.get("/:username", async (req, res) => {
    const { username } = req.params;

    // Skip paths that look like asset files, known static pages, or common paths
    if (
      !username ||
      username.includes(".") ||
      username === "favicon.svg" ||
      username.startsWith("assets/") ||
      username === "privacy" ||
      username === "terms" ||
      username === "about" ||
      username === "blog" ||
      username === "contact"
    ) {
      return res.send(getIndexHtml());
    }

    let name = username;
    let description = `Check out ${username}'s protome profile.`;
    let image = null;
    let accent = "#c45a3c";
    let profileData = null;

    // Fetch profile data from Supabase
    if (supabase) {
      try {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("username", username.toLowerCase())
          .maybeSingle();

        if (data) {
          profileData = data;
          name = data.name || username;
          description = data.bio
            ? data.bio.length > 200
              ? data.bio.slice(0, 200) + "…"
              : data.bio
            : `Check out ${name}'s protome profile.`;
          image = data.photo_url || null;
          accent = data.accent || "#c45a3c";
        }
      } catch { /* supabase unavailable */ }
    }

    const safeName = esc(name);
    const safeDesc = esc(description);
    const safeImage = image ? esc(image) : null;
    const url = esc(req.protocol + "://" + req.get("host") + "/" + username);
    const safeAccent = esc(accent);

    // Inject profile data as JSON so the React app skips the fetch entirely
    const profileJSON = profileData
      ? JSON.stringify(profileData).replace(/<\//g, "\\u003C/")
      : "null";
    const profileHTML =
      '<script id="__INITIAL_PROFILE__" type="application/json">' + profileJSON + '</script>';

    // Build the meta tags block
    const metaTags = [
      `<title>${safeName} — protome</title>`,
      `<meta name="description" content="${safeDesc}" />`,
      `<meta name="theme-color" content="${safeAccent}" />`,
      `<meta property="og:title" content="${safeName} — protome" />`,
      `<meta property="og:description" content="${safeDesc}" />`,
      `<meta property="og:type" content="profile" />`,
      `<meta property="og:url" content="${url}" />`,
      safeImage ? `<meta property="og:image" content="${safeImage}" />` : "",
      `<meta property="og:image:width" content="400" />`,
      `<meta property="og:image:height" content="400" />`,
      `<meta name="twitter:card" content="summary" />`,
      `<meta name="twitter:title" content="${safeName} — protome" />`,
      `<meta name="twitter:description" content="${safeDesc}" />`,
      safeImage ? `<meta name="twitter:image" content="${safeImage}" />` : "",
    ].filter(Boolean).join("\n    ");

    // Replace the existing <title> and inject meta tags before </head>
    let html = getIndexHtml()
      // Remove the default <title>
      .replace(/<title>.*?<\/title>/, "")
      // Inject our meta tags right before </head>
      .replace(
        "</head>",
        `    ${metaTags}\n    ${profileHTML}\n  </head>`,
      );

    res.send(html);
  });

  // All other routes (including /) — serve the SPA
  app.get("*", (_req, res) => {
    res.send(getIndexHtml());
  });
} else {
  // Dev mode — just a health check
  app.get("/", (_req, res) => {
    res.json({ message: "protome API — run `npm run dev` for the frontend" });
  });
}

// --- Start ---

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n  ⚡ protome running on http://localhost:${PORT}`);
  if (!serveSPA) {
    console.log(
      "  ⚡ Frontend (Vite) runs on http://localhost:5173 in dev mode\n",
    );
  }
});

// --- Helpers ---

function esc(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, " ");
}
