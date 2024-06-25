import MenuButton from "@/components/atoms/MenuButton";
import { User, useUserContext } from "@/context";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import Image from "next/image";
import { CustomPopover } from "@/components/atoms/CustomPopover";

interface Props {
  isMobile: boolean;
}

export function Header({ isMobile }: Props) {
  const { signOut, user } = useUserContext();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <div className="w-full bg-whiteColor flex items-center justify-center">
      <div className="w-full max-w-7xl h-[72px] flex justify-between p-4 items-center">
        <div className=" flex md:justify-center">
          <h1 className="font-extrabold text-3xl text-primary ">GONIN</h1>
        </div>
        {!isMobile ? (
          <div className="flex flex-row gap-2">
            <CustomPopover
              trigger={
                <MenuButton
                  className="flex flex-row gap-3 items-center rounded-full p-2 hover:bg-secondary"
                  user={user as User}
                />
              }
              content={
                <div className="flex flex-col ">
                  <button
                    className="bg-whiteColor text-primary px-4 py-2 hover:bg-secondary"
                    onClick={handleSignOut}
                  >
                    Sair
                  </button>
                </div>
              }
            />
          </div>
        ) : (
          <div className="flex flex-row">
            <div className="w-10 h-10 flex justify-center items-center">
              <CustomPopover
                trigger={
                  <Image
                    src={user?.user?.photoURL!! || ""}
                    alt={"perfil photo"}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                }
                content={
                  <div className="flex flex-col ">
                    <button
                      className="bg-whiteColor text-primary px-4 py-2 hover:bg-secondary"
                      onClick={handleSignOut}
                    >
                      Sair
                    </button>
                  </div>
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
