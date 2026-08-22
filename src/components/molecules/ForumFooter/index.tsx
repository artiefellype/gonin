import React from "react";
import Link from "next/link";
import { HiHome } from "react-icons/hi";
import { FaComments } from "react-icons/fa";
import { TbLogin as LogoutIcon } from "react-icons/tb";
import { useUserContext } from "@/context";
import { useRouter } from "next/router";

export const ForumFooter = () => {
  const { signOut } = useUserContext();
  const router = useRouter();
  const isForumActive = router.pathname.startsWith("/forum");
  const isTopicsActive = router.pathname.startsWith("/topics");

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <>
      <div className="h-[calc(64px+env(safe-area-inset-bottom))] w-full bg-background" />
      <div className="fixed bottom-0 left-0 right-0 z-50 flex h-[calc(60px+env(safe-area-inset-bottom))] w-full flex-row items-start justify-around gap-3 border-t border-borderDark bg-panel/95 px-4 pt-2 backdrop-blur-xl">
        <Link href={"/forum"}>
          <button
            className={`grid h-11 w-11 place-items-center rounded-xl transition-colors ${
              isForumActive
                ? "bg-accentSoft text-accent"
                : "text-mutedText hover:bg-accentSoft hover:text-accent"
            }`}
            aria-label="Início"
            aria-current={isForumActive ? "page" : undefined}
          >
            <HiHome
              size={24}
              className="fill-current"
            />
          </button>
        </Link>
        <Link href={"/topics"}>
          <button
            className={`grid h-11 w-11 place-items-center rounded-xl transition-colors ${
              isTopicsActive
                ? "bg-accentSoft text-accent"
                : "text-mutedText hover:bg-accentSoft hover:text-accent"
            }`}
            aria-label="Comunidades"
            aria-current={isTopicsActive ? "page" : undefined}
          >
            <FaComments
              size={22}
              className="fill-current"
            />
          </button>
        </Link>
        <button onClick={handleLogout} aria-label="Sair" className="grid h-11 w-11 place-items-center rounded-xl text-mutedText transition-colors hover:bg-coralSoft hover:text-coral">
          <LogoutIcon
            size={25}
            className="text-current"
          />
        </button>
      </div>
    </>
  );
};
