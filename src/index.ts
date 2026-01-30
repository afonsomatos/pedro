import "dotenv/config";
import { Bot } from "grammy";
import { startCommand } from "./commands/start.js";
import { helpCommand } from "./commands/help.js";
import { judgeCommand } from "./commands/judge.js";
import { addMessage, clearMessages, getMessageCount, getMessages, getLastJudgeTime, markJudged } from "./debate.js";
import { judgeDebate } from "./ai.js";

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

// Store bot username for mention detection
let botUsername = "";

// Message tracking middleware - track all text messages
bot.on("message:text", async (ctx) => {
  const text = ctx.message.text;

  // Skip commands
  if (text.startsWith("/")) {
    return;
  }

  const chatId = ctx.chat.id;
  const sender =
    ctx.from?.first_name +
    (ctx.from?.last_name ? ` ${ctx.from.last_name}` : "") +
    (ctx.from?.username ? ` (@${ctx.from.username})` : "");

  // Track the message
  addMessage(chatId, sender, text);

  // Check if bot is mentioned directly (not just casual mention)
  const mentionPattern = new RegExp(`@${botUsername}\\b`, "i");
  const isMentioned = botUsername && mentionPattern.test(text);
  const isReply = ctx.message.reply_to_message?.from?.id === ctx.me.id;

  if (isMentioned || isReply) {
    // Check if it looks like a direct question/request
    const looksLikeQuestion =
      text.includes("?") ||
      text.toLowerCase().startsWith(`@${botUsername.toLowerCase()}`) ||
      isReply ||
      /\b(what|why|how|who|when|where|is|are|do|does|can|could|should|would|tell|explain|help)\b/i.test(text);

    if (looksLikeQuestion) {
      // Remove the @mention from the question
      const question = text.replace(mentionPattern, "").trim();

      const messages = getMessages(chatId);
      if (messages.length === 0) {
        return; // No context to work with
      }

      const thinkingMsg = await ctx.reply("🤔 Thinking...");

      try {
        const lastJudgeTime = getLastJudgeTime(chatId);
        const verdict = await judgeDebate(messages, question, lastJudgeTime);
        markJudged(chatId);

        await ctx.api.deleteMessage(chatId, thinkingMsg.message_id).catch(() => {});
        await ctx.reply(verdict, { link_preview_options: { is_disabled: true } });
      } catch (error) {
        console.error("Mention response error:", error);
        await ctx.api.deleteMessage(chatId, thinkingMsg.message_id).catch(() => {});
      }
    }
  }
});

// Error handler
bot.catch((err) => {
  console.error("Bot error:", err);
});

// Start the bot
console.log("🤖 Pedro is starting...");
bot.start({
  onStart: (botInfo) => {
    botUsername = botInfo.username;
    console.log(`✅ Pedro is running as @${botInfo.username}`);
  },
});
