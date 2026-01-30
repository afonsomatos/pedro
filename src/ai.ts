import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const JUDGE_SYSTEM_PROMPT = `You are Pedro, a debate judge responding in a Telegram chat. Give a short verdict in 2-3 sentences. Stick to facts only - no opinions, no moral judgments, no commentary on behavior. Just state what's factually accurate.

CRITICAL: No markdown. If citing a source, just paste the raw URL directly. Never use [text](url) format. Always respond in English.

You can search online to fact-check claims or research topics if needed.

If a question is asked, answer it based on the conversation context while still giving your judgment.`;

export async function judgeDebate(
  messages: Array<{ sender: string; text: string; timestamp: Date }>,
  question?: string
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
      return `[${time}] ${m.sender}: ${m.text}`;
    })
    .join("\n");

  let userPrompt = `Here is the recent conversation to analyze:\n\n${formattedMessages}`;

  if (question) {
    userPrompt += `\n\nUser's question: ${question}`;
  }

  try {
    const { text } = await generateText({
      model: openrouter("anthropic/claude-opus-4:online"),
      system: JUDGE_SYSTEM_PROMPT,
      prompt: userPrompt,
    });

    return `⚖️ ${text}`;
  } catch (error) {
    console.error("AI generation error:", error);
    return "❌ Sorry, I encountered an error while analyzing the debate. Please try again.";
  }
}
