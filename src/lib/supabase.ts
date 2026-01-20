import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// ビルド時はダミーのクライアントを作成
let supabase: SupabaseClient;

if (supabaseUrl && supabaseAnonKey) {
	supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
	// ビルド時のダミー（実行時にはエラーになる）
	supabase = {
		auth: {
			getUser: async () => ({ data: { user: null }, error: null }),
			signUp: async () => ({
				data: null,
				error: new Error("Supabase not configured"),
			}),
			signInWithPassword: async () => ({
				data: null,
				error: new Error("Supabase not configured"),
			}),
			signOut: async () => ({ error: null }),
			onAuthStateChange: () => ({
				data: { subscription: { unsubscribe: () => {} } },
			}),
		},
		from: () => ({
			select: () => ({
				eq: () => ({ order: () => ({ data: [], error: null }) }),
			}),
			upsert: () => ({ error: null }),
			delete: () => ({ eq: () => ({ error: null }) }),
		}),
	} as unknown as SupabaseClient;
}

export { supabase };

// 型定義
export interface DbSession {
	id: string;
	user_id: string;
	title: string;
	mode: "ohisama" | "coop_letter";
	theme?: string; // コープレター用のテーマ
	products: DbProduct[];
	messages: DbMessage[];
	is_completed: boolean;
	created_at: string;
	updated_at: string;
}

export interface DbProduct {
	id: string;
	name: string;
	image_url?: string;
	shape: string;
	selected_proposal?: DbProposal;
	generated_image_url?: string;
	recipe?: string; // コープレター用
}

export interface DbProposal {
	id: string;
	title: string;
	description: string;
	menu_material: string;
	equipment: string;
}

export interface DbMessage {
	id: string;
	role: "user" | "assistant";
	content: string;
	image_url?: string;
	generated_image_url?: string;
	timestamp: string;
}

// セッション操作
export async function fetchSessions(userId: string): Promise<DbSession[]> {
	const { data, error } = await supabase
		.from("sessions")
		.select("*")
		.eq("user_id", userId)
		.order("updated_at", { ascending: false });

	if (error) {
		console.error("Error fetching sessions:", error);
		return [];
	}

	return data || [];
}

export async function saveSessionToDb(session: DbSession): Promise<void> {
	const { error } = await supabase
		.from("sessions")
		.upsert(session, { onConflict: "id" });

	if (error) {
		console.error("Error saving session:", error);
		throw error;
	}
}

export async function deleteSessionFromDb(sessionId: string): Promise<void> {
	const { error } = await supabase
		.from("sessions")
		.delete()
		.eq("id", sessionId);

	if (error) {
		console.error("Error deleting session:", error);
		throw error;
	}
}

// 認証
export async function signUp(email: string, password: string) {
	const { data, error } = await supabase.auth.signUp({
		email,
		password,
	});

	if (error) throw error;
	return data;
}

export async function signIn(email: string, password: string) {
	const { data, error } = await supabase.auth.signInWithPassword({
		email,
		password,
	});

	if (error) throw error;
	return data;
}

export async function signOut() {
	const { error } = await supabase.auth.signOut();
	if (error) throw error;
}

export async function getCurrentUser() {
	const {
		data: { user },
	} = await supabase.auth.getUser();
	return user;
}
