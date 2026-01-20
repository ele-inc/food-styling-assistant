"use client";

import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Calendar, ChevronRight, History, Plus, Trash2 } from "lucide-react";

// 汎用的なセッション型
interface SessionLike {
	id: string;
	title: string;
	createdAt: Date;
	products: Array<{ id: string }>;
}

interface HistorySidebarProps {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	sessions: any[];
	currentSessionId: string | null;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onSelectSession: (session: any) => void;
	onDeleteSession: (sessionId: string) => void;
	onNewSession: () => void;
	isOpen: boolean;
	onToggle: () => void;
}

export default function HistorySidebar({
	sessions,
	currentSessionId,
	onSelectSession,
	onDeleteSession,
	onNewSession,
	isOpen,
	onToggle,
}: HistorySidebarProps) {
	return (
		<>
			{/* モバイル用オーバーレイ */}
			{isOpen && (
				<div
					className="fixed inset-0 bg-black/30 z-40 lg:hidden"
					onClick={onToggle}
				/>
			)}

			{/* サイドバー */}
			<aside
				className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-72 bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          flex flex-col
        `}
			>
				{/* ヘッダー */}
				<div className="p-4 border-b border-gray-200">
					<div className="flex items-center gap-2 mb-4">
						<History size={20} className="text-primary-500" />
						<h2 className="font-semibold text-gray-800">撮影プラン履歴</h2>
					</div>
					<button
						onClick={() => onNewSession()}
						className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors font-medium"
					>
						<Plus size={18} />
						新しいプラン
					</button>
				</div>

				{/* セッション一覧 */}
				<div className="flex-1 overflow-y-auto p-2">
					{sessions.length === 0 ? (
						<div className="text-center py-8 text-gray-500">
							<History size={40} className="mx-auto mb-2 opacity-30" />
							<p className="text-sm">履歴がありません</p>
						</div>
					) : (
						<div className="space-y-1">
							{sessions.map((session) => (
								<div
									key={session.id}
									className={`
                    group relative rounded-xl transition-all cursor-pointer
                    ${
											currentSessionId === session.id
												? "bg-primary-50 border border-primary-200"
												: "hover:bg-gray-50 border border-transparent"
										}
                  `}
									onClick={() => onSelectSession(session)}
								>
									<div className="p-3">
										<div className="flex items-start justify-between">
											<div className="flex-1 min-w-0">
												<h3
													className={`text-sm font-medium truncate ${
														currentSessionId === session.id
															? "text-primary-700"
															: "text-gray-800"
													}`}
												>
													{session.title}
												</h3>
												<div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
													<Calendar size={12} />
													{format(session.createdAt, "M/d (E)", { locale: ja })}
												</div>
												{session.products.length > 0 && (
													<p className="text-xs text-gray-500 mt-1">
														{session.products.length}件の商品
													</p>
												)}
											</div>
											<div className="flex items-center gap-1">
												<button
													onClick={(e) => {
														e.stopPropagation();
														if (confirm("このプランを削除しますか？")) {
															onDeleteSession(session.id);
														}
													}}
													className="p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
												>
													<Trash2 size={14} />
												</button>
												<ChevronRight
													size={16}
													className={
														currentSessionId === session.id
															? "text-primary-500"
															: "text-gray-300"
													}
												/>
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</aside>
		</>
	);
}
