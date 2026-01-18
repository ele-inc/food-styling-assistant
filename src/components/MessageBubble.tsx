'use client';

import { Message } from '@/types';
import { User, Bot } from 'lucide-react';
import Image from 'next/image';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* アイコン */}
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          isUser ? 'bg-primary-100 text-primary-600' : 'bg-accent-100 text-accent-600'
        }`}
      >
        {isUser ? <User size={20} /> : <Bot size={20} />}
      </div>

      {/* メッセージ内容 */}
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-primary-500 text-white rounded-tr-md'
            : 'bg-white border border-gray-200 text-gray-800 rounded-tl-md shadow-sm'
        }`}
      >
        {/* ユーザーがアップロードした画像 */}
        {message.imageUrl && (
          <div className="mb-3">
            <Image
              src={message.imageUrl}
              alt="アップロード画像"
              width={300}
              height={200}
              className="rounded-lg object-cover"
            />
          </div>
        )}

        {/* テキスト内容 */}
        <div className="whitespace-pre-wrap text-sm leading-relaxed">
          {message.content}
        </div>

        {/* AI生成画像 */}
        {message.generatedImageUrl && (
          <div className="mt-3">
            <Image
              src={message.generatedImageUrl}
              alt="生成画像"
              width={400}
              height={300}
              className="rounded-lg object-cover border border-gray-100"
            />
          </div>
        )}

        {/* タイムスタンプ */}
        <div
          className={`text-xs mt-2 ${
            isUser ? 'text-primary-200' : 'text-gray-400'
          }`}
        >
          {message.timestamp.toLocaleTimeString('ja-JP', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </div>
  );
}
