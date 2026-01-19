// メッセージの種類
export type MessageRole = 'user' | 'assistant';

// メッセージ
export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  imageUrl?: string;        // ユーザーがアップロードした画像
  generatedImageUrl?: string; // AIが生成した画像
  timestamp: Date;
}

// 商品情報
export interface Product {
  id: string;
  name: string;
  imageUrl?: string;
  shape: string;           // 形状（切り身、丸ごと、液体など）
  selectedProposal?: Proposal;
  generatedImageUrl?: string;
}

// スタイリング提案
export interface Proposal {
  id: string;              // 案A, 案B, 案C, 案D, 案E
  title: string;           // 提案タイトル
  description: string;     // 詳細説明
  menuMaterial: string;    // メニュー・材料メモ
  equipment: string;       // 資材（お皿・小物）
}

// セッション（1回の撮影プラン）
export interface Session {
  id: string;
  title: string;
  products: Product[];
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  isCompleted: boolean;
}

// アプリの状態
export interface AppState {
  currentPhase: Phase;
  currentProduct: Product | null;
  proposals: Proposal[];
}

// フェーズ
export type Phase =
  | 'waiting'              // 商品待ち
  | 'analyzing'            // 分析中
  | 'proposing'            // 提案表示
  | 'awaiting_selection'   // 選択待ち
  | 'generating_image'     // 画像生成中
  | 'awaiting_next'        // 次の商品確認
  | 'summarizing';         // まとめ作成中

// API リクエスト
export interface ChatRequest {
  messages: Array<{
    role: MessageRole;
    content: string;
    imageBase64?: string;
  }>;
  sessionProducts?: Product[];
}

// API レスポンス
export interface ChatResponse {
  message: string;
  generatedImageBase64?: string;
  proposals?: Proposal[];
  phase?: Phase;
}
