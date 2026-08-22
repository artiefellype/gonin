import React, { ButtonHTMLAttributes } from "react";
import Image from "next/image";
import { UserProps } from "@/types";

export interface MenuButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  user?: UserProps;
}

export const MenuButton = ({ user, ...rest }: MenuButtonProps) => {
  return (
    <button {...rest}>
      <div className="hidden max-w-[170px] flex-col items-end justify-center text-primary lg:flex">
        <h3 className="h-5 max-w-full truncate text-sm font-bold">
          {user?.displayName || "Usuário"}
        </h3>
        <p className="max-w-full truncate text-xs font-medium text-mutedText">
          {user?.email}
        </p>
      </div>
      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-borderDark bg-secondary">
        <Image
          src={user?.photoURL || "/imgs/default_perfil.jpg"}
          alt={"perfil photo"}
          width={40}
          height={40}
          className="h-full w-full object-cover"
        />
      </div>
    </button>
  );
};
