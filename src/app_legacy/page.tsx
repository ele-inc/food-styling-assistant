'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Menu, Sparkles, LogOut, Newspaper, BookOpen } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { Message, Proposal } from '@/types';
import {
  supabase,
  DbSession,
  fetchSessions,
  saveSessionToDb,
  deleteSessionFromDb,
  getCurrentUser,
  signOut,
} from '@/lib/supabase';
import AuthForm from '@/components/AuthForm';
import ModeSelector, { WorkMode } from '@/components/ModeSelector';
import HistorySidebar from '@/components/HistorySidebar';
import MessageBubble from '@/components/MessageBubble';
import ChatInput from '@/components/ChatInput';
import ProposalCard from '@/components/ProposalCard';
import SummaryTable from '@/components/SummaryTable';
import RecipeCard from '@/components/RecipeCard';
import ImageConfirmation, { RevisionRequest } from '@/components/ImageConfirmation';
import EquipmentList, { EquipmentItem } from '@/components/EquipmentList';
import ProposalConfirmation from '@/components/ProposalConfirmation';
import DishSelector, { DishOption } from '@/components/DishSelector';
import LayoutPreview from '@/components/LayoutPreview';

interface ParsedSummary {
  theme?: string;
  table: Array<{
    productName: string;
    menuMaterial: string;
    equipment: string;
  }>;
  shoppingList: string[];
  equipmentList: string[];
  recipes?: string[];
}

interface ParsedRecipe {
  title: string;
  servings: string;
  ingredients: Array<{ name: string; amount: string }>;
  steps: string[];
  tips?: string;
}

// Session型をフロントエンド用に変換
interface Session {
  id: string;
  title: string;
  mode: WorkMode;
  theme?: string;
  products: Array<{
    id: string;
    name: string;
    imageUrl?: string;
    shape: string;
    selectedProposal?: Proposal;
    generatedImageUrl?: string;
    recipe?: string;
  }>;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  isCompleted: boolean;
}

function convertDbSessionToSession(dbSession: DbSession): Session {
  return {
    id: dbSession.id,
    title: dbSession.title,
    mode: dbSession.mode,
    theme: dbSession.theme,
    products: dbSession.products.map(p => ({
      id: p.id,
      name: p.name,
      imageUrl: p.image_url,
      shape: p.shape,
      selectedProposal: p.selected_proposal ? {
        id: p.selected_proposal.id,
        title: p.selected_proposal.title,
        description: p.selected_proposal.description,
        menuMaterial: p.selected_proposal.menu_material,
        equipment: p.selected_proposal.equipment,
      } : undefined,
      generatedImageUrl: p.generated_image_url,
      recipe: p.recipe,
    })),
    messages: dbSession.messages.map(m => ({
      id: m.id,
      role: m.role,
      content: m.content,
      imageUrl: m.image_url,
      generatedImageUrl: m.generated_image_url,
      timestamp: new Date(m.timestamp),
    })),
    createdAt: new Date(dbSession.created_at),
    updatedAt: new Date(dbSession.updated_at),
    isCompleted: dbSession.is_completed,
  };
}

