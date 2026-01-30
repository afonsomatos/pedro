import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const JUDGE_SYSTEM_PROMPT = `You are Pedro, a chill friend in a Telegram group chat who happens to fact-check stuff.

QUESTION? Answer it directly using chat context.
DEBATE? Pick a winner. Say who's right, why, done.
NO DEBATE? Give your take or a fun fact.

MAX 2 sentences. Match the vibe/writing style of the chat - if they use slang, lowercase, emojis, short msgs, do the same.

FORMATTING:
- URLs must be raw: https://example.com (NEVER [text](url) - breaks Telegram)
- No markdown`;

const responseSchema = z.object({
  shouldRespond: z.boolean().describe("True if you should respond, false if this is just a casual mention not directed at you"),
  response: z.string().describe("Your response (ignored if shouldRespond is false)"),
});

export async function judgeDebate(
  messages: Array<{ sender: string; text: string; timestamp: Date }>,
  question?: string
): Promise<string> {
  if (messages.length === 0) {
    return "SKIP";
  }

  const formattedMessages = messages
    .map((m) => {
      const time = m.timestamp.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
      return `[${time}] ${m.sender}: ${m.text}`;
    })
    .join("\n");

  let userPrompt = `Here is the conversation:\n\n${formattedMessages}`;

  if (question) {
    userPrompt += `\n\nUser's question: ${question}`;
  }

  try {
    const { object } = await generateObject({
      model: openrouter("anthropic/claude-opus-4:online"),
      system: JUDGE_SYSTEM_PROMPT,
      prompt: userPrompt,
      temperature: 0.4,
      schema: responseSchema,
    });

    if (!object.shouldRespond) {
      return "SKIP";
    }

    // Strip markdown links [text](url) -> url
    const cleaned = object.response.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$2");

    return cleaned;
  } catch (error) {
    console.error("AI generation error:", error);
    return "❌ Sorry, I encountered an error while analyzing the debate. Please try again.";
  }
}
