// pages/404.tsx
import { NextPage } from "next";
import Link from "next/link";
import Image from "next/image";

const Custom404: NextPage = () => {
  return (
    <div className="flex min-h-[100svh] flex-col items-center justify-center gap-5 bg-transparent px-4 py-8 text-center text-primary">
      <div className="w-full max-w-sm rounded-2xl border border-borderDark bg-panel/95 p-4 shadow-lg sm:p-6">
        <Image
          src={"/imgs/404 Error Page not Found with people connecting a plug-pana.svg"}
          alt={"Image from StorySet"}
          width={360}
          height={360}
          className="mx-auto h-auto w-full max-w-[300px]"
        />
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-accent">
          404
        </p>
        <h1 className="mt-1 text-2xl font-semibold">
          Essa conversa saiu do ar
        </h1>
        <p className="mt-2 text-sm font-medium text-mutedText">
          A página que você está procurando não existe ou está em desenvolvimento.
        </p>
      </div>
      <Link href="/">
        <button className="z-10 rounded-lg bg-accent px-4 py-2 text-sm font-bold text-background transition-colors hover:bg-accent/90">
          Voltar para a Home
        </button>
      </Link>
    </div>
  );
};

export default Custom404;
