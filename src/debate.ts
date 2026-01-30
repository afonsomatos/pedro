interface Message {
  sender: string;
  text: string;
  timestamp: Date;
}

const MAX_MESSAGES_PER_CHAT = 50;

// In-memory storage: chatId -> messages
const chatHistory = new Map<number, Message[]>();

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

export function clearMessages(chatId: number): void {
  chatHistory.delete(chatId);
}

export function getMessageCount(chatId: number): number {
  return chatHistory.get(chatId)?.length || 0;
}
