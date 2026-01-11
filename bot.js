// bot.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { Telegraf, Markup } from "telegraf";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBAPP_URL = process.env.WEBAPP_URL; // ex: https://ton-domaine.com
const PORT = process.env.PORT || 3000;

if (!BOT_TOKEN) throw new Error("Missing BOT_TOKEN env var");
if (!WEBAPP_URL) throw new Error("Missing WEBAPP_URL env var (https URL)");

const app = express();

// Serve the mini app (static)
app.use(express.static(path.join(__dirname, "public")));

// Serve the IA dataset
app.get("/api/ais", (req, res) => {
  res.sendFile(path.join(__dirname, "data", "ais.json"));
});

app.listen(PORT, () => {
  console.log(`HTTP server running on :${PORT}`);
});

const bot = new Telegraf(BOT_TOKEN);

bot.start(async (ctx) => {
  const url = WEBAPP_URL.replace(/\/+$/, ""); // trim trailing slash
  await ctx.reply(
    "🧠 AIGuide Atlas — ouvre le guide mondial des IA :",
    Markup.inlineKeyboard([
      Markup.button.webApp("🚀 Ouvrir la mini-app", `${url}/index.html`)
    ])
  );
});

bot.command("app", async (ctx) => {
  const url = WEBAPP_URL.replace(/\/+$/, "");
  await ctx.reply(
    "Voici la mini-app :",
    Markup.inlineKeyboard([
      Markup.button.webApp("📚 Ouvrir AIGuide Atlas", `${url}/index.html`)
    ])
  );
});

bot.launch();
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
