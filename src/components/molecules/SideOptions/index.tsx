import { useUserContext } from "@/context";
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
  const { signOut } = useUserContext();
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
    <div className="flex w-full max-w-7xl bg-background md:h-[calc(100vh-72px)] md:overflow-hidden">
      <aside className="hidden w-[240px] shrink-0 md:block">
        <div className="flex h-full flex-col justify-between overflow-y-auto pr-4 pt-6">
          <nav className="rounded-lg bg-whiteColor p-3 shadow-sm">
            <p className="px-3 pb-3 text-xs font-bold uppercase text-slate-500">
              Navegação
            </p>
            <div className="flex flex-col gap-1">
              {visibleItems.map(({ key, path, label, icon: Icon }) => {
                const isActive = key === activePath;

                return (
                  <Link
                    key={String(key)}
                    href={path || "#"}
                    className={`flex h-11 items-center gap-3 rounded-md px-3 text-base font-semibold transition-colors ${
                      isActive
                        ? "bg-accent text-whiteColor"
                        : "text-primary hover:bg-accentSoft"
                    }`}
                  >
                    {Icon && (
                      <Icon
                        size={20}
                        className={
                          isActive ? "fill-whiteColor" : "fill-primary"
                        }
                      />
                    )}
                    <span>{label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="rounded-lg bg-whiteColor p-3 shadow-sm">
            <button
              onClick={handleLogout}
              className="flex h-11 w-full items-center gap-3 rounded-md px-3 text-base font-semibold text-primary transition-colors hover:bg-accentSoft"
            >
              <LogoutIcon size={22} />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="relative flex min-h-0 min-w-0 flex-1 flex-row items-start justify-center gap-4 bg-background">
        {children}
      </main>
    </div>
  );
};
