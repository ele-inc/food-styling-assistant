import { GoogleGenerativeAI, Part } from '@google/generative-ai';

const SYSTEM_PROMPT = `あなたは、フードスタイリストのまゆみ様（ユーザー）を支える専属アシスタントです。
まゆみ様はプロです。現場で使える「リアルな提案」と「段取りの良さ」が求められます。

## ワークフロー

1つの商品につき「分析→提案→決定→画像生成」のサイクルを回し、**全ての商品が終わったら最後に「まとめの表」を出力**します。

## フェーズ1：商品分析と提案

商品画像や名前を受け取ったら、以下を行います。

1. **現状分析:** パッケージ写真等から「中身の形状（切り身、丸ごと、液体など）」を特定する。
2. **提案:** その形状に合うスタイリングをランキング形式（案A〜E）で5つ提案する。

提案は以下のJSON形式で出力してください：
\`\`\`json
{
  "analysis": "形状の分析結果",
  "proposals": [
    {
      "id": "A",
      "title": "提案タイトル",
      "description": "詳細な説明",
      "menuMaterial": "メニュー・使用する材料",
      "equipment": "お皿・小物などの資材"
    }
  ]
}
\`\`\`

## フェーズ2：決定と画像生成

ユーザーが「Aで」と案を選んだら：
1. 「了解です！」と短く承認。
2. 「**この案で完成イメージ画像を作ってみましょうか？**」と提案。
3. GOが出たら、**分析した形状を忠実に守った**プロンプトで画像を生成・表示する。

画像生成時は以下のJSON形式で出力：
\`\`\`json
{
  "action": "generate_image",
  "prompt": "画像生成用の英語プロンプト"
}
\`\`\`

## フェーズ3：ループまたは終了確認

1つの商品が終わったら、「**次の商品はありますか？** なければ『終わり』と言ってください」と確認する。

## フェーズ4：最終まとめ（重要）

ユーザーが「終わり」や「以上」と言ったら、**これまで決定した全商品の内容**を1枚の表にまとめ、買い物リストを添えて出力する。

出力フォーマット：
\`\`\`json
{
  "action": "summary",
  "summary": {
    "table": [
      {
        "productName": "商品名",
        "menuMaterial": "選んだ案名と具体的な盛り付け・食材",
        "equipment": "具体的なお皿・小物"
      }
    ],
    "shoppingList": ["買い足しが必要なもの"],
    "equipmentList": ["使うお皿や小物類すべて"]
  }
}
\`\`\`

## 注意事項
- 通常の会話では普通に日本語で応答してください
- JSON形式は上記の特定のアクション時のみ使用してください
- 親しみやすく、プロフェッショナルな口調で対応してください`;

export async function createGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }
  return new GoogleGenerativeAI(apiKey);
}

export async function generateChatResponse(
  client: GoogleGenerativeAI,
  messages: Array<{ role: 'user' | 'assistant'; content: string; imageBase64?: string }>,
) {
  const model = client.getGenerativeModel({ 
    model: 'gemini-2.0-flash-exp',
    systemInstruction: SYSTEM_PROMPT,
  });

  const chat = model.startChat({
    history: messages.slice(0, -1).map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    })),
  });

  const lastMessage = messages[messages.length - 1];
  const parts: Part[] = [];

  if (lastMessage.imageBase64) {
    parts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: lastMessage.imageBase64,
      },
    });
  }
  parts.push({ text: lastMessage.content });

  const result = await chat.sendMessage(parts);
  return result.response.text();
}

export async function generateImage(
  client: GoogleGenerativeAI,
  prompt: string,
): Promise<string | null> {
  try {
    // Gemini 2.0 Flash の画像生成機能を使用
    const model = client.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
    });

    const imagePrompt = `Create a professional food photography image: ${prompt}
    
Style: High-end food magazine quality, natural lighting, shallow depth of field, 
appetizing presentation, clean and elegant styling.`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: imagePrompt }] }],
      generationConfig: {
        // @ts-expect-error - Gemini 2.0 Flash supports image generation
        responseModalities: ['image', 'text'],
      },
    });

    const response = result.response;
    const parts = response.candidates?.[0]?.content?.parts || [];

    for (const part of parts) {
      const inlineData = (part as { inlineData?: { data?: string } }).inlineData;
      if (inlineData?.data) {
        return inlineData.data;
      }
    }

    return null;
  } catch (error) {
    console.error('Image generation error:', error);
    return null;
  }
}
