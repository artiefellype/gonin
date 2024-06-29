// pages/404.tsx
import { NextPage } from "next";
import Link from "next/link";
import Image from "next/image";

const Custom404: NextPage = () => {
  return (
    <div className="text-center h-screen text-slate-900 flex flex-col justify-center items-center gap-3">
      <Image src={"/imgs/404 Error Page not Found with people connecting a plug-pana.svg"} alt={"Image from StorySet"} width={450} height={450} />
      <p className="font-thin text-sm">
        A página que você está procurando não existe ou está em desenvolvimento.
      </p>
      <Link href="/">
        <button className="px-4 py-1 z-10 bg-slate-500 hover:bg-slate-600 transition-colors delay-75 text-whiteColor font-bold text-sm rounded-xl">
          Voltar para a Home
        </button>
      </Link>
    </div>
  );
};

export default Custom404;
