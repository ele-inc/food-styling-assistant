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
