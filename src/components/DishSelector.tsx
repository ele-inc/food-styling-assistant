"use client";

import { Check, ChefHat, Salad, Soup, Utensils } from "lucide-react";
import { useState } from "react";

export interface DishOption {
	id: string;
	name: string;
	category: string;
	description: string;
	appeal: string;
}

interface DishSelectorProps {
	dishes: DishOption[];
	onSelect: (selectedIds: string[]) => void;
	maxSelection?: number;
}

const categoryIcons: Record<string, React.ReactNode> = {
	メイン: <ChefHat size={16} />,
	副菜: <Salad size={16} />,
	スープ: <Soup size={16} />,
	その他: <Utensils size={16} />,
};

const categoryColors: Record<string, string> = {
	メイン: "bg-red-100 text-red-700 border-red-200",
	副菜: "bg-green-100 text-green-700 border-green-200",
	スープ: "bg-blue-100 text-blue-700 border-blue-200",
	その他: "bg-gray-100 text-gray-700 border-gray-200",
};

export default function DishSelector({
	dishes,
	onSelect,
	maxSelection = 3,
}: DishSelectorProps) {
	const [selectedIds, setSelectedIds] = useState<string[]>([]);

	const handleToggle = (id: string) => {
		setSelectedIds((prev) => {
			if (prev.includes(id)) {
				return prev.filter((i) => i !== id);
			}
			if (prev.length >= maxSelection) {
				return prev;
			}
			return [...prev, id];
		});
	};

	const handleConfirm = () => {
		if (selectedIds.length === maxSelection) {
			onSelect(selectedIds);
		}
	};

	// カテゴリごとにグループ化
	const groupedDishes = dishes.reduce(
		(acc, dish) => {
			const category = dish.category || "その他";
			if (!acc[category]) {
				acc[category] = [];
			}
			acc[category].push(dish);
			return acc;
		},
		{} as Record<string, DishOption[]>,
	);

	const categoryOrder = ["メイン", "副菜", "スープ", "その他"];

	return (
		<div className="bg-white rounded-2xl border border-gray-200 p-4">
			<div className="flex items-center justify-between mb-4">
				<h3 className="font-semibold text-gray-800 flex items-center gap-2">
					<ChefHat size={20} className="text-emerald-500" />
					料理を3品選んでください
				</h3>
				<span className="text-sm text-gray-500">
					{selectedIds.length} / {maxSelection} 選択中
				</span>
			</div>

			<div className="space-y-4">
				{categoryOrder.map((category) => {
					const categoryDishes = groupedDishes[category];
					if (!categoryDishes || categoryDishes.length === 0) return null;

					return (
						<div key={category}>
							<div className="flex items-center gap-2 mb-2">
								<span
									className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${categoryColors[category] || categoryColors["その他"]}`}
								>
									{categoryIcons[category] || categoryIcons["その他"]}
									{category}
								</span>
							</div>
							<div className="grid gap-2">
								{categoryDishes.map((dish) => {
									const isSelected = selectedIds.includes(dish.id);
									const selectionOrder = selectedIds.indexOf(dish.id) + 1;
									const isDisabled =
										!isSelected && selectedIds.length >= maxSelection;

									return (
										<button
											key={dish.id}
											onClick={() => handleToggle(dish.id)}
											disabled={isDisabled}
											className={`
                        relative text-left p-3 rounded-xl border-2 transition-all
                        ${
													isSelected
														? "border-emerald-500 bg-emerald-50"
														: isDisabled
															? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
															: "border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50"
												}
                      `}
										>
											<div className="flex items-start gap-3">
												<div
													className={`
                          w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
                          ${isSelected ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-400"}
                        `}
												>
													{isSelected ? (
														<span className="text-xs font-bold">
															{selectionOrder}
														</span>
													) : (
														<span className="text-xs">{dish.id}</span>
													)}
												</div>
												<div className="flex-1 min-w-0">
													<div className="flex items-center gap-2">
														<h4 className="font-medium text-gray-800">
															{dish.name}
														</h4>
													</div>
													<p className="text-sm text-gray-500 mt-0.5">
														{dish.description}
													</p>
													<p className="text-xs text-emerald-600 mt-1">
														✨ {dish.appeal}
													</p>
												</div>
												{isSelected && (
													<Check
														size={20}
														className="text-emerald-500 flex-shrink-0"
													/>
												)}
											</div>
										</button>
									);
								})}
							</div>
						</div>
					);
				})}
			</div>

			{/* 選択確定ボタン */}
			<div className="mt-4 pt-4 border-t border-gray-100">
				<div className="flex items-center justify-between">
					<div className="text-sm text-gray-600">
						{selectedIds.length === maxSelection ? (
							<span className="text-emerald-600 font-medium">
								✓ 3品選択完了！
							</span>
						) : (
							<span>
								あと{maxSelection - selectedIds.length}品選んでください
							</span>
						)}
					</div>
					<button
						onClick={handleConfirm}
						disabled={selectedIds.length !== maxSelection}
						className={`
              px-6 py-2 rounded-xl font-medium transition-all
              ${
								selectedIds.length === maxSelection
									? "bg-emerald-500 text-white hover:bg-emerald-600"
									: "bg-gray-100 text-gray-400 cursor-not-allowed"
							}
            `}
					>
						この3品で決定
					</button>
				</div>
			</div>
		</div>
	);
}
