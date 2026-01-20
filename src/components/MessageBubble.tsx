"use client";

import { Bot, User, Wand2 } from "lucide-react";
import Image from "next/image";
import type { Message } from "@/types";

interface MessageBubbleProps {
	message: Message;
	onGenerateImage?: () => void;
	isGenerating?: boolean;
}

// マークダウンの太字（**text**）を処理する関数
function formatContent(content: string): React.ReactNode[] {
	const parts = content.split(/(\*\*[^*]+\*\*)/g);
	return parts.map((part, index) => {
		if (part.startsWith("**") && part.endsWith("**")) {
			// 太字部分
			return (
				<strong key={index} className="font-semibold">
					{part.slice(2, -2)}
				</strong>
			);
		}
		return part;
	});
}

// 画像生成の提案かどうかをチェック
function hasImageGenerationPrompt(content: string): boolean {
	return (
		content.includes("完成イメージ画像を作って") ||
		content.includes("画像を作ってみましょうか")
	);
}

export default function MessageBubble({
	message,
	onGenerateImage,
	isGenerating,
}: MessageBubbleProps) {
	const isUser = message.role === "user";
	const showGenerateButton =
		!isUser && hasImageGenerationPrompt(message.content) && onGenerateImage;

	return (
		<div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
			{/* アイコン */}
			<div
				className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
					isUser
						? "bg-primary-100 text-primary-600"
						: "bg-accent-100 text-accent-600"
				}`}
			>
				{isUser ? <User size={20} /> : <Bot size={20} />}
			</div>

			{/* メッセージ内容 */}
			<div
				className={`max-w-[70%] rounded-2xl px-4 py-3 ${
					isUser
						? "bg-primary-500 text-white rounded-tr-md"
						: "bg-white border border-gray-200 text-gray-800 rounded-tl-md shadow-sm"
				}`}
			>
				{/* ユーザーがアップロードした画像 */}
				{message.imageUrl && (
					<div className="mb-3">
						<Image
							src={message.imageUrl}
							alt="アップロード画像"
							width={300}
							height={200}
							className="w-full max-w-full h-auto rounded-lg object-cover"
						/>
					</div>
				)}

				{/* テキスト内容（マークダウン処理済み） */}
				<div className="whitespace-pre-wrap text-sm leading-relaxed">
					{formatContent(message.content)}
				</div>

				{/* 画像生成ボタン */}
				{showGenerateButton && (
					<button
						onClick={onGenerateImage}
						disabled={isGenerating}
						className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<Wand2 size={18} className={isGenerating ? "animate-spin" : ""} />
						{isGenerating ? "生成中..." : "完成イメージを生成する"}
					</button>
				)}

				{/* AI生成画像 */}
				{message.generatedImageUrl && (
					<div className="mt-3">
						<Image
							src={message.generatedImageUrl}
							alt="生成画像"
							width={400}
							height={300}
							className="w-full max-w-full h-auto rounded-lg object-cover border border-gray-100"
						/>
					</div>
				)}

				{/* タイムスタンプ */}
				<div
					className={`text-xs mt-2 ${
						isUser ? "text-primary-200" : "text-gray-400"
					}`}
				>
					{message.timestamp.toLocaleTimeString("ja-JP", {
						hour: "2-digit",
						minute: "2-digit",
					})}
				</div>
			</div>
		</div>
	);
}
