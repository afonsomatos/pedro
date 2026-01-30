import { CommandContext, Context } from "grammy";
import { getMessages, getNewMessageCount, getLastJudgeTime, markJudged } from "../debate.js";
import { judgeDebate } from "../ai.js";

export async function judgeCommand(ctx: CommandContext<Context>): Promise<void> {
  const chatId = ctx.chat.id;
  const question = ctx.match?.toString().trim() || undefined;
  const newCount = getNewMessageCount(chatId);
  const messages = getMessages(chatId);

  // If no question and no new messages, nothing to do
  if (!question && newCount === 0) {
    await ctx.reply(
      "📭 No new messages to judge! Have a debate first, then call /judge again."
    );
    return;
  }

  // If there's a question but no messages at all, can't help
  if (messages.length === 0) {
    await ctx.reply(
      "📭 No messages to analyze! Have a conversation first."
    );
    return;
  }

  const lastJudgeTime = getLastJudgeTime(chatId);

  // Send "thinking" message
  const thinkingMsg = await ctx.reply(
    question ? `🤔 Thinking...` : `🤔 Analyzing ${newCount} new messages...`
  );

  try {
    const verdict = await judgeDebate(messages, question, lastJudgeTime);

    // Delete thinking message
    await ctx.api.deleteMessage(chatId, thinkingMsg.message_id).catch(() => {});

    // Don't send SKIP responses from /judge command
    if (verdict === "SKIP") {
      return;
    }

    markJudged(chatId);

    // Split long messages if needed (Telegram limit is 4096 chars)
    const replyOptions = { link_preview_options: { is_disabled: true } };
    if (verdict.length > 4000) {
      const parts = splitMessage(verdict, 4000);
      for (const part of parts) {
        await ctx.reply(part, replyOptions);
      }
    } else {
      await ctx.reply(verdict, replyOptions);
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
