import { type NextRequest, NextResponse } from "next/server";
import {
	createGeminiClient,
	generateChatResponse,
	generateImage,
} from "@/lib/gemini";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { messages, generateImagePrompt, mode = "ohisama" } = body;

		const client = await createGeminiClient();

		// 画像生成リクエストの場合
		if (generateImagePrompt) {
			const imageBase64 = await generateImage(client, generateImagePrompt);

			if (imageBase64) {
				return NextResponse.json({
					success: true,
					imageBase64,
				});
			} else {
				return NextResponse.json({
					success: false,
					error:
						"画像の生成に失敗しました。別のプロンプトで試してみてください。",
				});
			}
		}

		// チャットリクエストの場合
		if (!messages || !Array.isArray(messages)) {
			return NextResponse.json(
				{ error: "messages is required" },
				{ status: 400 },
			);
		}

		const response = await generateChatResponse(client, messages, mode);

		return NextResponse.json({
			success: true,
			message: response,
		});
	} catch (error) {
		console.error("API Error:", error);

		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";

		if (errorMessage.includes("API_KEY")) {
			return NextResponse.json(
				{
					error:
						"Gemini API キーが設定されていません。.env.local ファイルを確認してください。",
				},
				{ status: 500 },
			);
		}

		return NextResponse.json(
			{ error: `エラーが発生しました: ${errorMessage}` },
			{ status: 500 },
		);
	}
}
