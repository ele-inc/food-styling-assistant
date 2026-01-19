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

### 1. Supabase プロジェクトの作成

1. https://supabase.com にアクセスしてアカウント作成
2. 「New Project」をクリック
3. プロジェクト名を入力（例: food-styling-assistant）
4. パスワードを設定
5. リージョンを選択（Tokyo推奨）
6. 「Create new project」をクリック

### 2. データベーステーブルの作成

1. Supabase Dashboard の「SQL Editor」を開く
2. `supabase-setup.sql` の内容をコピー＆ペースト
3. 「Run」をクリックして実行

### 3. Supabase の認証設定

1. Dashboard の「Authentication」→「Providers」
2. 「Email」が有効になっていることを確認
3. （オプション）「Confirm email」をオフにすると、メール確認なしでログイン可能

### 4. API キーの取得

**Supabase:**
1. Dashboard の「Settings」→「API」
2. 「Project URL」をコピー → `NEXT_PUBLIC_SUPABASE_URL`
3. 「anon public」キーをコピー → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Gemini:**
1. https://aistudio.google.com/app/apikey にアクセス
2. 「APIキーを作成」をクリック
3. キーをコピー → `GEMINI_API_KEY`

### 5. 環境変数の設定

プロジェクトルートに `.env.local` ファイルを作成：

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
GEMINI_API_KEY=AIzaSy...
```

### 6. 依存関係のインストールと起動

```bash
cd food-styling-assistant
npm install
npm run dev
```

http://localhost:3000 でアプリが起動します。

---

## Vercel へのデプロイ

### 1. GitHubにプッシュ

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/food-styling-assistant.git
git push -u origin main
```

### 2. Vercel でインポート

1. https://vercel.com にログイン
2. 「Add New」→「Project」
3. GitHubリポジトリを選択

### 3. 環境変数の設定

Vercel の「Settings」→「Environment Variables」で以下を追加：

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `GEMINI_API_KEY`

### 4. デプロイ

「Deploy」をクリック。完了後、URLが発行されます。

---

## 使い方

### 初回利用
1. ログイン画面で「新規登録」タブを選択
2. メールアドレスとパスワードを入力
3. 「登録する」をクリック

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

- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **AI**: Gemini 2.0 Flash (テキスト生成 + 画像生成)
- **認証・DB**: Supabase
- **ホスティング**: Vercel

## ライセンス

Private - All rights reserved
