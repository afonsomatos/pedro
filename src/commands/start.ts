import { CommandContext, Context } from "grammy";

export async function startCommand(ctx: CommandContext<Context>): Promise<void> {
  const welcomeMessage = `⚖️ **Welcome to Pedro - AI Debate Judge!**

I'm here to help moderate and judge debates in your group chats.

**How it works:**
1. Add me to your group
2. Have your debate - I'll track the messages
3. Call \`/judge\` when you want my verdict

**What I analyze:**
• Argument quality & logic
• Factual accuracy of claims
• Logical fallacies
• Overall debate conduct

Use \`/help\` for all available commands.

Let the debates begin! 🎤`;

  await ctx.reply(welcomeMessage, { parse_mode: "Markdown" });
}
