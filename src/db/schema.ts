import {
	boolean,
	jsonb,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

// Users table
export const users = pgTable("users", {
	id: uuid("id").defaultRandom().primaryKey(),
	name: text("name"),
	email: text("email").unique(),
	password: text("password"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Application tables
export const appSessions = pgTable("app_sessions", {
	id: uuid("id").defaultRandom().primaryKey(),
	userId: uuid("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	title: text("title").notNull(),
	mode: text("mode", { enum: ["ohisama", "coop_letter"] }).notNull(),
	theme: text("theme"),
	products: jsonb("products").$type<ProductJson[]>().default([]).notNull(),
	messages: jsonb("messages").$type<MessageJson[]>().default([]).notNull(),
	isCompleted: boolean("is_completed").default(false).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// JSON types for JSONB columns
export interface ProductJson {
	id: string;
	name: string;
	image_url?: string;
	shape: string;
	selected_proposal?: {
		id: string;
		title: string;
		description: string;
		menu_material: string;
		equipment: string;
	};
	generated_image_url?: string;
	recipe?: string;
}

export interface MessageJson {
	id: string;
	role: "user" | "assistant";
	content: string;
	image_url?: string;
	generated_image_url?: string;
	timestamp: string;
}

// Type exports for use in application
export type User = typeof users.$inferSelect;
export type AppSession = typeof appSessions.$inferSelect;
export type NewAppSession = typeof appSessions.$inferInsert;
