import { GoogleGenerativeAI, type Part } from "@google/generative-ai";
import { getPromptByMode } from "./prompts";

export async function createGeminiClient() {
	const apiKey = process.env.GEMINI_API_KEY;
	if (!apiKey) {
		throw new Error("GEMINI_API_KEY is not configured");
	}
	return new GoogleGenerativeAI(apiKey);
}

export async function generateChatResponse(
	client: GoogleGenerativeAI,
	messages: Array<{
		role: "user" | "assistant";
		content: string;
		imageBase64?: string;
	}>,
	mode: "ohisama" | "coop_letter" = "ohisama",
) {
	const systemPrompt = getPromptByMode(mode);

	const model = client.getGenerativeModel({
		model: "gemini-3-pro-preview",
		systemInstruction: systemPrompt,
	});

	const chat = model.startChat({
		history: messages.slice(0, -1).map((m) => ({
			role: m.role === "user" ? "user" : "model",
			parts: [{ text: m.content }],
		})),
	});

	const lastMessage = messages[messages.length - 1];
	const parts: Part[] = [];

	if (lastMessage.imageBase64) {
		parts.push({
			inlineData: {
				mimeType: "image/jpeg",
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
		// Gemini 2.0 Flash の画像生成機能を使用（Imagen 3ベース）
		const model = client.getGenerativeModel({
			model: "gemini-3-pro-image-preview",
		});

		const imagePrompt = `Create a professional food photography image: ${prompt}

Composition: Wider framing that includes surrounding props and table setting,
avoid extreme close-ups, leave some breathing room around the main dish.
Style: High-end food magazine quality, natural lighting, shallow depth of field,
appetizing presentation, clean and elegant styling.`;

		const result = await model.generateContent({
			contents: [{ role: "user", parts: [{ text: imagePrompt }] }],
			generationConfig: {
				// @ts-expect-error - Gemini 2.0 Flash supports image generation
				responseModalities: ["image", "text"],
			},
		});

		const response = result.response;
		const parts = response.candidates?.[0]?.content?.parts || [];

		for (const part of parts) {
			const inlineData = (part as { inlineData?: { data?: string } })
				.inlineData;
			if (inlineData?.data) {
				return inlineData.data;
			}
		}

		return null;
	} catch (error) {
		console.error("Image generation error:", error);
		return null;
	}
}
