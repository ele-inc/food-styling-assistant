"use client";

import { Check, Package, Sparkles, UtensilsCrossed } from "lucide-react";
import type { Proposal } from "@/types";

interface ProposalCardProps {
	proposal: Proposal;
	onSelect: (proposal: Proposal) => void;
	isSelected?: boolean;
	isDisabled?: boolean; // 他の案が選択済みの場合
}

export default function ProposalCard({
	proposal,
	onSelect,
	isSelected = false,
	isDisabled = false,
}: ProposalCardProps) {
	const isClickable = !isSelected && !isDisabled;

	return (
		<button
			onClick={() => isClickable && onSelect(proposal)}
			disabled={!isClickable}
			className={`
        w-full text-left p-4 rounded-xl border-2 transition-all
        ${
					isSelected
						? "border-primary-500 bg-primary-50 shadow-md"
						: isDisabled
							? "border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed"
							: "border-gray-200 hover:border-primary-300 hover:bg-gray-50 cursor-pointer"
				}
      `}
		>
			{/* ヘッダー */}
			<div className="flex items-center gap-2 mb-2">
				<span
					className={`
            w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
            ${
							isSelected
								? "bg-primary-500 text-white"
								: isDisabled
									? "bg-gray-300 text-gray-500"
									: "bg-gray-200 text-gray-700"
						}
          `}
				>
					{isSelected ? <Check size={16} /> : proposal.id}
				</span>
				<h3
					className={`font-semibold ${isDisabled && !isSelected ? "text-gray-500" : "text-gray-800"}`}
				>
					{proposal.title}
				</h3>
			</div>

			{/* 説明 */}
			<p
				className={`text-sm mb-3 leading-relaxed ${isDisabled && !isSelected ? "text-gray-400" : "text-gray-600"}`}
			>
				{proposal.description}
			</p>

			{/* 詳細情報 */}
			<div className="space-y-2">
				<div className="flex items-start gap-2">
					<UtensilsCrossed
						size={16}
						className={`mt-0.5 flex-shrink-0 ${isDisabled && !isSelected ? "text-gray-400" : "text-primary-500"}`}
					/>
					<div>
						<span className="text-xs text-gray-500 block">メニュー・材料</span>
						<span
							className={`text-sm ${isDisabled && !isSelected ? "text-gray-400" : "text-gray-700"}`}
						>
							{proposal.menuMaterial}
						</span>
					</div>
				</div>
				<div className="flex items-start gap-2">
					<Package
						size={16}
						className={`mt-0.5 flex-shrink-0 ${isDisabled && !isSelected ? "text-gray-400" : "text-accent-500"}`}
					/>
					<div>
						<span className="text-xs text-gray-500 block">資材</span>
						<span
							className={`text-sm ${isDisabled && !isSelected ? "text-gray-400" : "text-gray-700"}`}
						>
							{proposal.equipment}
						</span>
					</div>
				</div>
			</div>

			{/* 選択表示 */}
			{isSelected && (
				<div className="mt-3 flex items-center gap-1 text-primary-600 text-sm font-medium">
					<Sparkles size={14} />
					この案で決定
				</div>
			)}
		</button>
	);
}
