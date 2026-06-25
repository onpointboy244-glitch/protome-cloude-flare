import express from "express";
import { existsSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Read Supabase credentials from .env (used in production; in dev Vite proxies for us)
let supabaseUrl = process.env.VITE_SUPABASE_URL;
let supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnonKey) {
  try {
    const env = readFileSync(join(__dirname, "..", ".env"), "utf-8");
    for (const line of env.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const eq = trimmed.indexOf("=");
        if (eq > 0) {
          const k = trimmed.slice(0, eq).trim();
          if (k === "VITE_SUPABASE_URL") supabaseUrl = trimmed.slice(eq + 1).trim();
          if (k === "VITE_SUPABASE_ANON_KEY") supabaseAnonKey = trimmed.slice(eq + 1).trim();
        }
      }
    }
  } catch { /* .env not found */ }
}

const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const app = express();

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

    // Skip paths that look like asset files or common paths
    if (
      !username ||
      username.includes(".") ||
      username === "favicon.svg" ||
      username.startsWith("assets/")
    ) {
      return res.send(getIndexHtml());
    }

    let name = username;
    let description = `Check out ${username}'s protome profile.`;
    let image = null;
    let accent = "#c45a3c";

    // Fetch profile data from Supabase
    if (supabase) {
      try {
        const { data } = await supabase
          .from("profiles")
          .select("name, bio, photo_url, accent")
          .eq("username", username.toLowerCase())
          .maybeSingle();

        if (data) {
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
      .replace("</head>", `    ${metaTags}\n  </head>`);

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
