import Dexie, { Table } from 'dexie';
import { Message, Conversation } from '../store/AppContext';

export class AuraDatabase extends Dexie {
  conversations!: Table<Conversation>;
  messages!: Table<Message & { conversationId: string }>;

  constructor() {
    super('AuraAI_DB');
    this.version(1).stores({
      conversations: 'id, title, updatedAt, expertId',
      messages: 'id, conversationId, role, timestamp'
    });
  }
}

export const db = new AuraDatabase();

db.on('blocked', () => {
  console.warn('Dexie database is blocked');
});

db.on('versionchange', () => {
  console.warn('Dexie database version change detected');
  db.close();
});

db.open().catch((err) => {
  console.error('Failed to open Dexie database:', err);
});

export const saveConversation = async (conv: Conversation) => {
  await db.conversations.put(conv);
};

export const saveMessage = async (convId: string, msg: Message) => {
  await db.messages.put({ ...msg, conversationId: convId });
};

export const getConversations = async () => {
  return await db.conversations.orderBy('updatedAt').reverse().toArray();
};

export const getMessages = async (convId: string) => {
  return await db.messages.where('conversationId').equals(convId).sortBy('timestamp');
};

export const deleteConversation = async (convId: string) => {
  await db.transaction('rw', db.conversations, db.messages, async () => {
    await db.conversations.delete(convId);
    await db.messages.where('conversationId').equals(convId).delete();
  });
};

export const clearAllHistory = async () => {
  await db.conversations.clear();
  await db.messages.clear();
};

export const clearOldHistory = async (days: number) => {
  const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;
  
  await db.transaction('rw', db.conversations, db.messages, async () => {
    const oldConvs = await db.conversations.where('updatedAt').below(cutoffTime).toArray();
    const oldConvIds = oldConvs.map(c => c.id);
    
    await db.conversations.bulkDelete(oldConvIds);
    await db.messages.where('conversationId').anyOf(oldConvIds).delete();
  });
};
