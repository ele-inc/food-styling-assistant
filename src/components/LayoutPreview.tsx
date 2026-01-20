"use client";

import { Check, Layout, RefreshCw } from "lucide-react";
import Image from "next/image";

interface DishImage {
	order: number;
	name: string;
	imageUrl: string;
}

interface LayoutPreviewProps {
	dishImages: DishImage[];
	layoutImageUrl?: string;
	onConfirm: () => void;
	onRegenerate?: () => void;
	isLoading?: boolean;
}

export default function LayoutPreview({
	dishImages,
	layoutImageUrl,
	onConfirm,
	onRegenerate,
	isLoading = false,
}: LayoutPreviewProps) {
	return (
		<div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
			<div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-3">
				<h3 className="font-semibold text-white flex items-center gap-2">
					<Layout size={20} />
					表紙レイアウトプレビュー
				</h3>
			</div>

			<div className="p-4">
				{/* 3品の個別画像 */}
				<div className="mb-4">
					<p className="text-sm text-gray-600 mb-2">選択した3品</p>
					<div className="grid grid-cols-3 gap-2">
						{dishImages.map((dish) => (
							<div key={dish.order} className="relative">
								<div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
									{dish.imageUrl ? (
										<Image
											src={dish.imageUrl}
											alt={dish.name}
											fill
											className="object-cover"
										/>
									) : (
										<div className="w-full h-full flex items-center justify-center text-gray-400">
											<span className="text-2xl">🍽️</span>
										</div>
									)}
								</div>
								<div className="absolute top-1 left-1 w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
									{dish.order}
								</div>
								<p className="text-xs text-gray-600 mt-1 truncate">
									{dish.name}
								</p>
							</div>
						))}
					</div>
				</div>

				{/* 最終レイアウト画像 */}
				{layoutImageUrl && (
					<div className="mb-4">
						<p className="text-sm text-gray-600 mb-2">表紙レイアウトイメージ</p>
						<div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 border-2 border-emerald-200">
							<Image
								src={layoutImageUrl}
								alt="表紙レイアウト"
								fill
								className="object-cover"
							/>
						</div>
					</div>
				)}

				{/* ローディング */}
				{isLoading && (
					<div className="flex items-center justify-center py-8">
						<div className="flex items-center gap-3 text-emerald-600">
							<RefreshCw size={20} className="animate-spin" />
							<span>レイアウト画像を生成中...</span>
						</div>
					</div>
				)}

				{/* アクションボタン */}
				{layoutImageUrl && !isLoading && (
					<div className="flex gap-2">
						{onRegenerate && (
							<button
								onClick={onRegenerate}
								className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
							>
								<RefreshCw size={16} />
								再生成
							</button>
						)}
						<button
							onClick={onConfirm}
							className="flex-1 px-4 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
						>
							<Check size={16} />
							このレイアウトでOK
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
