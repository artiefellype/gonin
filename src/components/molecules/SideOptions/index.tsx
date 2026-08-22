import { useUserContext } from "@/context";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useMemo } from "react";
import { IconType } from "react-icons";
import { TbLogin as LogoutIcon } from "react-icons/tb";

export interface MenuItemsProps {
  label: React.ReactNode;
  key?: React.Key | null;
  icon?: IconType;
  path?: string;
  children?: MenuItemsProps[];
  show?: boolean;
}

interface Props {
  children: React.ReactNode;
  items: MenuItemsProps[];
}

export const SideOptions = ({ children, items }: Props) => {
  const { signOut, user } = useUserContext();
  const router = useRouter();

  const activePath = useMemo(() => {
    const paths = router.pathname.split("/");
    return paths[1] || "forum";
  }, [router.pathname]);

  const visibleItems = items.filter((item) => item.show !== false);

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <div className="flex w-full justify-center bg-background md:h-screen md:min-h-0 md:overflow-hidden">
      <div className="flex h-full min-h-0 w-full max-w-[1240px] bg-background">
        <aside className="hidden shrink-0 border-r border-borderDark bg-background md:block md:w-[88px] lg:w-[244px]">
          <div className="flex h-full flex-col justify-between overflow-y-auto px-4 py-4">
            <div>
              <Link
                href="/forum"
                className="mb-6 grid h-11 w-11 place-items-center rounded-lg text-xl font-semibold text-primary transition-colors hover:bg-secondary md:mx-auto lg:mx-0"
              >
                G
              </Link>
              <nav className="flex flex-col gap-1">
                {visibleItems.map(({ key, path, label, icon: Icon }) => {
                  const isActive = key === activePath;

                  return (
                    <Link
                      key={String(key)}
                      href={path || "#"}
                      className={`flex h-12 items-center gap-4 rounded-full text-[16px] font-normal transition-colors md:justify-center md:px-0 lg:justify-start lg:px-3 ${
                        isActive
                          ? "text-primary"
                          : "text-primary/90 hover:bg-secondary"
                      }`}
                    >
                      {Icon && (
                        <Icon
                          size={22}
                          className={isActive ? "fill-primary" : "fill-current"}
                        />
                      )}
                      <span className="hidden lg:inline">{label}</span>
                    </Link>
                  );
                })}
              </nav>

              <button
                onClick={() => router.push("/forum")}
                className="mt-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-base font-semibold text-background transition-colors hover:bg-primary/90 md:mx-auto lg:w-full"
              >
                <span className="lg:hidden">+</span>
                <span className="hidden lg:inline">Nova conversa</span>
              </button>
            </div>

            <div className="flex flex-col items-center gap-2 lg:flex-row lg:items-center">
              <Link
                href={`/profile/${user?.user?.uid || ""}`}
                className="flex h-14 w-14 min-w-0 items-center justify-center gap-3 rounded-full px-2 transition-colors hover:bg-secondary lg:w-auto lg:flex-1 lg:justify-start"
              >
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-secondary">
                  <Image
                    src={user?.user?.photoURL || "/imgs/default_perfil.jpg"}
                    alt="Perfil"
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="hidden min-w-0 flex-1 lg:block">
                  <p className="truncate text-sm font-semibold text-primary">
                    {user?.user?.displayName ||
                      user?.user?.email?.split("@")[0] ||
                      "Gonin"}
                  </p>
                  <p className="truncate text-xs text-mutedText">
                    {user?.user?.email || "Sessão ativa"}
                  </p>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-mutedText transition-colors hover:bg-coralSoft hover:text-coral"
                aria-label="Sair"
              >
                <LogoutIcon size={20} />
              </button>
            </div>
          </div>
        </aside>

        <main className="relative flex h-full min-h-0 min-w-0 flex-1 flex-row items-start justify-center gap-4 overflow-hidden bg-background">
          {children}
        </main>
      </div>
    </div>
  );
};
