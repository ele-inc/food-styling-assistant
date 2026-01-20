import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MainApp } from "@/components/MainApp";

export default async function HomePage() {
	const session = await auth();

	if (!session?.user) {
		redirect("/auth/signin");
	}

	return <MainApp user={session.user} />;
}