function convertSessionToDbSession(session: Session, userId: string): DbSession {
  return {
    id: session.id,
    user_id: userId,
    title: session.title,
    mode: session.mode,
    theme: session.theme,
    products: session.products.map(p => ({
      id: p.id,
      name: p.name,
      image_url: p.imageUrl,
      shape: p.shape,
      selected_proposal: p.selectedProposal ? {
        id: p.selectedProposal.id,
        title: p.selectedProposal.title,
        description: p.selectedProposal.description,
        menu_material: p.selectedProposal.menuMaterial,
        equipment: p.selectedProposal.equipment,
      } : undefined,
      generated_image_url: p.generatedImageUrl,
      recipe: p.recipe,
    })),
    messages: session.messages.map(m => ({
      id: m.id,
      role: m.role,
      content: m.content,
      image_url: m.imageUrl,
      generated_image_url: m.generatedImageUrl,
      timestamp: m.timestamp.toISOString(),
    })),
    is_completed: session.isCompleted,
    created_at: session.createdAt.toISOString(),
    updated_at: session.updatedAt.toISOString(),
  };
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [selectedMode, setSelectedMode] = useState<WorkMode | null>(null);

  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [pendingImagePrompt, setPendingImagePrompt] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [summary, setSummary] = useState<ParsedSummary | null>(null);
  const [recipes, setRecipes] = useState<ParsedRecipe[]>([]);
  const [showImageConfirmation, setShowImageConfirmation] = useState(false);
  const [lastGeneratedImageUrl, setLastGeneratedImageUrl] = useState<string | null>(null);
  const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>([]);
  const [showProposalConfirmation, setShowProposalConfirmation] = useState(false);
  const [awaitingModificationInput, setAwaitingModificationInput] = useState(false);
  const [autoGenerateAfterPrompt, setAutoGenerateAfterPrompt] = useState(false);
  // コープレター用の状態
  const [dishOptions, setDishOptions] = useState<DishOption[]>([]);
  const [selectedDishes, setSelectedDishes] = useState<Array<{ order: number; id: string; name: string }>>([]);
  const [currentDishIndex, setCurrentDishIndex] = useState<number>(0);
  const [dishImages, setDishImages] = useState<Array<{ order: number; name: string; imageUrl: string }>>([]);
  const [layoutImageUrl, setLayoutImageUrl] = useState<string | null>(null);
  const [isGeneratingLayout, setIsGeneratingLayout] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const proposalsRef = useRef<HTMLDivElement>(null);

  // 認証状態の監視
  useEffect(() => {
    getCurrentUser().then(u => {
      setUser(u);
      setIsAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // セッション読み込み
  useEffect(() => {
    if (user && selectedMode) {
      fetchSessions(user.id).then(dbSessions => {
        const filteredSessions = dbSessions
          .filter(s => s.mode === selectedMode)
          .map(convertDbSessionToSession);
        setSessions(filteredSessions);

        if (filteredSessions.length > 0) {
          setCurrentSession(filteredSessions[0]);
        } else {
          handleNewSession();
        }
      });
    }
  }, [user, selectedMode]);

  // メッセージ末尾へスクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages]);

  useEffect(() => {
    if (autoGenerateAfterPrompt && pendingImagePrompt && currentSession) {
      setAutoGenerateAfterPrompt(false);
      setShowProposalConfirmation(false);
      handleGenerateImage();
    }
  }, [autoGenerateAfterPrompt, pendingImagePrompt, currentSession]);

  useEffect(() => {
    if (proposals.length > 0 || showProposalConfirmation) {
      proposalsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [proposals.length, showProposalConfirmation]);

  // セッションの保存
  const updateSession = useCallback(async (session: Session) => {
    if (!user) return;

    setCurrentSession(session);
    setSessions((prev) =>
      prev.map((s) => (s.id === session.id ? session : s))
    );

    // DBに保存
    try {
      await saveSessionToDb(convertSessionToDbSession(session, user.id));
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }, [user]);

  // 新しいセッションを作成
  const handleNewSession = useCallback(async (productName?: string) => {
    if (!user || !selectedMode) return;

    const now = new Date();
    const modeLabel = selectedMode === 'ohisama' ? 'おひさま通信' : 'コープレター';
    const safeProductName = typeof productName === 'string' ? productName : undefined;
    const title = safeProductName || `${modeLabel} ${now.toLocaleDateString('ja-JP')}`;
    const newSession: Session = {
      id: crypto.randomUUID(),
      title,
      mode: selectedMode,
      products: [],
      messages: [],
      createdAt: now,
      updatedAt: now,
      isCompleted: false,
    };

    // まず画面を即時更新（DB保存に失敗しても新規プランは開く）
    setSessions((prev) => [newSession, ...prev]);
    setCurrentSession(newSession);
    setProposals([]);
    setSelectedProposal(null);
    setSummary(null);
    setRecipes([]);
    setEquipmentList([]);
    setShowImageConfirmation(false);
    setLastGeneratedImageUrl(null);
    setShowProposalConfirmation(false);
    setAwaitingModificationInput(false);
    setPendingImagePrompt(null);
    setAutoGenerateAfterPrompt(false);
    // コープレター用の状態リセット
    setDishOptions([]);
    setSelectedDishes([]);
    setCurrentDishIndex(0);
    setDishImages([]);
    setLayoutImageUrl(null);
    setIsGeneratingLayout(false);
    setSidebarOpen(false);

    try {
      await saveSessionToDb(convertSessionToDbSession(newSession, user.id));
    } catch (error) {
      console.error('Failed to create session:', error);
    }

    return newSession;
  }, [user, selectedMode]);

  // セッションタイトルを更新
  const updateSessionTitle = useCallback(async (title: string) => {
    if (!currentSession || !user) return;

    const updatedSession = {
      ...currentSession,
      title,
      updatedAt: new Date(),
    };

    setCurrentSession(updatedSession);
    setSessions((prev) =>
      prev.map((s) => (s.id === updatedSession.id ? updatedSession : s))
    );

    try {
      await saveSessionToDb(convertSessionToDbSession(updatedSession, user.id));
    } catch (error) {
      console.error('Failed to update session title:', error);
    }
  }, [currentSession, user]);

  // セッションを選択
  const handleSelectSession = (session: Session) => {
    setCurrentSession(session);
    setProposals([]);
    setSelectedProposal(null);
    setSummary(null);
    setRecipes([]);
    // コープレター用の状態リセット
    setDishOptions([]);
    setSelectedDishes([]);
    setCurrentDishIndex(0);
    setDishImages([]);
    setLayoutImageUrl(null);
    setSidebarOpen(false);
  };

  // セッションを削除
  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteSessionFromDb(sessionId);
      const updatedSessions = sessions.filter((s) => s.id !== sessionId);
      setSessions(updatedSessions);

      if (currentSession?.id === sessionId) {
        if (updatedSessions.length > 0) {
          setCurrentSession(updatedSessions[0]);
        } else {
          handleNewSession();
        }
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  // レスポンスからJSONを抽出して解析
  const parseResponse = (response: string) => {
    const extractJsonPayload = (match: RegExpMatchArray) =>
      match[0]
        .replace(/```json\s*\n?/, '')
        .replace(/\s*\n?```/, '')
        .trim();

    const findLooseJsonMatch = (keyword: string) =>
      response.match(new RegExp(`\\{[\\s\\S]*?"${keyword}"[\\s\\S]*?\\}`, 'm'));

    // コープレター：料理選択リストの解析
    const dishSelectionMatch =
      response.match(/```json\s*\n?\{[\s\S]*?"action"\s*:\s*"dish_selection"[\s\S]*?\}\s*\n?```/);
    if (dishSelectionMatch) {
      try {
        const jsonStr = extractJsonPayload(dishSelectionMatch);
        const parsed = JSON.parse(jsonStr);
        if (parsed.action === 'dish_selection' && parsed.dishList) {
          setDishOptions(parsed.dishList);
          // テーマをセッションタイトルに設定
          if (parsed.theme && currentSession) {
            updateSessionTitle(parsed.theme);
          }
          return response.replace(dishSelectionMatch[0], '').trim();
        }
      } catch (e) {
        console.error('Failed to parse dish selection:', e);
      }
    }

    // コープレター：3品選択確定の解析
    const dishesConfirmedMatch =
      response.match(/```json\s*\n?\{[\s\S]*?"action"\s*:\s*"dishes_confirmed"[\s\S]*?\}\s*\n?```/);
    if (dishesConfirmedMatch) {
      try {
        const jsonStr = extractJsonPayload(dishesConfirmedMatch);
        const parsed = JSON.parse(jsonStr);
        if (parsed.action === 'dishes_confirmed' && parsed.selectedDishes) {
          setSelectedDishes(parsed.selectedDishes);
          setCurrentDishIndex(0);
          setDishOptions([]); // 選択UIを非表示に
          return response.replace(dishesConfirmedMatch[0], '').trim();
        }
      } catch (e) {
        console.error('Failed to parse dishes confirmed:', e);
      }
    }

    // コープレター：最終レイアウト画像生成の解析
    const layoutMatch =
      response.match(/```json\s*\n?\{[\s\S]*?"action"\s*:\s*"generate_layout"[\s\S]*?\}\s*\n?```/);
    if (layoutMatch) {
      try {
        const jsonStr = extractJsonPayload(layoutMatch);
        const parsed = JSON.parse(jsonStr);
        if (parsed.action === 'generate_layout' && parsed.prompt) {
          // 自動的にレイアウト画像を生成
          handleGenerateLayoutImage(parsed.prompt);
          return response.replace(layoutMatch[0], '').trim();
        }
      } catch (e) {
        console.error('Failed to parse layout action:', e);
      }
    }

    // 提案の解析（おひさま通信用）
    const proposalMatch =
      response.match(/```json\s*\n?\{[\s\S]*?"proposals"[\s\S]*?\}\s*\n?```/) ||
      findLooseJsonMatch('proposals');
    if (proposalMatch) {
      try {
        const jsonStr = extractJsonPayload(proposalMatch);
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

          // コープレターの場合、テーマがあればそれをセッションタイトルに使用
          if (parsed.theme && currentSession && currentSession.title.includes('コープレター')) {
            updateSessionTitle(parsed.theme);
          }

          return response.replace(proposalMatch[0], '').trim();
        }
      } catch (e) {
        console.error('Failed to parse proposals:', e);
      }
    }

    // レシピの解析
    const recipeMatch =
      response.match(/```json\s*\n?\{[\s\S]*?"action"\s*:\s*"recipe"[\s\S]*?\}\s*\n?```/) ||
      findLooseJsonMatch('action');
    if (recipeMatch) {
      try {
        const jsonStr = extractJsonPayload(recipeMatch);
        const parsed = JSON.parse(jsonStr);
        if (parsed.action === 'recipe' && parsed.recipe) {
          setRecipes(prev => [...prev, parsed.recipe]);
          return response.replace(recipeMatch[0], '').trim();
        }
      } catch (e) {
        console.error('Failed to parse recipe:', e);
      }
    }

    // まとめの解析
    const summaryMatch =
      response.match(/```json\s*\n?\{[\s\S]*?"action"\s*:\s*"summary"[\s\S]*?\}\s*\n?```/) ||
      findLooseJsonMatch('action');
    if (summaryMatch) {
      try {
        const jsonStr = extractJsonPayload(summaryMatch);
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
    const imageMatch =
      response.match(/```json\s*\n?\{[\s\S]*?"action"\s*:\s*"generate_image"[\s\S]*?\}\s*\n?```/) ||
      findLooseJsonMatch('action');
    if (imageMatch) {
      try {
        const jsonStr = extractJsonPayload(imageMatch);
        const parsed = JSON.parse(jsonStr);
        if (parsed.action === 'generate_image' && parsed.prompt) {
          // 画像生成プロンプトを保存（ボタンクリック時に使用）
          setPendingImagePrompt(parsed.prompt);
          return response.replace(imageMatch[0], '').trim();
        }
      } catch (e) {
        console.error('Failed to parse image action:', e);
      }
    }

    // 用意するものリストの解析
    const equipmentMatch =
      response.match(/```json\s*\n?\{[\s\S]*?"action"\s*:\s*"equipment_list"[\s\S]*?\}\s*\n?```/) ||
      findLooseJsonMatch('action');
    if (equipmentMatch) {
      try {
        const jsonStr = extractJsonPayload(equipmentMatch);
        const parsed = JSON.parse(jsonStr);
        if (parsed.action === 'equipment_list' && parsed.equipmentList) {
          setEquipmentList(parsed.equipmentList);
          setShowImageConfirmation(false);
          return response.replace(equipmentMatch[0], '').trim();
        }
      } catch (e) {
        console.error('Failed to parse equipment list:', e);
      }
    }

    return response;
  };

  // メッセージを追加するヘルパー
  const addMessage = (session: Session, message: Omit<Message, 'id' | 'timestamp'>): Session => {
    const newMessage: Message = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    return {
      ...session,
      messages: [...session.messages, newMessage],
      updatedAt: new Date(),
    };
  };

  // メッセージ送信
  const handleSendMessage = async (
    content: string,
    imageBase64?: string,
    imageUrl?: string
  ) => {
    if (!currentSession || !selectedMode) return;

    // ユーザーメッセージを追加
    let updatedSession = addMessage(currentSession, {
      role: 'user',
      content,
      imageUrl,
    });
    await updateSession(updatedSession);

    setIsLoading(true);
    // 提案リストはクリアしない（グレーアウトで残す）
    // setProposals([]);
    // setSelectedProposal(null);

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
        body: JSON.stringify({ messages: apiMessages, mode: selectedMode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API error');
      }

      // レスポンスを解析
      const parsed = parseResponse(data.message);
      const displayText = typeof parsed === 'string' ? parsed : parsed;

      // アシスタントメッセージを追加
      updatedSession = addMessage(updatedSession, {
        role: 'assistant',
        content: displayText || data.message,
      });
      await updateSession(updatedSession);
    } catch (error) {
      console.error('Error:', error);
      const rawMessage = error instanceof Error ? error.message : 'Unknown error';
      const displayMessage = rawMessage.startsWith('エラーが発生しました')
        ? rawMessage
        : `エラーが発生しました: ${rawMessage}`;
      updatedSession = addMessage(updatedSession, {
        role: 'assistant',
        content: displayMessage,
      });
      await updateSession(updatedSession);
    } finally {
      setIsLoading(false);
    }
  };

  // 提案を選択（メッセージは送信せず、確認UIを表示）
  const handleSelectProposal = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setShowProposalConfirmation(true);
    setAwaitingModificationInput(false);
    setAutoGenerateAfterPrompt(false);
  };

  // 提案の修正を依頼
  const handleProposalModificationRequest = () => {
    setShowProposalConfirmation(false);
    setAwaitingModificationInput(true);
  };

  // 提案をそのまま確定
  const handleProposalGenerateRequest = async () => {
    if (!selectedProposal || !currentSession) return;
    setAutoGenerateAfterPrompt(true);

    // おひさま通信の場合、選択した提案のタイトルをセッションタイトルに設定
    if (selectedMode === 'ohisama') {
      await updateSessionTitle(selectedProposal.title);
    }

    // AIに確定を伝えて画像生成プロンプトを取得
    await handleSendMessage(`案${selectedProposal.id}（${selectedProposal.title}）でお願いします。このままで大丈夫です。`);
  };

  // 画像生成を実行
  const handleGenerateImage = async () => {
    if (!pendingImagePrompt || !currentSession) return;

    setIsGeneratingImage(true);

    try {
      const imageResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ generateImagePrompt: pendingImagePrompt }),
      });

      const imageData = await imageResponse.json();

      if (imageData.success && imageData.imageBase64) {
        const generatedImageUrl = `data:image/png;base64,${imageData.imageBase64}`;

        if (selectedMode === 'ohisama') {
          // おひさま通信は確認UIにのみ表示（重複表示を避ける）
          const updatedSession = addMessage(currentSession, {
            role: 'assistant',
            content: '完成イメージです！',
          });
          await updateSession(updatedSession);
          setLastGeneratedImageUrl(generatedImageUrl);
          setShowImageConfirmation(true);
        } else {
          const updatedSession = addMessage(currentSession, {
            role: 'assistant',
            content: '完成イメージです！',
            generatedImageUrl,
          });
          await updateSession(updatedSession);
        }

        setPendingImagePrompt(null);
      } else {
        const updatedSession = addMessage(currentSession, {
          role: 'assistant',
          content: '画像の生成に失敗しました。もう一度お試しください。',
        });
        await updateSession(updatedSession);
      }
    } catch (error) {
      console.error('Image generation error:', error);
      const rawMessage = error instanceof Error ? error.message : 'Unknown error';
      const displayMessage = rawMessage.startsWith('画像生成エラー:')
        ? rawMessage
        : `画像生成エラー: ${rawMessage}`;
      const updatedSession = addMessage(currentSession, {
        role: 'assistant',
        content: displayMessage,
      });
      await updateSession(updatedSession);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // コープレター：3品選択時の処理
  const handleDishSelection = async (selectedIds: string[]) => {
    if (!currentSession) return;

    // 選択した料理名を取得
    const selectedDishNames = selectedIds.map((id, index) => {
      const dish = dishOptions.find((d) => d.id === id);
      return { order: index + 1, id, name: dish?.name || '' };
    });

    // メッセージを送信
    const message = `${selectedIds.join(', ')} を選びます`;
    await handleSendMessage(message);
  };

  // コープレター：各料理の画像生成後の処理
  const handleDishImageGenerated = (imageUrl: string) => {
    if (selectedDishes.length === 0 || currentDishIndex >= selectedDishes.length) return;

    const currentDish = selectedDishes[currentDishIndex];
    setDishImages((prev) => [
      ...prev,
      { order: currentDish.order, name: currentDish.name, imageUrl },
    ]);
  };

  // コープレター：次の料理へ進む
  const handleNextDish = async () => {
    if (!currentSession) return;

    if (currentDishIndex < selectedDishes.length - 1) {
      setCurrentDishIndex((prev) => prev + 1);
      await handleSendMessage('OKです、次の料理に進んでください');
    } else {
      // 全ての料理が完成、レイアウト生成へ
      await handleSendMessage('OKです、最終レイアウトを生成してください');
    }
  };

  // コープレター：レイアウト画像生成
  const handleGenerateLayoutImage = async (prompt: string) => {
    if (!currentSession) return;

    setIsGeneratingLayout(true);

    try {
      const imageResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ generateImagePrompt: prompt }),
      });

      const imageData = await imageResponse.json();

      if (imageData.success && imageData.imageBase64) {
        const generatedImageUrl = `data:image/png;base64,${imageData.imageBase64}`;
        setLayoutImageUrl(generatedImageUrl);

        const updatedSession = addMessage(currentSession, {
          role: 'assistant',
          content: '表紙レイアウトのイメージが完成しました！',
          generatedImageUrl,
        });
        await updateSession(updatedSession);
      } else {
        const updatedSession = addMessage(currentSession, {
          role: 'assistant',
          content: 'レイアウト画像の生成に失敗しました。もう一度お試しください。',
        });
        await updateSession(updatedSession);
      }
    } catch (error) {
      console.error('Layout image generation error:', error);
      const updatedSession = addMessage(currentSession, {
        role: 'assistant',
        content: 'レイアウト画像の生成中にエラーが発生しました。',
      });
      await updateSession(updatedSession);
    } finally {
      setIsGeneratingLayout(false);
    }
  };

  // コープレター：レイアウト確定
  const handleLayoutConfirm = async () => {
    if (!currentSession) return;
    await handleSendMessage('このレイアウトでOKです。まとめを出してください。');
  };

  // 画像確認OK
  const handleImageConfirm = async () => {
    if (!currentSession) return;
    setShowImageConfirmation(false);
    await handleSendMessage('OK、これで確定します。用意するものリストを出してください。');
  };

  // 画像修正リクエスト
  const handleImageRevision = async (request: RevisionRequest) => {
    if (!currentSession) return;

    const typeLabels: Record<string, string> = {
      plate: 'お皿',
      arrangement: '盛り付け',
      props: '小物',
      color: '色味',
      other: 'その他',
    };

    const message = request.description
      ? `${typeLabels[request.type]}を変更してください：${request.description}`
      : `${typeLabels[request.type]}を変更してください`;

    setShowImageConfirmation(false);
    await handleSendMessage(message);
  };

  // 次の商品へ進む（新しいチャットを作成）
  const handleProceedToNext = async () => {
    // 現在のセッションを完了としてマーク
    if (currentSession && user) {
      const completedSession = {
        ...currentSession,
        isCompleted: true,
        updatedAt: new Date(),
      };
      try {
        await saveSessionToDb(convertSessionToDbSession(completedSession, user.id));
        setSessions((prev) =>
          prev.map((s) => (s.id === completedSession.id ? completedSession : s))
        );
      } catch (error) {
        console.error('Failed to mark session as completed:', error);
      }
    }

    // 新しいセッションを作成
    await handleNewSession();
  };

  // ログアウト
  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    setSelectedMode(null);
    setSessions([]);
    setCurrentSession(null);
  };

  // モード選択に戻る
  const handleBackToModeSelect = () => {
    setSelectedMode(null);
    setSessions([]);
    setCurrentSession(null);
    setProposals([]);
    setSummary(null);
    setRecipes([]);
  };

  // 認証チェック中
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // 未ログイン
  if (!user) {
    return <AuthForm onSuccess={() => {}} />;
  }

  // モード未選択
  if (!selectedMode) {
    return (
      <div className="relative">
        <ModeSelector onSelectMode={setSelectedMode} />
        <button
          onClick={handleSignOut}
          className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-white/50 rounded-lg transition-colors"
        >
          <LogOut size={18} />
          ログアウト
        </button>
      </div>
    );
  }

  // メインアプリ
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
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                selectedMode === 'ohisama'
                  ? 'bg-gradient-to-br from-amber-400 to-amber-600'
                  : 'bg-gradient-to-br from-emerald-400 to-emerald-600'
              }`}>
                {selectedMode === 'ohisama'
                  ? <Newspaper size={20} className="text-white" />
                  : <BookOpen size={20} className="text-white" />
                }
              </div>
              <div>
                <h1 className="font-bold text-gray-800">
                  {selectedMode === 'ohisama' ? 'おひさま通信' : 'コープレター'}
                </h1>
                <p className="text-xs text-gray-500">
                  {currentSession?.title || '新しいプラン'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBackToModeSelect}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              モード変更
            </button>
            <button
              onClick={handleSignOut}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* メッセージエリア */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* 初期メッセージ（常に表示） */}
          {currentSession && (
            <div className="flex flex-col items-center text-center py-6 bg-white rounded-2xl border border-gray-200">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-4 shadow-lg ${
                selectedMode === 'ohisama'
                  ? 'bg-gradient-to-br from-amber-400 to-amber-600'
                  : 'bg-gradient-to-br from-emerald-400 to-emerald-600'
              }`}>
                <Sparkles size={36} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                まゆみ様、こんにちは！
              </h2>
              <p className="text-gray-600 max-w-md">
                {selectedMode === 'ohisama' ? (
                  <>
                    撮影する商品の画像をアップロードするか、商品名を教えてください。
                    <br />
                    チラシ映えするスタイリングを提案します。
                  </>
                ) : (
                  <>
                    今月のテーマ食材を教えてください。
                    <br />
                    表紙に映える料理とレシピを提案します。
                  </>
                )}
              </p>
            </div>
          )}

          {/* メッセージ一覧 */}
          {currentSession?.messages.map((message, index) => (
            <div key={message.id} className="message-enter">
              <MessageBubble
                message={message}
                onGenerateImage={
                  // 最後のアシスタントメッセージで、画像生成プロンプトがある場合のみ
                  index === currentSession.messages.length - 1 &&
                  pendingImagePrompt &&
                  message.role === 'assistant'
                    ? handleGenerateImage
                    : undefined
                }
                isGenerating={isGeneratingImage}
              />
            </div>
          ))}

          {/* 提案カード */}
          {proposals.length > 0 && (
            <div ref={proposalsRef} className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Sparkles size={18} className="text-primary-500" />
                {selectedMode === 'ohisama' ? 'スタイリング提案' : '料理提案'}
                {selectedProposal && (
                  <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full ml-2">
                    案{selectedProposal.id}を選択中
                  </span>
                )}
              </h3>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {proposals.map((proposal) => (
                  <ProposalCard
                    key={proposal.id}
                    proposal={proposal}
                    onSelect={handleSelectProposal}
                    isSelected={selectedProposal?.id === proposal.id}
                    isDisabled={selectedProposal !== null && selectedProposal.id !== proposal.id}
                  />
                ))}
              </div>

              {/* 提案選択後の確認UI */}
              {showProposalConfirmation && selectedProposal && (
                <ProposalConfirmation
                  proposal={selectedProposal}
                  onRequestModification={handleProposalModificationRequest}
                  onGenerateImage={handleProposalGenerateRequest}
                  isGenerating={isGeneratingImage}
                />
              )}
            </div>
          )}

          {/* コープレター：料理選択UI */}
          {dishOptions.length > 0 && selectedMode === 'coop_letter' && (
            <div className="animate-fade-in">
              <DishSelector
                dishes={dishOptions}
                onSelect={handleDishSelection}
                maxSelection={3}
              />
            </div>
          )}

          {/* コープレター：選択した3品の進捗表示 */}
          {selectedDishes.length > 0 && selectedMode === 'coop_letter' && (
            <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200">
              <p className="text-sm text-emerald-700 font-medium mb-2">選択した3品</p>
              <div className="flex gap-2">
                {selectedDishes.map((dish, index) => (
                  <div
                    key={dish.id}
                    className={`flex-1 text-center py-2 px-3 rounded-lg text-sm ${
                      index < currentDishIndex
                        ? 'bg-emerald-500 text-white'
                        : index === currentDishIndex
                          ? 'bg-emerald-200 text-emerald-800 font-medium'
                          : 'bg-white text-gray-500 border border-gray-200'
                    }`}
                  >
                    <span className="text-xs">{dish.order}品目</span>
                    <br />
                    {dish.name}
                    {index < currentDishIndex && ' ✓'}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 画像確認UI（おひさま通信用） */}
          {showImageConfirmation && lastGeneratedImageUrl && selectedMode === 'ohisama' && (
            <div className="animate-fade-in">
              <ImageConfirmation
                imageUrl={lastGeneratedImageUrl}
                onConfirm={handleImageConfirm}
                onRequestRevision={handleImageRevision}
                isLoading={isLoading}
              />
            </div>
          )}

          {/* 用意するものリスト（おひさま通信用） */}
          {equipmentList.length > 0 && selectedMode === 'ohisama' && (
            <div className="animate-fade-in">
              <EquipmentList
                items={equipmentList}
                onProceedToNext={handleProceedToNext}
              />
            </div>
          )}

          {/* レシピカード（コープレター用） */}
          {recipes.map((recipe, index) => (
            <div key={index} className="animate-fade-in">
              <RecipeCard recipe={recipe} />
            </div>
          ))}

          {/* コープレター：最終レイアウトプレビュー */}
          {layoutImageUrl && selectedMode === 'coop_letter' && (
            <div className="animate-fade-in">
              <LayoutPreview
                dishImages={dishImages}
                layoutImageUrl={layoutImageUrl}
                onConfirm={handleLayoutConfirm}
                isLoading={isGeneratingLayout}
              />
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

        {/* 修正入力のヒント */}
        {awaitingModificationInput && selectedProposal && (
          <div className="bg-amber-50 border-t border-amber-200 px-4 py-2">
            <p className="text-sm text-amber-700">
              <strong>案{selectedProposal.id}</strong>の修正箇所を入力してください（例：お皿を白にしたい、盛り付けをもっと立体的になど）
            </p>
          </div>
        )}

        {/* 入力エリア */}
        <ChatInput
          onSend={(content, imageBase64, imageUrl) => {
            // 修正入力後は確認UIを非表示にして、修正待ち状態を解除
            if (awaitingModificationInput) {
              setAwaitingModificationInput(false);
              setShowProposalConfirmation(false);
            }
            handleSendMessage(content, imageBase64, imageUrl);
          }}
          isLoading={isLoading}
          placeholder={
            awaitingModificationInput
              ? '修正したい箇所を入力してください...'
              : selectedMode === 'ohisama'
                ? '商品名を入力、または画像をアップロードしてください'
                : 'テーマ食材を入力してください（例：鮭、豚肉、きのこ）'
          }
        />
      </main>
    </div>
  );
}
