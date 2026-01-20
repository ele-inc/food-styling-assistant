import type { NextApiRequest, NextApiResponse } from "next";
import {
	createGeminiClient,
	generateChatResponse,
	generateImage,
} from "@/lib/gemini";

const RETRY_DELAYS_MS = [700, 1400];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isRateLimitError = (message: string) =>
	message.includes("429") ||
	message.toLowerCase().includes("resource exhausted");

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if (req.method !== "POST") {
		res.setHeader("Allow", ["POST"]);
		return res.status(405).json({ error: "Method not allowed" });
	}

	try {
		const { messages, generateImagePrompt, mode = "ohisama" } = req.body ?? {};

		const client = await createGeminiClient();

		for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
			try {
				if (generateImagePrompt) {
					const imageBase64 = await generateImage(client, generateImagePrompt);

					if (imageBase64) {
						return res.status(200).json({
							success: true,
							imageBase64,
						});
					}

					return res.status(200).json({
						success: false,
						error:
							"画像の生成に失敗しました。別のプロンプトで試してみてください。",
					});
				}

				if (!messages || !Array.isArray(messages)) {
					return res.status(400).json({ error: "messages is required" });
				}

				const response = await generateChatResponse(client, messages, mode);

				return res.status(200).json({
					success: true,
					message: response,
				});
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : "Unknown error";

				if (
					isRateLimitError(errorMessage) &&
					attempt < RETRY_DELAYS_MS.length
				) {
					await sleep(RETRY_DELAYS_MS[attempt]);
					continue;
				}

				if (isRateLimitError(errorMessage)) {
					return res.status(429).json({
						error:
							"ただいまアクセスが集中しています。30秒ほど待ってから再度お試しください。",
					});
				}

				throw error;
			}
		}
	} catch (error) {
		console.error("API Error:", error);

		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";

		if (errorMessage.includes("API_KEY")) {
			return res.status(500).json({
				error:
					"Gemini API キーが設定されていません。.env.local ファイルを確認してください。",
			});
		}

		return res.status(500).json({
			error: `エラーが発生しました: ${errorMessage}`,
		});
	}
}
