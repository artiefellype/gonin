import { useUserContext } from "@/context";
import { UserServices } from "@/services/userServices";
import { UserProps } from "@/types";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FaSearch, FaTimes, FaUserFriends } from "react-icons/fa";
import { FriendActionButton } from "../FriendActionButton";

interface UserSearchProps {
  compact?: boolean;
  className?: string;
}

export const UserSearch = ({ compact = false, className = "" }: UserSearchProps) => {
  const { user } = useUserContext();
  const loggedUserId = user?.user?.uid || "";
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  useEffect(() => {
    const searchTerm = query.trim();

    if (!open || searchTerm.length < 2) {
      setResults([]);
      setLoading(false);
      setError("");
      return;
    }

    setLoading(true);
    setError("");
    const timer = window.setTimeout(async () => {
      try {
        const foundUsers = await UserServices.searchUsers(
          searchTerm,
          loggedUserId
        );
        setResults(foundUsers);
      } catch (searchError) {
        console.error("Erro ao buscar usuários:", searchError);
        setError("Não foi possível buscar usuários agora.");
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => window.clearTimeout(timer);
  }, [loggedUserId, open, query]);

  useEffect(() => {
    if (!open) return;
    window.setTimeout(() => inputRef.current?.focus(), 80);
  }, [open]);

  const closeSearch = () => {
    setOpen(false);
    setQuery("");
    setResults([]);
    setError("");
  };

  const resultList = (
    <div className="min-h-0 overflow-y-auto overscroll-contain">
      {query.trim().length < 2 && (
        <div className="flex flex-col items-center px-5 py-9 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-accentSoft text-accent">
            <FaUserFriends size={18} />
          </span>
          <p className="mt-3 text-sm font-semibold text-primary">
            Busque por nome de usuário
          </p>
          <p className="mt-1 text-xs text-mutedText">
            Digite pelo menos duas letras.
          </p>
        </div>
      )}

      {loading && query.trim().length >= 2 && (
        <div className="space-y-2 p-3">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="h-16 animate-pulse rounded-xl bg-secondary"
            />
          ))}
        </div>
      )}

      {!loading && error && (
        <p className="m-3 rounded-lg border border-coral/30 bg-coralSoft px-3 py-2 text-sm font-semibold text-coral">
          {error}
        </p>
      )}

      {!loading && !error && query.trim().length >= 2 && results.length === 0 && (
        <div className="px-5 py-9 text-center">
          <p className="text-sm font-semibold text-primary">
            Nenhum usuário encontrado
          </p>
          <p className="mt-1 text-xs text-mutedText">
            Tente outro nome ou apelido.
          </p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="p-2">
          {results.map((foundUser) => {
            const profileId = foundUser.uid || foundUser.id;
            const displayName =
              foundUser.displayName ||
              "Usuário do Gonin";

            return (
              <div
                key={profileId}
                className="grid grid-cols-[2.75rem_minmax(0,1fr)] gap-3 rounded-xl px-2.5 py-2.5 transition-colors hover:bg-secondary/70 sm:flex sm:items-center sm:px-3"
              >
                <Link
                  href={`/profile/${profileId}`}
                  onClick={closeSearch}
                  className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-secondary"
                >
                  <Image
                    src={foundUser.photoURL || "/imgs/default_perfil.jpg"}
                    alt={displayName}
                    width={44}
                    height={44}
                    className="h-full w-full object-cover"
                  />
                </Link>

                <Link
                  href={`/profile/${profileId}`}
                  onClick={closeSearch}
                  className="min-w-0 flex-1"
                >
                  <p className="truncate text-sm font-semibold text-primary">
                    {displayName}
                  </p>
                  <p className="truncate text-xs text-mutedText">
                    {foundUser.username
                      ? `@${foundUser.username}`
                      : foundUser.bio || foundUser.location || "Ver perfil"}
                  </p>
                </Link>

                <div className="col-span-2 flex justify-end border-t border-borderDark/70 pt-2 sm:col-span-1 sm:shrink-0 sm:border-0 sm:pt-0">
                  <FriendActionButton targetUserId={profileId} compact />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  if (compact) {
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-borderDark bg-secondary text-mutedText transition-colors hover:border-accent hover:text-accent"
          aria-label="Buscar usuários"
        >
          <FaSearch size={17} />
        </button>

        {open &&
          mounted &&
          createPortal(
          <div
            className="fixed inset-0 z-[9999] overflow-hidden bg-black/35 backdrop-blur-[1px] sm:bg-transparent sm:backdrop-blur-0"
            onMouseDown={closeSearch}
          >
            <section
              className="absolute left-3 right-3 top-[calc(3.5rem+0.5rem)] mx-auto flex max-h-[calc(100svh-5rem)] max-w-[420px] flex-col overflow-hidden rounded-2xl border border-borderDark bg-panel shadow-2xl ring-1 ring-accent/10 sm:left-auto sm:right-4 sm:top-20 sm:w-[420px]"
              role="dialog"
              aria-modal="true"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <header className="flex shrink-0 items-center gap-2 border-b border-borderDark p-2.5 sm:p-3">
                <label className="flex h-11 min-w-0 flex-1 items-center gap-3 rounded-lg border border-borderDark bg-background px-4 text-mutedText focus-within:border-accent">
                  <FaSearch size={14} />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-primary placeholder:text-mutedText focus:outline-none"
                    placeholder="Buscar usuários"
                  />
                </label>
                <button
                  type="button"
                  onClick={closeSearch}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-mutedText transition-colors hover:bg-secondary hover:text-primary"
                  aria-label="Fechar busca"
                >
                  <FaTimes size={16} />
                </button>
              </header>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                {resultList}
              </div>
            </section>
          </div>,
          document.body
        )}
      </>
    );
  }

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <label className="flex h-11 min-w-0 flex-1 items-center gap-3 rounded-lg border border-borderDark bg-background px-4 text-mutedText transition-colors focus-within:border-accent hover:border-accent/60">
        <FaSearch size={14} />
        <input
          ref={inputRef}
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          aria-label="Buscar usuários"
          className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-primary placeholder:text-mutedText focus:outline-none"
          placeholder="Pesquisar usuários"
        />
        {query && (
          <button
            type="button"
            onClick={closeSearch}
            className="grid h-7 w-7 place-items-center rounded-full text-mutedText transition-colors hover:bg-background hover:text-primary"
            aria-label="Limpar busca"
          >
            <FaTimes size={12} />
          </button>
        )}
      </label>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-[70] max-h-[420px] overflow-hidden rounded-xl border border-borderDark bg-panel shadow-2xl">
          {resultList}
        </div>
      )}
    </div>
  );
};
