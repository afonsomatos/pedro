import Redis from "ioredis";

interface Message {
  sender: string;
  text: string;
  timestamp: string;
}

const MAX_MESSAGES_PER_CHAT = 50;

const redis = new Redis(process.env.REDIS_URL || "");

function chatKey(chatId: number): string {
  return `chat:${chatId}:messages`;
}

export async function addMessage(chatId: number, sender: string, text: string): Promise<void> {
  const message: Message = {
    sender,
    text,
    timestamp: new Date().toISOString(),
  };

  // Push to list and trim to max size
  await redis.lpush(chatKey(chatId), JSON.stringify(message));
  await redis.ltrim(chatKey(chatId), 0, MAX_MESSAGES_PER_CHAT - 1);
}

export async function getMessages(chatId: number): Promise<Array<{ sender: string; text: string; timestamp: Date }>> {
  const raw = await redis.lrange(chatKey(chatId), 0, -1);
  return raw
    .map((m) => JSON.parse(m) as Message)
    .map((m) => ({ ...m, timestamp: new Date(m.timestamp) }))
    .reverse(); // lpush adds to front, so reverse to get chronological order
}
