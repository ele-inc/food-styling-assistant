"use client";

import { Check, ChefHat, Copy, Lightbulb, Users } from "lucide-react";
import { useState } from "react";

interface Recipe {
	title: string;
	servings: string;
	ingredients: Array<{ name: string; amount: string }>;
	steps: string[];
	tips?: string;
}

interface RecipeCardProps {
	recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
	const [copied, setCopied] = useState(false);

	const handleCopy = () => {
		let text = `【${recipe.title}】\n`;
		text += `${recipe.servings}\n\n`;
		text += `■ 材料\n`;
		recipe.ingredients.forEach((ing) => {
			text += `・${ing.name}：${ing.amount}\n`;
		});
		text += `\n■ 作り方\n`;
		recipe.steps.forEach((step, i) => {
			text += `${i + 1}. ${step}\n`;
		});
		if (recipe.tips) {
			text += `\n■ ポイント\n${recipe.tips}`;
		}

		navigator.clipboard.writeText(text);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
			{/* ヘッダー */}
			<div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2 text-white">
						<ChefHat size={24} />
						<h2 className="text-lg font-bold">{recipe.title}</h2>
					</div>
					<button
						onClick={handleCopy}
						className="flex items-center gap-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm transition-colors"
					>
						{copied ? <Check size={16} /> : <Copy size={16} />}
						{copied ? "コピー済み" : "コピー"}
					</button>
				</div>
				<div className="flex items-center gap-1 text-emerald-100 text-sm mt-1">
					<Users size={14} />
					{recipe.servings}
				</div>
			</div>

			{/* 材料 */}
			<div className="p-6 border-b border-gray-100">
				<h3 className="font-semibold text-gray-800 mb-3">材料</h3>
				<div className="grid grid-cols-2 gap-2">
					{recipe.ingredients.map((ing, index) => (
						<div
							key={index}
							className="flex justify-between text-sm py-1.5 px-2 bg-gray-50 rounded"
						>
							<span className="text-gray-700">{ing.name}</span>
							<span className="text-gray-500">{ing.amount}</span>
						</div>
					))}
				</div>
			</div>

			{/* 作り方 */}
			<div className="p-6">
				<h3 className="font-semibold text-gray-800 mb-3">作り方</h3>
				<ol className="space-y-3">
					{recipe.steps.map((step, index) => (
						<li key={index} className="flex gap-3 text-sm">
							<span className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-medium">
								{index + 1}
							</span>
							<span className="text-gray-700 leading-relaxed pt-0.5">
								{step}
							</span>
						</li>
					))}
				</ol>
			</div>

			{/* ポイント */}
			{recipe.tips && (
				<div className="px-6 pb-6">
					<div className="bg-amber-50 rounded-xl p-4">
						<div className="flex items-start gap-2">
							<Lightbulb
								size={18}
								className="text-amber-500 flex-shrink-0 mt-0.5"
							/>
							<div>
								<h4 className="font-medium text-amber-800 text-sm mb-1">
									ポイント
								</h4>
								<p className="text-amber-700 text-sm">{recipe.tips}</p>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
