import { UserContextProvider } from "@/context";
import "../styles/globals.css";
import { AppProps } from "next/app";
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <UserContextProvider>
      <Component {...pageProps} />
    </UserContextProvider>
  );
}
