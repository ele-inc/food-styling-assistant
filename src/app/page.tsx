'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Menu, Camera, Sparkles } from 'lucide-react';
import { Session, Message, Proposal } from '@/types';
import {
  getSessions,
  saveSession,
  deleteSession,
  createSession,
  addMessage,
} from '@/lib/storage';
import HistorySidebar from '@/components/HistorySidebar';
import MessageBubble from '@/components/MessageBubble';
import ChatInput from '@/components/ChatInput';
import ProposalCard from '@/components/ProposalCard';
import SummaryTable from '@/components/SummaryTable';

interface ParsedSummary {
  table: Array<{
    productName: string;
    menuMaterial: string;
    equipment: string;
  }>;
  shoppingList: string[];
  equipmentList: string[];
}

export default function Home() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [summary, setSummary] = useState<ParsedSummary | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 初期化
  useEffect(() => {
    const loadedSessions = getSessions();
    setSessions(loadedSessions);

    if (loadedSessions.length > 0) {
      setCurrentSession(loadedSessions[0]);
    } else {
      const newSession = createSession();
      saveSession(newSession);
      setSessions([newSession]);
      setCurrentSession(newSession);
    }
  }, []);

  // メッセージ末尾へスクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages]);

  // セッションの保存
  const updateSession = useCallback((session: Session) => {
    setCurrentSession(session);
    saveSession(session);
    setSessions((prev) =>
      prev.map((s) => (s.id === session.id ? session : s))
    );
  }, []);

  // 新しいセッションを作成
  const handleNewSession = () => {
    const newSession = createSession();
    saveSession(newSession);
    setSessions((prev) => [newSession, ...prev]);
    setCurrentSession(newSession);
    setProposals([]);
    setSelectedProposal(null);
    setSummary(null);
    setSidebarOpen(false);
  };

  // セッションを選択
  const handleSelectSession = (session: Session) => {
    setCurrentSession(session);
    setProposals([]);
    setSelectedProposal(null);
    setSummary(null);
    setSidebarOpen(false);
  };

  // セッションを削除
  const handleDeleteSession = (sessionId: string) => {
    deleteSession(sessionId);
    const updatedSessions = sessions.filter((s) => s.id !== sessionId);
    setSessions(updatedSessions);

    if (currentSession?.id === sessionId) {
      if (updatedSessions.length > 0) {
        setCurrentSession(updatedSessions[0]);
      } else {
        handleNewSession();
      }
    }
  };

  // レスポンスからJSONを抽出して解析
  const parseResponse = (response: string) => {
    // 提案の解析
    const proposalMatch = response.match(/```json\s*\n?\{[\s\S]*?"proposals"[\s\S]*?\}\s*\n?```/);
    if (proposalMatch) {
      try {
        const jsonStr = proposalMatch[0].replace(/```json\s*\n?/, '').replace(/\s*\n?```/, '');
        const parsed = JSON.parse(jsonStr);
        if (parsed.proposals && Array.isArray(parsed.proposals)) {
          const formattedProposals: Proposal[] = parsed.proposals.map((p: {
            id: string;
            title: string;
            description: string;
            menuMaterial: string;
            equipment: string;
          }) => ({
            id: p.id,
            title: p.title,
            description: p.description,
            menuMaterial: p.menuMaterial,
            equipment: p.equipment,
          }));
          setProposals(formattedProposals);
          // JSONブロックを除去してテキストのみ返す
          return response.replace(proposalMatch[0], '').trim();
        }
      } catch (e) {
        console.error('Failed to parse proposals:', e);
      }
    }

    // まとめの解析
    const summaryMatch = response.match(/```json\s*\n?\{[\s\S]*?"action"\s*:\s*"summary"[\s\S]*?\}\s*\n?```/);
    if (summaryMatch) {
      try {
        const jsonStr = summaryMatch[0].replace(/```json\s*\n?/, '').replace(/\s*\n?```/, '');
        const parsed = JSON.parse(jsonStr);
        if (parsed.action === 'summary' && parsed.summary) {
          setSummary(parsed.summary);
          return response.replace(summaryMatch[0], '').trim();
        }
      } catch (e) {
        console.error('Failed to parse summary:', e);
      }
    }

    // 画像生成の解析
    const imageMatch = response.match(/```json\s*\n?\{[\s\S]*?"action"\s*:\s*"generate_image"[\s\S]*?\}\s*\n?```/);
    if (imageMatch) {
      try {
        const jsonStr = imageMatch[0].replace(/```json\s*\n?/, '').replace(/\s*\n?```/, '');
        const parsed = JSON.parse(jsonStr);
        if (parsed.action === 'generate_image' && parsed.prompt) {
          // 画像生成プロンプトを返す
          return { imagePrompt: parsed.prompt, text: response.replace(imageMatch[0], '').trim() };
        }
      } catch (e) {
        console.error('Failed to parse image action:', e);
      }
    }

    return response;
  };

  // メッセージ送信
  const handleSendMessage = async (
    content: string,
    imageBase64?: string,
    imageUrl?: string
  ) => {
    if (!currentSession) return;

    // ユーザーメッセージを追加
    let updatedSession = addMessage(currentSession, {
      role: 'user',
      content,
      imageUrl,
    });
    updateSession(updatedSession);

    setIsLoading(true);
    setProposals([]);
    setSelectedProposal(null);

    try {
      // API呼び出し用のメッセージ履歴を作成
      const apiMessages = updatedSession.messages.map((m) => ({
        role: m.role,
        content: m.content,
        imageBase64: m.imageUrl ? imageBase64 : undefined,
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API error');
      }

      // レスポンスを解析
      const parsed = parseResponse(data.message);
      let displayText = typeof parsed === 'string' ? parsed : parsed.text;

      // アシスタントメッセージを追加
      updatedSession = addMessage(updatedSession, {
        role: 'assistant',
        content: displayText || data.message,
      });
      updateSession(updatedSession);

      // 画像生成が必要な場合
      if (typeof parsed === 'object' && parsed.imagePrompt) {
        const imageResponse = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ generateImagePrompt: parsed.imagePrompt }),
        });

        const imageData = await imageResponse.json();

        if (imageData.success && imageData.imageBase64) {
          const generatedImageUrl = `data:image/png;base64,${imageData.imageBase64}`;
          // 画像付きメッセージを追加
          updatedSession = addMessage(updatedSession, {
            role: 'assistant',
            content: '完成イメージです！',
            generatedImageUrl,
          });
          updateSession(updatedSession);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      updatedSession = addMessage(updatedSession, {
        role: 'assistant',
        content: `エラーが発生しました: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
      updateSession(updatedSession);
    } finally {
      setIsLoading(false);
    }
  };

  // 提案を選択
  const handleSelectProposal = async (proposal: Proposal) => {
    setSelectedProposal(proposal);
    await handleSendMessage(`${proposal.id}でお願いします`);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* サイドバー */}
      <HistorySidebar
        sessions={sessions}
        currentSessionId={currentSession?.id || null}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onNewSession={handleNewSession}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* メインエリア */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* ヘッダー */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center">
              <Camera size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-800">
                フードスタイリング アシスタント
              </h1>
              <p className="text-xs text-gray-500">
                {currentSession?.title || '新しいプラン'}
              </p>
            </div>
          </div>
        </header>

        {/* メッセージエリア */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* 初期メッセージ */}
          {currentSession?.messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <Sparkles size={36} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                まゆみ様、こんにちは！
              </h2>
              <p className="text-gray-600 max-w-md">
                撮影する商品の画像をアップロードするか、商品名を教えてください。
                <br />
                スタイリングの提案をさせていただきます。
              </p>
            </div>
          )}

          {/* メッセージ一覧 */}
          {currentSession?.messages.map((message) => (
            <div key={message.id} className="message-enter">
              <MessageBubble message={message} />
            </div>
          ))}

          {/* 提案カード */}
          {proposals.length > 0 && (
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Sparkles size={18} className="text-primary-500" />
                スタイリング提案
              </h3>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {proposals.map((proposal) => (
                  <ProposalCard
                    key={proposal.id}
                    proposal={proposal}
                    onSelect={handleSelectProposal}
                    isSelected={selectedProposal?.id === proposal.id}
                  />
                ))}
              </div>
            </div>
          )}

          {/* まとめテーブル */}
          {summary && (
            <div className="animate-fade-in">
              <SummaryTable data={summary} />
            </div>
          )}

          {/* ローディング */}
          {isLoading && (
            <div className="flex items-center gap-3 text-gray-500">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm">考え中...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 入力エリア */}
        <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
      </main>
    </div>
  );
}
