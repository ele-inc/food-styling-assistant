"use client";

import { Image as ImageIcon, Loader2, Send } from "lucide-react";
import { useState } from "react";
import ImageUpload from "./ImageUpload";

interface ChatInputProps {
	onSend: (message: string, imageBase64?: string, imageUrl?: string) => void;
	isLoading: boolean;
	placeholder?: string;
}

export default function ChatInput({
	onSend,
	isLoading,
	placeholder = "商品名を入力、または画像をアップロードしてください",
}: ChatInputProps) {
	const [message, setMessage] = useState("");
	const [showImageUpload, setShowImageUpload] = useState(false);
	const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(
		null,
	);
	const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if ((!message.trim() && !selectedImageBase64) || isLoading) return;

		// 送信前に値を保存してからクリア
		const messageToSend = message.trim() || "商品の分析をお願いします";
		const imageBase64ToSend = selectedImageBase64;
		const imageUrlToSend = selectedImageUrl;

		// 即座にクリア
		setMessage("");
		setSelectedImageBase64(null);
		setSelectedImageUrl(null);
		setShowImageUpload(false);

		// 送信
		onSend(
			messageToSend,
			imageBase64ToSend || undefined,
			imageUrlToSend || undefined,
		);
	};

	const handleImageSelect = (base64: string, url: string) => {
		setSelectedImageBase64(base64);
		setSelectedImageUrl(url);
	};

	const handleClearImage = () => {
		setSelectedImageBase64(null);
		setSelectedImageUrl(null);
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="bg-white border-t border-gray-200 p-4"
		>
			{/* 画像アップロードエリア */}
			{showImageUpload && (
				<div className="mb-4">
					<ImageUpload
						onImageSelect={handleImageSelect}
						selectedImage={selectedImageUrl}
						onClear={handleClearImage}
					/>
				</div>
			)}

			{/* 選択された画像のプレビュー（コンパクト表示） */}
			{selectedImageUrl && !showImageUpload && (
				<div className="mb-3 flex items-center gap-2">
					<img
						src={selectedImageUrl}
						alt="選択画像"
						className="w-16 h-16 rounded-lg object-cover border border-gray-200"
					/>
					<button
						type="button"
						onClick={handleClearImage}
						className="text-sm text-red-500 hover:text-red-600"
					>
						削除
					</button>
				</div>
			)}

			{/* 入力エリア */}
			<div className="flex items-end gap-2">
				{/* 画像ボタン */}
				<button
					type="button"
					onClick={() => setShowImageUpload(!showImageUpload)}
					className={`
            p-3 rounded-xl transition-colors
            ${
							showImageUpload || selectedImageUrl
								? "bg-primary-100 text-primary-600"
								: "bg-gray-100 text-gray-500 hover:bg-gray-200"
						}
          `}
				>
					<ImageIcon size={20} />
				</button>

				{/* テキスト入力 */}
				<div className="flex-1 relative">
					<textarea
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						onKeyDown={(e) => {
							// IME入力中（日本語変換中）は何もしない
							if (e.nativeEvent.isComposing) return;

							// Enterキーで送信（Shift+Enterは改行）
							if (e.key === "Enter" && !e.shiftKey) {
								e.preventDefault();
								if ((message.trim() || selectedImageBase64) && !isLoading) {
									handleSubmit(e);
								}
							}
						}}
						placeholder={placeholder}
						rows={1}
						className="w-full px-4 py-3 bg-gray-100 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
						style={{ minHeight: "48px", maxHeight: "120px" }}
					/>
				</div>

				{/* 送信ボタン */}
				<button
					type="submit"
					disabled={(!message.trim() && !selectedImageBase64) || isLoading}
					className={`
            p-3 rounded-xl transition-all
            ${
							(!message.trim() && !selectedImageBase64) || isLoading
								? "bg-gray-200 text-gray-400 cursor-not-allowed"
								: "bg-primary-500 text-white hover:bg-primary-600 shadow-md hover:shadow-lg"
						}
          `}
				>
					{isLoading ? (
						<Loader2 size={20} className="animate-spin" />
					) : (
						<Send size={20} />
					)}
				</button>
			</div>

			{/* ヒント */}
			<p className="text-xs text-gray-400 mt-2 text-center">
				Enterで送信 / Shift+Enterで改行
			</p>
		</form>
	);
}
