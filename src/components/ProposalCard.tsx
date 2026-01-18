'use client';

import { Proposal } from '@/types';
import { Sparkles, UtensilsCrossed, Package } from 'lucide-react';

interface ProposalCardProps {
  proposal: Proposal;
  onSelect: (proposal: Proposal) => void;
  isSelected?: boolean;
}

export default function ProposalCard({
  proposal,
  onSelect,
  isSelected = false,
}: ProposalCardProps) {
  return (
    <button
      onClick={() => onSelect(proposal)}
      className={`
        w-full text-left p-4 rounded-xl border-2 transition-all
        ${
          isSelected
            ? 'border-primary-500 bg-primary-50 shadow-md'
            : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
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
                ? 'bg-primary-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }
          `}
        >
          {proposal.id}
        </span>
        <h3 className="font-semibold text-gray-800">{proposal.title}</h3>
      </div>

      {/* 説明 */}
      <p className="text-sm text-gray-600 mb-3 leading-relaxed">
        {proposal.description}
      </p>

      {/* 詳細情報 */}
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <UtensilsCrossed size={16} className="text-primary-500 mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-xs text-gray-500 block">メニュー・材料</span>
            <span className="text-sm text-gray-700">{proposal.menuMaterial}</span>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Package size={16} className="text-accent-500 mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-xs text-gray-500 block">資材</span>
            <span className="text-sm text-gray-700">{proposal.equipment}</span>
          </div>
        </div>
      </div>

      {/* 選択表示 */}
      {isSelected && (
        <div className="mt-3 flex items-center gap-1 text-primary-600 text-sm font-medium">
          <Sparkles size={14} />
          この案を選択中
        </div>
      )}
    </button>
  );
}
