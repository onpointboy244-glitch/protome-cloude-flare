import express from "express";
import cors from "cors";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import process from "process";

const __dirname = dirname(fileURLToPath(import.meta.url));

const DATA_DIR = join(__dirname, "data");
const DATA_FILE = join(DATA_DIR, "profiles.json");

// Ensure storage exists
if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
if (!existsSync(DATA_FILE)) writeFileSync(DATA_FILE, "{}");

function readProfiles() {
  try {
    return JSON.parse(readFileSync(DATA_FILE, "utf-8"));
  } catch {
    return {};
  }
}

function writeProfiles(data) {
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// --- API routes ---

app.post("/api/profiles", (req, res) => {
  const { username, ...profile } = req.body;

  if (!username || !/^[a-z0-9_-]{2,30}$/i.test(username)) {
    return res.status(400).json({
      error:
        "Username must be 2–30 characters (letters, numbers, hyphens, underscores).",
    });
  }

  const key = username.toLowerCase();
  const profiles = readProfiles();

  profiles[key] = {
    ...profile,
    username: key,
    createdAt: profiles[key]?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  writeProfiles(profiles);
  console.log(`  ✓ Profile saved: /${key}`);
  res.json({ username: key });
});

app.get("/api/profiles/:username", (req, res) => {
  const profiles = readProfiles();
  const profile = profiles[req.params.username.toLowerCase()];
  if (!profile) return res.status(404).json({ error: "Not found" });
  res.json(profile);
});

app.get("/api/check/:username", (req, res) => {
  const profiles = readProfiles();
  const exists = !!profiles[req.params.username.toLowerCase()];
  res.json({ available: !exists });
});

// --- Serve SPA (production) ---

const distPath = join(__dirname, "..", "dist");
const serveSPA = existsSync(distPath);

if (serveSPA) {
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(join(distPath, "index.html"));
  });
} else {
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
