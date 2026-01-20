"use client";

import { Loader2, Lock, LogIn, Mail } from "lucide-react";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function SignInPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		const result = await signIn("credentials", {
			email,
			password,
			redirect: false,
		});

		if (result?.error) {
			setError("メールアドレスまたはパスワードが正しくありません");
			setIsLoading(false);
		} else {
			window.location.href = "/";
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				{/* ロゴ */}
				<div className="text-center mb-8">
					<div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
						<span className="text-3xl">📸</span>
					</div>
					<h1 className="text-2xl font-bold text-gray-800">
						フードスタイリング アシスタント
					</h1>
					<p className="text-gray-600 mt-2">まゆみ様専用ツール</p>
				</div>

				{/* サインインフォーム */}
				<div className="bg-white rounded-2xl shadow-xl p-8">
					<h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
						ログイン
					</h2>

					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								メールアドレス
							</label>
							<div className="relative">
								<Mail
									size={18}
									className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
								/>
								<input
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
									className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
									placeholder="mayumi@example.com"
								/>
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								パスワード
							</label>
							<div className="relative">
								<Lock
									size={18}
									className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
								/>
								<input
									type="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									minLength={6}
									className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
									placeholder="6文字以上"
								/>
							</div>
						</div>

						{error && (
							<div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
								{error}
							</div>
						)}

						<button
							type="submit"
							disabled={isLoading}
							className="w-full py-3 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isLoading ? (
								<Loader2 size={20} className="animate-spin" />
							) : (
								<>
									<LogIn size={20} />
									ログイン
								</>
							)}
						</button>
					</form>

					<p className="text-xs text-gray-500 text-center mt-4">
						初回ログイン時は自動的にアカウントが作成されます
					</p>
				</div>
			</div>
		</div>
	);
}
