'use client';

import { ClipboardList, ShoppingCart, Home, Download } from 'lucide-react';

interface SummaryData {
  table: Array<{
    productName: string;
    menuMaterial: string;
    equipment: string;
  }>;
  shoppingList: string[];
  equipmentList: string[];
}

interface SummaryTableProps {
  data: SummaryData;
}

export default function SummaryTable({ data }: SummaryTableProps) {
  const handleCopyToClipboard = () => {
    let text = '📋 今週の撮影プランまとめ\n\n';
    
    // テーブル
    text += '| 商品名 | メニュー・材料メモ | 資材（お皿・小物） |\n';
    text += '| :--- | :--- | :--- |\n';
    data.table.forEach(row => {
      text += `| ${row.productName} | ${row.menuMaterial} | ${row.equipment} |\n`;
    });
    
    // 買い物リスト
    text += '\n🛒 買い物リスト（トッピング・生鮮のみ）\n';
    data.shoppingList.forEach(item => {
      text += `- [ ] ${item}\n`;
    });
    
    // 用意するもの
    text += '\n🏠 用意するもの（機材・資材）\n';
    data.equipmentList.forEach(item => {
      text += `- [ ] ${item}\n`;
    });
    
    navigator.clipboard.writeText(text);
    alert('クリップボードにコピーしました！');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <ClipboardList size={24} />
            <h2 className="text-lg font-bold">今週の撮影プランまとめ</h2>
          </div>
          <button
            onClick={handleCopyToClipboard}
            className="flex items-center gap-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm transition-colors"
          >
            <Download size={16} />
            コピー
          </button>
        </div>
      </div>

      {/* テーブル */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                商品名
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                メニュー・材料メモ
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                資材（お皿・小物）
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.table.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {row.productName}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {row.menuMaterial}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {row.equipment}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 買い物リスト */}
      <div className="p-6 border-t border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <ShoppingCart size={20} className="text-primary-500" />
          <h3 className="font-semibold text-gray-800">
            買い物リスト（トッピング・生鮮のみ）
          </h3>
        </div>
        <ul className="grid grid-cols-2 gap-2">
          {data.shoppingList.map((item, index) => (
            <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" className="rounded border-gray-300" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* 用意するもの */}
      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2 mb-3">
          <Home size={20} className="text-accent-500" />
          <h3 className="font-semibold text-gray-800">
            用意するもの（機材・資材）
          </h3>
        </div>
        <ul className="grid grid-cols-2 gap-2">
          {data.equipmentList.map((item, index) => (
            <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" className="rounded border-gray-300" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
