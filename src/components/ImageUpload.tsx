"use client";

import { Camera, ImagePlus, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";

interface ImageUploadProps {
	onImageSelect: (imageBase64: string, imageUrl: string) => void;
	selectedImage: string | null;
	onClear: () => void;
}

export default function ImageUpload({
	onImageSelect,
	selectedImage,
	onClear,
}: ImageUploadProps) {
	const [isDragging, setIsDragging] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const processFile = useCallback(
		(file: File) => {
			if (!file.type.startsWith("image/")) {
				alert("画像ファイルを選択してください");
				return;
			}

			const reader = new FileReader();
			reader.onload = (e) => {
				const result = e.target?.result as string;
				// data:image/jpeg;base64,xxxx から base64 部分を抽出
				const base64 = result.split(",")[1];
				onImageSelect(base64, result);
			};
			reader.readAsDataURL(file);
		},
		[onImageSelect],
	);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			setIsDragging(false);

			const file = e.dataTransfer.files[0];
			if (file) {
				processFile(file);
			}
		},
		[processFile],
	);

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = () => {
		setIsDragging(false);
	};

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			processFile(file);
		}
	};

	if (selectedImage) {
		return (
			<div className="relative inline-block">
				<Image
					src={selectedImage}
					alt="選択した画像"
					width={120}
					height={80}
					className="rounded-lg object-cover border border-gray-200"
				/>
				<button
					onClick={onClear}
					className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
				>
					<X size={14} />
				</button>
			</div>
		);
	}

	return (
		<div
			onDrop={handleDrop}
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onClick={() => fileInputRef.current?.click()}
			className={`
        w-full h-32 border-2 border-dashed rounded-xl cursor-pointer
        flex flex-col items-center justify-center gap-2 transition-all
        ${
					isDragging
						? "border-primary-500 bg-primary-50"
						: "border-gray-300 hover:border-primary-400 hover:bg-gray-50"
				}
      `}
		>
			<input
				ref={fileInputRef}
				type="file"
				accept="image/*"
				onChange={handleFileSelect}
				className="hidden"
			/>
			<div className="flex items-center gap-3 text-gray-500">
				<Camera size={24} />
				<ImagePlus size={24} />
			</div>
			<p className="text-sm text-gray-500">
				商品画像をドラッグ＆ドロップ、またはクリックして選択
			</p>
		</div>
	);
}
