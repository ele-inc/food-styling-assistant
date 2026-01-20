import { desc, eq } from "drizzle-orm";
import { type AppSession, appSessions, db, type NewAppSession } from "@/db";

// Type definitions for frontend use
export interface DbSession {
	id: string;
	user_id: string;
	title: string;
	mode: "ohisama" | "coop_letter";
	theme?: string | null;
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
	recipe?: string;
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

// Convert DB row to DbSession format
function toDbSession(row: AppSession): DbSession {
	return {
		id: row.id,
		user_id: row.userId,
		title: row.title,
		mode: row.mode,
		theme: row.theme,
		products: row.products as DbProduct[],
		messages: row.messages as DbMessage[],
		is_completed: row.isCompleted,
		created_at: row.createdAt.toISOString(),
		updated_at: row.updatedAt.toISOString(),
	};
}

// Session operations
export async function fetchSessions(userId: string): Promise<DbSession[]> {
	try {
		const rows = await db
			.select()
			.from(appSessions)
			.where(eq(appSessions.userId, userId))
			.orderBy(desc(appSessions.updatedAt));

		return rows.map(toDbSession);
	} catch (error) {
		console.error("Error fetching sessions:", error);
		return [];
	}
}

export async function saveSessionToDb(session: DbSession): Promise<void> {
	try {
		const data: NewAppSession = {
			id: session.id,
			userId: session.user_id,
			title: session.title,
			mode: session.mode,
			theme: session.theme ?? undefined,
			products: session.products,
			messages: session.messages,
			isCompleted: session.is_completed,
			createdAt: new Date(session.created_at),
			updatedAt: new Date(session.updated_at),
		};

		await db
			.insert(appSessions)
			.values(data)
			.onConflictDoUpdate({
				target: appSessions.id,
				set: {
					title: data.title,
					theme: data.theme,
					products: data.products,
					messages: data.messages,
					isCompleted: data.isCompleted,
					updatedAt: data.updatedAt,
				},
			});
	} catch (error) {
		console.error("Error saving session:", error);
		throw error;
	}
}

export async function deleteSessionFromDb(sessionId: string): Promise<void> {
	try {
		await db.delete(appSessions).where(eq(appSessions.id, sessionId));
	} catch (error) {
		console.error("Error deleting session:", error);
		throw error;
	}
}
