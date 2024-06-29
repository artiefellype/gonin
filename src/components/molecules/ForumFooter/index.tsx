import React from "react";
import Link from "next/link";
import { HiHome } from "react-icons/hi";
import { MdExplore } from "react-icons/md";
import { FaComments } from "react-icons/fa";

export const ForumFooter = () => {
  return (
    <>
      <div className="w-screen h-14 bg-slate-900">
        Nao era para voce ver isso :\
      </div>
      <div className="w-screen h-14 bg-slate-900 fixed bottom-0 z-50 flex flex-row gap-4 justify-between items-center px-8">
        <Link href={"/forum"}>
          <button>
            <HiHome size={28} className="fill-slate-500 hover:fill-slate-600" />
          </button>
        </Link>
        <Link href={"/topics"}>
          <button>
            <FaComments
              size={28}
              className="fill-slate-500 hover:fill-slate-600"
            />
          </button>
        </Link>
        <Link href={"/explore"}>
          <button>
            <MdExplore
              size={28}
              className="fill-slate-500 hover:fill-slate-600"
            />
          </button>
        </Link>
      </div>
    </>
  );
};
