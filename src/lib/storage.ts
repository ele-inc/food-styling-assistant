import { Session, Message, Product } from '@/types';

const SESSIONS_KEY = 'food-styling-sessions';

// セッション一覧を取得
export function getSessions(): Session[] {
  if (typeof window === 'undefined') return [];
  
  const data = localStorage.getItem(SESSIONS_KEY);
  if (!data) return [];
  
  try {
    const sessions = JSON.parse(data);
    return sessions.map((s: Session) => ({
      ...s,
      createdAt: new Date(s.createdAt),
      updatedAt: new Date(s.updatedAt),
      messages: s.messages.map((m: Message) => ({
        ...m,
        timestamp: new Date(m.timestamp),
      })),
    }));
  } catch {
    return [];
  }
}

// セッションを保存
export function saveSession(session: Session): void {
  if (typeof window === 'undefined') return;
  
  const sessions = getSessions();
  const existingIndex = sessions.findIndex(s => s.id === session.id);
  
  if (existingIndex >= 0) {
    sessions[existingIndex] = session;
  } else {
    sessions.unshift(session);
  }
  
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

// セッションを取得
export function getSession(id: string): Session | null {
  const sessions = getSessions();
  return sessions.find(s => s.id === id) || null;
}

// セッションを削除
export function deleteSession(id: string): void {
  if (typeof window === 'undefined') return;
  
  const sessions = getSessions().filter(s => s.id !== id);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

// 新しいセッションを作成
export function createSession(): Session {
  const now = new Date();
  return {
    id: crypto.randomUUID(),
    title: `撮影プラン ${now.toLocaleDateString('ja-JP')}`,
    products: [],
    messages: [],
    createdAt: now,
    updatedAt: now,
    isCompleted: false,
  };
}

// メッセージを追加
export function addMessage(session: Session, message: Omit<Message, 'id' | 'timestamp'>): Session {
  const newMessage: Message = {
    ...message,
    id: crypto.randomUUID(),
    timestamp: new Date(),
  };
  
  return {
    ...session,
    messages: [...session.messages, newMessage],
    updatedAt: new Date(),
  };
}

// 商品を追加
export function addProduct(session: Session, product: Omit<Product, 'id'>): Session {
  const newProduct: Product = {
    ...product,
    id: crypto.randomUUID(),
  };
  
  return {
    ...session,
    products: [...session.products, newProduct],
    updatedAt: new Date(),
  };
}

// 商品を更新
export function updateProduct(session: Session, productId: string, updates: Partial<Product>): Session {
  return {
    ...session,
    products: session.products.map(p => 
      p.id === productId ? { ...p, ...updates } : p
    ),
    updatedAt: new Date(),
  };
}
