"use client";

import { Check, ChevronRight, Copy, Package, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export interface EquipmentItem {
	name: string;
	quantity: string;
	category: "plate" | "utensil" | "prop" | "food" | "other";
	imageUrl?: string;
	description?: string;
}

interface EquipmentListProps {
	items: EquipmentItem[];
	onProceedToNext: () => void;
}

const CATEGORY_LABELS: Record<
	EquipmentItem["category"],
	{ label: string; color: string }
> = {
	plate: { label: "お皿", color: "bg-blue-100 text-blue-700" },
	utensil: { label: "カトラリー", color: "bg-amber-100 text-amber-700" },
	prop: { label: "小物", color: "bg-purple-100 text-purple-700" },
	food: { label: "食材", color: "bg-green-100 text-green-700" },
	other: { label: "その他", color: "bg-gray-100 text-gray-700" },
};

export default function EquipmentList({
	items,
	onProceedToNext,
}: EquipmentListProps) {
	const [copied, setCopied] = useState(false);
	const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

	const handleCopyList = () => {
		const text = items
			.map(
				(item) =>
					`□ ${item.name}：${item.quantity}${item.description ? `（${item.description}）` : ""}`,
			)
			.join("\n");

		navigator.clipboard.writeText(`【用意するもの】\n${text}`);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const toggleItem = (index: number) => {
		const newChecked = new Set(checkedItems);
		if (newChecked.has(index)) {
			newChecked.delete(index);
		} else {
			newChecked.add(index);
		}
		setCheckedItems(newChecked);
	};

	// カテゴリ別にグループ化
	const groupedItems = items.reduce(
		(acc, item, index) => {
			if (!acc[item.category]) {
				acc[item.category] = [];
			}
			acc[item.category].push({ ...item, originalIndex: index });
			return acc;
		},
		{} as Record<string, (EquipmentItem & { originalIndex: number })[]>,
	);

	return (
		<div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
			{/* ヘッダー */}
			<div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2 text-white">
						<Package size={24} />
						<h2 className="text-lg font-bold">用意するもの</h2>
					</div>
					<button
						onClick={handleCopyList}
						className="flex items-center gap-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm transition-colors"
					>
						{copied ? <Check size={16} /> : <Copy size={16} />}
						{copied ? "コピー済み" : "リストをコピー"}
					</button>
				</div>
				<p className="text-indigo-100 text-sm mt-1">
					チェックを入れながら準備を進めましょう
				</p>
			</div>

			{/* アイテムリスト */}
			<div className="p-4 space-y-6">
				{Object.entries(groupedItems).map(([category, categoryItems]) => (
					<div key={category}>
						<div className="flex items-center gap-2 mb-3">
							<span
								className={`px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_LABELS[category as EquipmentItem["category"]]?.color}`}
							>
								{CATEGORY_LABELS[category as EquipmentItem["category"]]?.label}
							</span>
							<span className="text-xs text-gray-400">
								{categoryItems.length}点
							</span>
						</div>

						<div className="space-y-2">
							{categoryItems.map((item) => (
								<div
									key={item.originalIndex}
									onClick={() => toggleItem(item.originalIndex)}
									className={`
                    flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all
                    ${
											checkedItems.has(item.originalIndex)
												? "border-green-300 bg-green-50"
												: "border-gray-200 hover:border-gray-300 bg-white"
										}
                  `}
								>
									{/* チェックボックス */}
									<div
										className={`
                      w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                      ${
												checkedItems.has(item.originalIndex)
													? "border-green-500 bg-green-500"
													: "border-gray-300"
											}
                    `}
									>
										{checkedItems.has(item.originalIndex) && (
											<Check size={14} className="text-white" />
										)}
									</div>

									{/* 画像 */}
									{item.imageUrl && (
										<div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
											<Image
												src={item.imageUrl}
												alt={item.name}
												width={64}
												height={64}
												className="w-full h-full object-cover"
											/>
										</div>
									)}

									{/* テキスト */}
									<div className="flex-1 min-w-0">
										<div className="flex items-baseline gap-2">
											<span
												className={`font-medium ${checkedItems.has(item.originalIndex) ? "text-gray-500 line-through" : "text-gray-800"}`}
											>
												{item.name}
											</span>
											<span className="text-primary-600 font-bold text-sm">
												{item.quantity}
											</span>
										</div>
										{item.description && (
											<p className="text-xs text-gray-500 mt-0.5 truncate">
												{item.description}
											</p>
										)}
									</div>
								</div>
							))}
						</div>
					</div>
				))}
			</div>

			{/* 進捗 */}
			<div className="px-4 pb-4">
				<div className="bg-gray-100 rounded-full h-2 overflow-hidden">
					<div
						className="bg-gradient-to-r from-green-400 to-emerald-500 h-full transition-all duration-300"
						style={{ width: `${(checkedItems.size / items.length) * 100}%` }}
					/>
				</div>
				<p className="text-xs text-gray-500 mt-2 text-center">
					{checkedItems.size} / {items.length} 準備完了
				</p>
			</div>

			{/* 次へボタン */}
			<div className="p-4 border-t border-gray-100">
				<button
					onClick={onProceedToNext}
					className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors font-medium"
				>
					<ShoppingCart size={18} />
					次の商品へ進む
					<ChevronRight size={18} />
				</button>
			</div>
		</div>
	);
}
