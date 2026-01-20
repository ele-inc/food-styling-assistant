import { NextRequest, NextResponse } from "next/server";
import {
	createGeminiClient,
	generateChatResponse,
	generateImage,
} from "@/lib/gemini";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		// 画像生成リクエスト
		if (body.generateImagePrompt) {
			const client = await createGeminiClient();
			const imageBase64 = await generateImage(client, body.generateImagePrompt);

			if (imageBase64) {
				return NextResponse.json({
					success: true,
					imageBase64,
				});
			}
			return NextResponse.json({
				success: false,
				error: "画像の生成に失敗しました",
			});
		}

		// チャットリクエスト
		const { messages, mode } = body;

		if (!messages || !Array.isArray(messages)) {
			return NextResponse.json(
				{ error: "messages is required" },
				{ status: 400 },
			);
		}

		const client = await createGeminiClient();
		const response = await generateChatResponse(client, messages, mode);

		return NextResponse.json({ message: response });
	} catch (error) {
		console.error("Chat API error:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
}
