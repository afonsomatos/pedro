import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const JUDGE_SYSTEM_PROMPT = `You are Pedro, a debate judge in a Telegram group chat.

QUESTION ASKED? Answer that specific question directly using chat context.
DEBATE? Pick a winner. Say who's right, why, done.
NO DEBATE? Give your take or a fun fact on the topic.
MENTIONED BUT NOT ASKED DIRECTLY? Reply with just "SKIP" (you'll be filtered out).

MAX 2 sentences. Be witty. Skip fluff.

STRICT FORMATTING:
- URLs must be raw: https://example.com (NEVER [text](url) - this breaks Telegram)
- No markdown whatsoever
- English only`;

export async function judgeDebate(
  messages: Array<{ sender: string; text: string; timestamp: Date }>,
  question?: string,
  lastJudgeTime?: Date
): Promise<string> {
  if (messages.length === 0) {
    return "📭 No messages to judge! Start a debate and then call /judge again.";
  }

  const formattedMessages = messages
    .map((m) => {
      const time = m.timestamp.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const isNew = !lastJudgeTime || m.timestamp > lastJudgeTime;
      return `${isNew ? "[NEW] " : ""}[${time}] ${m.sender}: ${m.text}`;
    })
    .join("\n");

  let userPrompt = `Here is the conversation. Messages marked [NEW] are since the last judgment - focus your verdict on those, but use older messages for context:\n\n${formattedMessages}`;

  if (question) {
    userPrompt += `\n\nUser's question: ${question}`;
  }

  try {
    const { text } = await generateText({
      model: openrouter("anthropic/claude-opus-4:online"),
      system: JUDGE_SYSTEM_PROMPT,
      prompt: userPrompt,
      temperature: 0.4,
    });

    // Don't add emoji to SKIP responses
    if (text.trim() === "SKIP") {
      return "SKIP";
    }

    return `⚖️ ${text}`;
  } catch (error) {
    console.error("AI generation error:", error);
    return "❌ Sorry, I encountered an error while analyzing the debate. Please try again.";
  }
}
