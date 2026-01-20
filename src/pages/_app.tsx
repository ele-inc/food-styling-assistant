import type { AppProps } from "next/app";
import "@/app_legacy/globals.css";

export default function App({ Component, pageProps }: AppProps) {
	return <Component {...pageProps} />;
}
