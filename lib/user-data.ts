import { kv } from '@vercel/kv';
import type { AppSettings } from './settings';

export interface UserSettings extends AppSettings {
  theme?: 'light' | 'dark' | 'system';
  defaultMode?: 'chat' | 'workers' | 'ralph';
  defaultWorkerModels?: string[];
  defaultRalphIterations?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  model?: string;
  sources?: Array<{ docId: string; filename: string; snippet: string }>;
}

export interface ChatHistory {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export async function getUserSettings(email: string): Promise<UserSettings | null> {
  try {
    const key = `user:${email}:settings`;
    return await kv.get<UserSettings>(key);
  } catch (error) {
    console.error('[UserData] Failed to get settings:', error);
    return null;
  }
}

export async function saveUserSettings(email: string, settings: UserSettings): Promise<void> {
  try {
    const key = `user:${email}:settings`;
    await kv.set(key, settings);
    console.log('[UserData] Settings saved for:', email);
  } catch (error) {
    console.error('[UserData] Failed to save settings:', error);
    throw error;
  }
}

export async function createChatHistory(
  email: string,
  title: string,
  messages: ChatMessage[] = []
): Promise<ChatHistory> {
  try {
    const chatId = `chat:${Date.now()}:${email}`;
    const chat: ChatHistory = {
      id: chatId,
      userId: email,
      title,
      messages,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(chatId, chat);
    await kv.sadd(`user:${email}:chats`, chatId);
    
    console.log('[UserData] Chat created:', chatId);
    return chat;
  } catch (error) {
    console.error('[UserData] Failed to create chat:', error);
    throw error;
  }
}

export async function updateChatHistory(
  chatId: string,
  messages: ChatMessage[],
  title?: string
): Promise<void> {
  try {
    const chat = await kv.get<ChatHistory>(chatId);
    if (!chat) {
      throw new Error('Chat not found');
    }

    chat.messages = messages;
    chat.updatedAt = new Date().toISOString();
    if (title) {
      chat.title = title;
    }

    await kv.set(chatId, chat);
    console.log('[UserData] Chat updated:', chatId);
  } catch (error) {
    console.error('[UserData] Failed to update chat:', error);
    throw error;
  }
}

export async function getChatHistory(chatId: string): Promise<ChatHistory | null> {
  try {
    return await kv.get<ChatHistory>(chatId);
  } catch (error) {
    console.error('[UserData] Failed to get chat:', error);
    return null;
  }
}

export async function listUserChats(email: string): Promise<ChatHistory[]> {
  try {
    const chatIds = await kv.smembers(`user:${email}:chats`);
    
    if (!chatIds || chatIds.length === 0) {
      return [];
    }

    const chats = await Promise.all(
      chatIds.map(async (id) => {
        const chat = await kv.get<ChatHistory>(id as string);
        return chat;
      })
    );

    return chats
      .filter((chat): chat is ChatHistory => chat !== null)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  } catch (error) {
    console.error('[UserData] Failed to list chats:', error);
    return [];
  }
}

export async function deleteChatHistory(email: string, chatId: string): Promise<void> {
  try {
    await kv.del(chatId);
    await kv.srem(`user:${email}:chats`, chatId);
    console.log('[UserData] Chat deleted:', chatId);
  } catch (error) {
    console.error('[UserData] Failed to delete chat:', error);
    throw error;
  }
}

export async function linkDocumentToUser(email: string, docId: string): Promise<void> {
  try {
    await kv.sadd(`user:${email}:documents`, docId);
    await kv.set(`doc:${docId}:owner`, email);
    console.log('[UserData] Document linked to user:', docId, email);
  } catch (error) {
    console.error('[UserData] Failed to link document:', error);
    throw error;
  }
}

export async function getUserDocuments(email: string): Promise<string[]> {
  try {
    const docIds = await kv.smembers(`user:${email}:documents`);
    return (docIds || []) as string[];
  } catch (error) {
    console.error('[UserData] Failed to get user documents:', error);
    return [];
  }
}

export async function getDocumentOwner(docId: string): Promise<string | null> {
  try {
    return await kv.get<string>(`doc:${docId}:owner`);
  } catch (error) {
    console.error('[UserData] Failed to get document owner:', error);
    return null;
  }
}

export async function unlinkDocumentFromUser(email: string, docId: string): Promise<void> {
  try {
    await kv.srem(`user:${email}:documents`, docId);
    await kv.del(`doc:${docId}:owner`);
    console.log('[UserData] Document unlinked from user:', docId, email);
  } catch (error) {
    console.error('[UserData] Failed to unlink document:', error);
    throw error;
  }
}
