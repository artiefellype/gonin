import { formatDate } from "@/services/utils/formaters";
import { PostProps } from "@/types";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FaTimes } from "react-icons/fa";
import { FaCheck, FaSpinner } from "react-icons/fa6";

interface SharePostModalProps {
  open: boolean;
  post: PostProps | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (text: string) => Promise<void>;
}

export const SharePostModal = ({
  open,
  post,
  loading = false,
  onClose,
  onSubmit,
}: SharePostModalProps) => {
  const [text, setText] = useState("");
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setStatus("idle");
      setErrorMessage("");
    }
  }, [open]);

  if (!mounted || !open || !post) return null;

  const isVideo =
    post.mediaType === "video" || post.mediaFile?.includes("/video/upload/");
  const authorName = post.user?.displayName || post.user?.username || "Usuário";
  const authorHandle = post.user?.username ? `@${post.user.username}` : "";

  const handleSubmit = async () => {
    if (status === "loading" || status === "success" || loading) return;

    setStatus("loading");
    setErrorMessage("");
    try {
      await onSubmit(text);
      setStatus("success");
      setText("");
      window.setTimeout(() => {
        setStatus("idle");
        setErrorMessage("");
        onClose();
      }, 900);
    } catch (error: any) {
      setStatus("error");
      setErrorMessage(error?.message || "Não foi possível compartilhar.");
    }
  };

  const handleClose = () => {
    if (status === "loading" || status === "success") return;

    setText("");
    setStatus("idle");
    setErrorMessage("");
    onClose();
  };

  const isBusy = loading || status === "loading";
  const isDone = status === "success";

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-end justify-center overflow-hidden bg-black/70 px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-sm sm:items-center sm:p-4"
      onClick={handleClose}
    >
      <section
        className="flex max-h-[calc(100svh-1.5rem)] w-full max-w-xl flex-col overflow-hidden rounded-t-2xl border border-borderDark bg-background shadow-2xl sm:max-h-[92svh] sm:rounded-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-borderDark px-4">
          <h2 className="text-base font-semibold text-primary">
            Compartilhar conversa
          </h2>
          <button
            type="button"
            onClick={handleClose}
            disabled={isBusy || isDone}
            className="grid h-9 w-9 place-items-center rounded-full text-mutedText transition-colors hover:bg-secondary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Fechar"
          >
            <FaTimes />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4">
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            disabled={isBusy || isDone}
            maxLength={512}
            placeholder="Adicione uma frase se quiser"
            className="min-h-[92px] w-full resize-none rounded-xl border border-borderDark bg-secondary px-4 py-3 text-base text-primary placeholder:text-mutedText/70 focus:border-accent focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
          />

          {(isBusy || isDone || status === "error") && (
            <div
              className={`mt-3 flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold ${
                isDone
                  ? "border-accent/40 bg-accentSoft text-accent"
                  : status === "error"
                    ? "border-coral/40 bg-coralSoft text-coral"
                    : "border-borderDark bg-panel text-mutedText"
              }`}
            >
              {isBusy && <FaSpinner className="animate-spin" />}
              {isDone && <FaCheck />}
              <span>
                {isDone
                  ? "Compartilhado!"
                  : status === "error"
                    ? errorMessage
                    : "Compartilhando..."}
              </span>
            </div>
          )}

          <article className="mt-4 overflow-hidden rounded-xl border border-borderDark bg-panel sm:rounded-2xl">
            <div className="p-3">
              <div className="min-w-0">
                <span className="block truncate text-sm font-semibold text-primary">
                  {authorName}
                </span>
                <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-1.5 text-xs text-mutedText">
                  {authorHandle && (
                    <>
                      <span className="truncate">{authorHandle}</span>
                      <span>·</span>
                    </>
                  )}
                  <span className="shrink-0">{formatDate(post.createdAt)}</span>
                </div>
              </div>
              {post.title && (
                <h3 className="mt-2 text-sm font-semibold text-primary">
                  {post.title}
                </h3>
              )}
              <p className="mt-1 line-clamp-5 whitespace-pre-wrap text-sm leading-5 text-mutedText">
                {post.description}
              </p>
            </div>

            {post.mediaFile &&
              (isVideo ? (
                <video
                  src={post.mediaFile}
                  poster={post.thumbnailUrl}
                  controls
                  preload="metadata"
                  className="max-h-[320px] w-full object-cover"
                />
              ) : (
                <Image
                  src={post.mediaFile}
                  alt="Mídia do post compartilhado"
                  width={560}
                  height={340}
                  className="max-h-[340px] w-full object-cover"
                />
              ))}
          </article>
        </div>

        <footer className="grid shrink-0 grid-cols-2 gap-2 border-t border-borderDark px-3 py-3 sm:flex sm:items-center sm:justify-end sm:gap-3 sm:px-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={isBusy || isDone}
            className="h-10 rounded-lg px-3 text-sm font-semibold text-mutedText transition-colors hover:bg-secondary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 sm:px-4"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isBusy || isDone}
            className="h-10 rounded-lg bg-accent px-3 text-sm font-semibold text-background transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60 sm:px-4"
          >
            {isDone ? "Compartilhado" : isBusy ? "Compartilhando..." : "Compartilhar"}
          </button>
        </footer>
      </section>
    </div>,
    document.body
  );
};
