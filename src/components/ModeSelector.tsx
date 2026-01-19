'use client';

import { Newspaper, BookOpen, ArrowRight } from 'lucide-react';

export type WorkMode = 'ohisama' | 'coop_letter';

interface ModeSelectorProps {
  onSelectMode: (mode: WorkMode) => void;
}

export default function ModeSelector({ onSelectMode }: ModeSelectorProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-3xl">📸</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            今日はどちらのお仕事ですか？
          </h1>
          <p className="text-gray-600 mt-2">
            選択したモードに合わせて最適なサポートをします
          </p>
        </div>

        {/* モード選択カード */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* おひさま通信 */}
          <button
            onClick={() => onSelectMode('ohisama')}
            className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 text-left border-2 border-transparent hover:border-primary-400"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Newspaper size={28} className="text-amber-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2">
                  おひさま通信
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                    週次
                  </span>
                </h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                  コープ商品の紹介チラシ用の撮影。
                  商品の魅力が伝わる盛り合わせ画像を作成します。
                </p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• 商品パッケージから形状を分析</li>
                <li>• チラシ映えする盛り付け提案</li>
                <li>• 買い物リスト＆資材リスト作成</li>
              </ul>
            </div>

            <div className="mt-4 flex items-center justify-end text-primary-500 font-medium text-sm group-hover:translate-x-1 transition-transform">
              このモードで始める
              <ArrowRight size={16} className="ml-1" />
            </div>
          </button>

          {/* コープレター */}
          <button
            onClick={() => onSelectMode('coop_letter')}
            className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 text-left border-2 border-transparent hover:border-primary-400"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <BookOpen size={28} className="text-emerald-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2">
                  コープレター
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                    月次
                  </span>
                </h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                  表紙デザイン用の撮影。
                  テーマ食材を使った料理とレシピを作成します。
                </p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• 月のテーマ食材に合わせた提案</li>
                <li>• 食材が明確に見える盛り付け</li>
                <li>• レシピも一緒に作成</li>
              </ul>
            </div>

            <div className="mt-4 flex items-center justify-end text-primary-500 font-medium text-sm group-hover:translate-x-1 transition-transform">
              このモードで始める
              <ArrowRight size={16} className="ml-1" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
