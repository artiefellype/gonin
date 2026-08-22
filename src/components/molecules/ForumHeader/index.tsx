import { useUserContext } from "@/context";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { MenuButton } from "@/components/atoms/MenuButton";
import { UserServices } from "@/services/userServices";
import { UserProps } from "@/types";
import { FaPlus, FaSearch } from "react-icons/fa";
import Link from "next/link";

interface Props {
  isMobile: boolean;
}

export const ForumHeader = ({ isMobile }: Props) => {
  const { user } = useUserContext();
  const [userInfo, setUserInfo] = useState<UserProps | undefined>(undefined);
  const [userPhoto, setUserPhoto] = useState<string>(
    "/imgs/default_perfil.jpg"
  );
  const router = useRouter();

  useEffect(() => {
    const fetchUserHeader = async () => {
      if (user?.user?.uid) {
        try {
          const fetchedUserInfo = await UserServices.getUserById(user.user.uid);
          setUserInfo(fetchedUserInfo);
          if (fetchedUserInfo.photoURL) {
            setUserPhoto(fetchedUserInfo.photoURL);
          }
        } catch (error: any) {
          console.error("Error fetching user info:", error.message);
        }
      }
    };

    fetchUserHeader();
  }, [user]);

  return (
    <div className="sticky top-0 z-40 flex w-full items-center justify-center border-b border-borderDark bg-panel/95 backdrop-blur-xl">
      <div className="flex h-14 w-full max-w-7xl items-center justify-between gap-3 px-3 sm:h-[72px] sm:px-4">
        <Link href="/forum" className="flex min-w-0 items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent text-base font-black text-background sm:h-10 sm:w-10 sm:text-lg">
            G
          </span>
          <div className="hidden min-w-0 flex-col sm:flex">
            <h1 className="truncate text-xl font-semibold leading-5 text-primary">
              Gonin
            </h1>
            <p className="truncate text-xs font-medium text-mutedText">
              Conversas que continuam
            </p>
          </div>
        </Link>

        {!isMobile && (
          <label className="hidden min-w-0 flex-1 items-center gap-2 rounded-lg border border-borderDark bg-secondary px-3 py-2 text-mutedText lg:flex">
            <FaSearch size={14} />
            <input
              aria-label="Buscar"
              className="min-w-0 flex-1 bg-transparent text-sm text-primary placeholder:text-mutedText focus:outline-none"
              placeholder="Buscar conversas, tópicos ou pessoas"
              readOnly
            />
          </label>
        )}

        <div className="flex items-center gap-2">
          {!isMobile && (
            <button
              onClick={() => router.push("/forum")}
              className="hidden h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-bold text-background transition-colors hover:bg-accent/90 md:flex"
            >
              <FaPlus size={13} />
              Novo post
            </button>
          )}
          {!isMobile ? (
            <MenuButton
              className="flex items-center gap-3 rounded-lg border border-borderDark bg-whiteColor p-2 transition-colors hover:border-accent"
              user={userInfo}
            />
          ) : (
            <Link
              href={`/profile/${user?.user?.uid || ""}`}
              className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-borderDark bg-secondary sm:h-10 sm:w-10"
            >
              <Image
                src={userPhoto}
                alt={"perfil photo"}
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
