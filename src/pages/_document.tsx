import { GetServerSideProps } from "next";
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="pt-br">
      <Head>
      <meta
          name="title"
          content="5chan"
        />
        <meta
          name="description"
          content="Fórum público 5chan"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/imgs/fivechan_logo.png" />

        {/* Configuração PWA */}

        <meta name="background-color" content="#FCFCFC" />
        <link rel="shortcut icon" href="/imgs/fivechan_logo.png" />
        

        {/* Splash Screens IPhone */}
        
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
