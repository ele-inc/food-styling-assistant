import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "./db";
import { users } from "./db/schema";

export const { handlers, signIn, signOut, auth } = NextAuth({
	providers: [
		Credentials({
			name: "Email",
			credentials: {
				email: { label: "メールアドレス", type: "email" },
				password: { label: "パスワード", type: "password" },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					return null;
				}

				const email = credentials.email as string;
				const password = credentials.password as string;

				// ユーザーを検索
				const user = await db
					.select()
					.from(users)
					.where(eq(users.email, email))
					.limit(1);

				if (user.length === 0) {
					// ユーザーが存在しない場合は新規作成（簡易的な実装）
					const newUser = await db
						.insert(users)
						.values({
							email,
							password,
							name: email.split("@")[0],
						})
						.returning();

					return {
						id: newUser[0].id,
						email: newUser[0].email,
						name: newUser[0].name,
					};
				}

				// パスワード確認（簡易実装：本番では bcrypt 等を使用）
				if (user[0].password !== password) {
					return null;
				}

				return {
					id: user[0].id,
					email: user[0].email,
					name: user[0].name,
				};
			},
		}),
	],
	callbacks: {
		jwt({ token, user }) {
			if (user) {
				token.id = user.id;
			}
			return token;
		},
		session({ session, token }) {
			if (token.id) {
				session.user.id = token.id as string;
			}
			return session;
		},
	},
	session: {
		strategy: "jwt",
	},
	pages: {
		signIn: "/auth/signin",
	},
});
