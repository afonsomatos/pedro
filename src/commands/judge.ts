import { CommandContext, Context } from "grammy";
import { getMessages, getNewMessageCount, getLastJudgeTime, markJudged } from "../debate.js";
import { judgeDebate } from "../ai.js";

export async function judgeCommand(ctx: CommandContext<Context>): Promise<void> {
  const chatId = ctx.chat.id;
  const newCount = getNewMessageCount(chatId);

  if (newCount === 0) {
    await ctx.reply(
      "📭 No new messages to judge! Have a debate first, then call /judge again."
    );
    return;
  }

  const question = ctx.match?.toString().trim() || undefined;
  const lastJudgeTime = getLastJudgeTime(chatId);

  // Send "thinking" message
  const thinkingMsg = await ctx.reply(`🤔 Analyzing ${newCount} new messages...`);

  try {
    const messages = getMessages(chatId);
    const verdict = await judgeDebate(messages, question, lastJudgeTime);
    markJudged(chatId);

    // Delete thinking message and send verdict
    await ctx.api.deleteMessage(chatId, thinkingMsg.message_id).catch(() => {});

    // Split long messages if needed (Telegram limit is 4096 chars)
    if (verdict.length > 4000) {
      const parts = splitMessage(verdict, 4000);
      for (const part of parts) {
        await ctx.reply(part);
      }
    } else {
      await ctx.reply(verdict);
    }
  } catch (error) {
    console.error("Judge command error:", error);
    await ctx.api.deleteMessage(chatId, thinkingMsg.message_id).catch(() => {});
    await ctx.reply("❌ An error occurred while judging. Please try again.");
  }
}

function splitMessage(text: string, maxLength: number): string[] {
  const parts: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= maxLength) {
      parts.push(remaining);
      break;
    }

    // Find a good split point (newline or space)
    let splitIndex = remaining.lastIndexOf("\n", maxLength);
    if (splitIndex === -1 || splitIndex < maxLength / 2) {
      splitIndex = remaining.lastIndexOf(" ", maxLength);
    }
    if (splitIndex === -1) {
      splitIndex = maxLength;
    }

    parts.push(remaining.slice(0, splitIndex));
    remaining = remaining.slice(splitIndex).trimStart();
  }

  return parts;
}
