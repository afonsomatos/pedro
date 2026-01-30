import { CommandContext, Context } from "grammy";

export async function helpCommand(ctx: CommandContext<Context>): Promise<void> {
  const helpMessage = `⚖️ **Pedro - Command Reference**

**Available Commands:**

\`/start\` - Welcome message and introduction

\`/help\` - Show this help message

\`/judge\` - Analyze the recent debate and provide a verdict

\`/judge @username\` - Focus analysis on a specific user's arguments

\`/clear\` - Clear message history for a fresh debate

**Tips:**
• I track the last 50 messages in each chat
• For best results, have a focused debate before calling /judge
• I analyze in the same language as the conversation

**Note:** I only track regular text messages, not media or other content.`;

  await ctx.reply(helpMessage, { parse_mode: "Markdown" });
}
