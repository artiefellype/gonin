import { logout } from "@/firebase/authentication";
import React from "react";
import {
  FaRightToBracket as LogoutIcon,
  FaMagnifyingGlass as SearchIcon,
} from "react-icons/fa6";

interface ForumHeadProps {
  refresh: () => void;
}

export default function ForumHead({ refresh }: ForumHeadProps) {
  return (
    <>
      <div className="w-full h-20 bg-white flex justify-between p-4 items-center">
        <h1 className="font-black text-gray-700 text-2xl">5CHAN</h1>
        <div className="flex flex-row gap-2">
          {/* <SearchIcon size={26} className="text-gray-400" /> */}
          <button type="button" onClick={logout}>
            <LogoutIcon size={28} className="text-gray-400" />
          </button>
        </div>
      </div>
      <div className="w-full h-20 bg-gray-800 flex items-center justify-start pl-4">
        <ul className="flex flex-row gap-5">
          <button type="button" onClick={refresh}>
            <h3 className="font-bold text-gray-400">Novos</h3>
          </button>
          <button type="button" onClick={refresh}>
            <h3 className="font-bold text-gray-400">Destaques</h3>
          </button>
          <button type="button" onClick={refresh}>
            <h3 className="font-bold text-gray-400">Todos</h3>
          </button>
        </ul>
      </div>
    </>
  );
}
