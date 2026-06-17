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

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <>
      <div className="h-14 w-screen bg-primary" />
      <div className="fixed bottom-0 z-50 flex h-14 w-screen flex-row items-center justify-between gap-4 bg-primary px-8">
        <Link href={"/forum"}>
          <button>
            <HiHome
              size={28}
              className="fill-secondary hover:fill-whiteColor"
            />
          </button>
        </Link>
        <Link href={"/topics"}>
          <button>
            <FaComments
              size={28}
              className="fill-secondary hover:fill-whiteColor"
            />
          </button>
        </Link>
        <button onClick={handleLogout} aria-label="Sair">
          <LogoutIcon
            size={28}
            className="text-secondary hover:text-whiteColor"
          />
        </button>
      </div>
    </>
  );
};
