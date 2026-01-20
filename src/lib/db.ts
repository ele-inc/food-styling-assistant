"use server";

import { desc, eq } from "drizzle-orm";
import { type AppSession, appSessions, db, type NewAppSession } from "@/db";
import type { DbSession } from "./db-types";

// Convert DB row to DbSession format
function toDbSession(row: AppSession): DbSession {
	return {
		id: row.id,
		user_id: row.userId,
		title: row.title,
		mode: row.mode,
		theme: row.theme,
		products: row.products as DbSession["products"],
		messages: row.messages as DbSession["messages"],
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
