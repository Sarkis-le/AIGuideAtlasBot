// bot.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { Telegraf, Markup } from "telegraf";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBAPP_URL = process.env.WEBAPP_URL; // ex: https://aiguideatlasbot.onrender.com
const PORT = process.env.PORT || 3000;

if (!BOT_TOKEN) throw new Error("Missing BOT_TOKEN env var");
if (!WEBAPP_URL) throw new Error("Missing WEBAPP_URL env var (https URL)");

const app = express();

// --- DEBUG (pour confirmer les chemins sur Render)
const publicDir = path.join(__dirname, "public");
const indexFile = path.join(publicDir, "index.html");
const dataFile = path.join(__dirname, "data", "ais.json");

console.log("PUBLIC DIR:", publicDir, "exists:", fs.existsSync(publicDir));
console.log("INDEX FILE:", indexFile, "exists:", fs.existsSync(indexFile));
console.log("DATA FILE:", dataFile, "exists:", fs.existsSync(dataFile));

// --- ROUTES
// 1) Root -> index.html
app.get("/", (req, res) => {
  res.sendFile(indexFile);
});

// 2) Explicit index route
app.get("/index.html", (req, res) => {
  res.sendFile(indexFile);
});

// 3) Static assets (style.css, app.js, etc.)
app.use(express.static(publicDir));

// 4) IA dataset
app.get("/api/ais", (req, res) => {
  res.sendFile(dataFile);
});

app.listen(PORT, () => {
  console.log(`HTTP server running on :${PORT}`);
});

// --- TELEGRAM BOT
const bot = new Telegraf(BOT_TOKEN);

bot.start(async (ctx) => {
  const url = WEBAPP_URL.replace(/\/+$/, "");
  await ctx.reply(
    "🧠 AIGuide Atlas — ouvre le guide mondial des IA :",
    Markup.inlineKeyboard([
      Markup.button.webApp("🚀 Ouvrir la mini-app", `${url}/`)
    ])
  );
});

bot.command("app", async (ctx) => {
  const url = WEBAPP_URL.replace(/\/+$/, "");
  await ctx.reply(
    "Voici la mini-app :",
    Markup.inlineKeyboard([
      Markup.button.webApp("📚 Ouvrir AIGuide Atlas", `${url}/`)
    ])
  );
});

bot.launch();
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
