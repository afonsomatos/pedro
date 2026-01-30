import "dotenv/config";
import { Bot } from "grammy";
import { startCommand } from "./commands/start.js";
import { helpCommand } from "./commands/help.js";
import { judgeCommand } from "./commands/judge.js";
import { addMessage, clearMessages, getMessageCount } from "./debate.js";

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  throw new Error("TELEGRAM_BOT_TOKEN is not set in environment variables");
}

const bot = new Bot(token);

// Register commands
bot.command("start", startCommand);
bot.command("help", helpCommand);
bot.command("judge", judgeCommand);

bot.command("clear", async (ctx) => {
  const chatId = ctx.chat.id;
  const count = getMessageCount(chatId);
  clearMessages(chatId);
  await ctx.reply(`🧹 Cleared ${count} messages. Ready for a fresh debate!`);
});

// Message tracking middleware - track all text messages
bot.on("message:text", (ctx) => {
  // Skip commands
  if (ctx.message.text.startsWith("/")) {
    return;
  }

  const chatId = ctx.chat.id;
  const sender =
    ctx.from?.first_name +
    (ctx.from?.last_name ? ` ${ctx.from.last_name}` : "") +
    (ctx.from?.username ? ` (@${ctx.from.username})` : "");
  const text = ctx.message.text;

  addMessage(chatId, sender, text);
});

// Error handler
bot.catch((err) => {
  console.error("Bot error:", err);
});

// Start the bot
console.log("🤖 Pedro is starting...");
bot.start({
  onStart: (botInfo) => {
    console.log(`✅ Pedro is running as @${botInfo.username}`);
  },
});
