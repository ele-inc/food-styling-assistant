'use client';

import { Proposal } from '@/types';
import { Edit3, Wand2, Sparkles } from 'lucide-react';

interface ProposalConfirmationProps {
  proposal: Proposal;
  onRequestModification: () => void;
  onGenerateImage: () => void;
  isGenerating?: boolean;
}

export default function ProposalConfirmation({
  proposal,
  onRequestModification,
  onGenerateImage,
  isGenerating = false,
}: ProposalConfirmationProps) {
  return (
    <div className="bg-gradient-to-r from-primary-50 to-amber-50 rounded-2xl border-2 border-primary-200 p-4 mt-3">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
          <Sparkles size={16} className="text-white" />
        </div>
        <div>
          <p className="font-semibold text-gray-800">案{proposal.id}を選択しました</p>
          <p className="text-sm text-gray-600">{proposal.title}</p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onRequestModification}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 hover:bg-white transition-all font-medium"
        >
          <Edit3 size={18} />
          修正したい箇所がある
        </button>
        <button
          onClick={onGenerateImage}
          disabled={isGenerating}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Wand2 size={18} className={isGenerating ? 'animate-spin' : ''} />
          {isGenerating ? '生成中...' : '画像生成をする'}
        </button>
      </div>
    </div>
  );
}
