'use client';

import { useState } from 'react';
import { Check, Edit3, ChefHat, Utensils, Palette, Sparkles, Send } from 'lucide-react';
import Image from 'next/image';

interface ImageConfirmationProps {
  imageUrl: string;
  onConfirm: () => void;
  onRequestRevision: (revisionRequest: RevisionRequest) => void;
  isLoading?: boolean;
}

export interface RevisionRequest {
  type: 'plate' | 'arrangement' | 'props' | 'color' | 'other';
  description: string;
}

const REVISION_OPTIONS = [
  { type: 'plate' as const, icon: Utensils, label: 'お皿を変えたい', placeholder: '例：もっと和風のお皿、白い丸皿など' },
  { type: 'arrangement' as const, icon: ChefHat, label: '盛り付けを変えたい', placeholder: '例：もっと立体的に、量を増やすなど' },
  { type: 'props' as const, icon: Sparkles, label: '小物を変えたい', placeholder: '例：箸を追加、ナプキンを変えるなど' },
  { type: 'color' as const, icon: Palette, label: '色味を変えたい', placeholder: '例：もっと明るく、暖かみのある色になど' },
  { type: 'other' as const, icon: Edit3, label: 'その他', placeholder: '自由に修正内容を記入してください' },
];

export default function ImageConfirmation({
  imageUrl,
  onConfirm,
  onRequestRevision,
  isLoading = false,
}: ImageConfirmationProps) {
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [selectedType, setSelectedType] = useState<RevisionRequest['type'] | null>(null);
  const [description, setDescription] = useState('');

  const handleSubmitRevision = () => {
    if (!selectedType) return;
    onRequestRevision({
      type: selectedType,
      description: description.trim(),
    });
    setShowRevisionForm(false);
    setSelectedType(null);
    setDescription('');
  };

  const selectedOption = REVISION_OPTIONS.find(opt => opt.type === selectedType);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* 画像表示 */}
      <div className="relative">
        <Image
          src={imageUrl}
          alt="生成された完成イメージ"
          width={640}
          height={480}
          className="w-full max-h-[420px] object-cover"
        />
      </div>

      {/* 確認メッセージ */}
      <div className="p-4 border-t border-gray-100">
        {!showRevisionForm ? (
          <>
            <p className="text-center text-gray-700 font-medium mb-4">
              こちらのイメージでよろしいですか？
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRevisionForm(true)}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all font-medium disabled:opacity-50"
              >
                <Edit3 size={18} />
                修正する
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all font-medium shadow-md disabled:opacity-50"
              >
                <Check size={18} />
                OK！これで進める
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-700 font-medium">
              何を修正しますか？
            </p>

            {/* 修正項目選択 */}
            <div className="grid grid-cols-2 gap-2">
              {REVISION_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedType === option.type;
                return (
                  <button
                    key={option.type}
                    onClick={() => setSelectedType(option.type)}
                    className={`
                      flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-left transition-all text-sm
                      ${isSelected
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }
                    `}
                  >
                    <Icon size={16} className={isSelected ? 'text-primary-500' : 'text-gray-400'} />
                    {option.label}
                  </button>
                );
              })}
            </div>

            {/* 詳細入力 */}
            {selectedType && (
              <div className="space-y-2">
                <label className="text-sm text-gray-600">
                  詳しく教えてください（任意）
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={selectedOption?.placeholder}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none text-sm"
                />
              </div>
            )}

            {/* ボタン */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowRevisionForm(false);
                  setSelectedType(null);
                  setDescription('');
                }}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors text-sm"
              >
                キャンセル
              </button>
              <button
                onClick={handleSubmitRevision}
                disabled={!selectedType || isLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={16} />
                修正を依頼
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
