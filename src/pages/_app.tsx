import { UserContextProvider } from "@/context/appContext";
import "@/styles/globals.css";
import { AppProps } from "next/app";


export default function App({ Component, pageProps }: AppProps) {

  return (
    <UserContextProvider>
      <Component {...pageProps} />
    </UserContextProvider>
  );
}
