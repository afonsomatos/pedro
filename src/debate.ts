interface Message {
  sender: string;
  text: string;
  timestamp: Date;
}

const MAX_MESSAGES_PER_CHAT = 50;

// In-memory storage: chatId -> messages
const chatHistory = new Map<number, Message[]>();
// Track last judge time per chat
const lastJudgeTime = new Map<number, Date>();

export function addMessage(chatId: number, sender: string, text: string): void {
  if (!chatHistory.has(chatId)) {
    chatHistory.set(chatId, []);
  }

  const messages = chatHistory.get(chatId)!;
  messages.push({
    sender,
    text,
    timestamp: new Date(),
  });

  // Keep only the last MAX_MESSAGES_PER_CHAT messages
  if (messages.length > MAX_MESSAGES_PER_CHAT) {
    messages.shift();
  }
}

export function getMessages(chatId: number): Message[] {
  return chatHistory.get(chatId) || [];
}

export function getNewMessageCount(chatId: number): number {
  const messages = chatHistory.get(chatId) || [];
  const lastJudge = lastJudgeTime.get(chatId);
  if (lastJudge) {
    return messages.filter((m) => m.timestamp > lastJudge).length;
  }
  return messages.length;
}

export function getLastJudgeTime(chatId: number): Date | undefined {
  return lastJudgeTime.get(chatId);
}

export function markJudged(chatId: number): void {
  lastJudgeTime.set(chatId, new Date());
}

export function clearMessages(chatId: number): void {
  chatHistory.delete(chatId);
}

export function getMessageCount(chatId: number): number {
  return chatHistory.get(chatId)?.length || 0;
}
