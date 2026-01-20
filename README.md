# フードスタイリング アシスタント

プロのフードスタイリスト（まゆみ様）専用の撮影プラン作成ツールです。

## 2つのモード

### おひさま通信（週次）
- コープ商品の紹介チラシ用の撮影
- 商品の魅力が伝わる盛り合わせ画像を作成
- 買い物リスト＆資材リスト自動生成

### コープレター（月次）
- 表紙デザイン用の撮影
- テーマ食材を使った料理提案
- レシピも一緒に作成
- 食材が明確に見える盛り付け

## 機能

- **ユーザー認証**: メール/パスワードでログイン
- **クラウド同期**: Mac/iPad/iPhoneどこからでも同じデータにアクセス
- **商品分析**: 画像から形状を自動分析
- **スタイリング提案**: 5つの案をランキング形式で提案
- **画像生成**: 完成イメージをAIで生成
- **レシピ作成**: コープレター用にレシピも自動生成
- **まとめ出力**: 撮影プランを表形式でまとめ

---

## セットアップ

### 1. 環境変数の設定

`.env.local.example` をコピーして `.env.local` を作成：

```bash
cp .env.local.example .env.local
```

各環境変数を設定します：

| 変数名 | 説明 | 取得方法 |
|--------|------|----------|
| `DATABASE_URL` | Neon PostgreSQL接続文字列 | [Neon Console](https://console.neon.tech) でプロジェクト作成後、Connection Stringをコピー |
| `AUTH_SECRET` | NextAuth.js用シークレット | `openssl rand -base64 32` で生成 |
| `GEMINI_API_KEY` | Gemini API キー | [Google AI Studio](https://aistudio.google.com/app/apikey) で作成 |

### 2. データベースのセットアップ

[Neon](https://neon.tech) でプロジェクトを作成し、スキーマを適用：

```bash
npx drizzle-kit push
```

### 3. 依存関係のインストールと起動

```bash
npm install
npm run dev
```

http://localhost:3000 でアプリが起動します。

---

## Vercel へのデプロイ

### 1. GitHubにプッシュ

```bash
git add .
git commit -m "Initial commit"
git push
```

### 2. Vercel でインポート

1. https://vercel.com にログイン
2. 「Add New」→「Project」
3. GitHubリポジトリを選択

### 3. 環境変数の設定

Vercel の「Settings」→「Environment Variables」で以下を追加：

- `DATABASE_URL` - Neonの接続文字列
- `AUTH_SECRET` - `openssl rand -base64 32` で生成した値
- `GEMINI_API_KEY` - Google AI StudioのAPIキー

### 4. デプロイ

「Deploy」をクリック。完了後、URLが発行されます。

---

## 使い方

### 初回利用
1. ログイン画面でメールアドレスとパスワードを入力
2. 初回ログイン時は自動的にアカウントが作成されます

### おひさま通信の流れ
1. モード選択で「おひさま通信」を選択
2. 商品画像をアップロード、または商品名を入力
3. 5つの提案から気に入った案をクリック
4. 「お願いします」「GO」で完成イメージを生成
5. 「次の商品」または「終わり」で進行
6. 最後に撮影プランと買い物リストを出力

### コープレターの流れ
1. モード選択で「コープレター」を選択
2. 今月のテーマ食材を入力（例：鮭、きのこ）
3. 料理提案から選択
4. 完成イメージを生成
5. レシピが自動作成される
6. 「終わり」でまとめを出力

---

## 技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **AI**: Gemini 2.0 Flash (テキスト生成 + 画像生成)
- **認証**: NextAuth.js v5
- **DB**: Neon (Serverless Postgres) + Drizzle ORM
- **ホスティング**: Vercel

## ライセンス

Private - All rights reserved
