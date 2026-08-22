import { formatDate } from "@/services/utils/formaters";
import { PostProps } from "@/types";
import Image from "next/image";
import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";

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

  if (!open || !post) return null;

  const isVideo =
    post.mediaType === "video" || post.mediaFile?.includes("/video/upload/");

  const handleSubmit = async () => {
    await onSubmit(text);
    setText("");
  };

  const handleClose = () => {
    setText("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 px-3 pb-3 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={handleClose}
    >
      <section
        className="max-h-[92svh] w-full max-w-xl overflow-hidden rounded-2xl border border-borderDark bg-background shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex h-14 items-center justify-between border-b border-borderDark px-4">
          <h2 className="text-base font-semibold text-primary">
            Compartilhar conversa
          </h2>
          <button
            onClick={handleClose}
            className="grid h-9 w-9 place-items-center rounded-full text-mutedText transition-colors hover:bg-secondary hover:text-primary"
            aria-label="Fechar"
          >
            <FaTimes />
          </button>
        </header>

        <div className="max-h-[calc(92svh-116px)] overflow-y-auto p-3 sm:p-4">
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            maxLength={512}
            placeholder="Adicione uma frase se quiser"
            className="min-h-[92px] w-full resize-none rounded-xl border border-borderDark bg-secondary px-4 py-3 text-base text-primary placeholder:text-mutedText/70 focus:border-accent focus:outline-none"
          />

          <article className="mt-4 overflow-hidden rounded-xl border border-borderDark bg-panel sm:rounded-2xl">
            <div className="p-3">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                <span className="font-semibold text-primary">
                  {post.user?.displayName || "Usuário"}
                </span>
                <span className="text-mutedText">·</span>
                <span className="text-mutedText">{formatDate(post.createdAt)}</span>
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

        <footer className="flex items-center justify-end gap-2 border-t border-borderDark px-3 py-3 sm:gap-3 sm:px-4">
          <button
            onClick={handleClose}
            className="h-10 rounded-lg px-3 text-sm font-semibold text-mutedText transition-colors hover:bg-secondary hover:text-primary sm:px-4"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="h-10 rounded-lg bg-accent px-3 text-sm font-semibold text-background transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60 sm:px-4"
          >
            {loading ? "Compartilhando..." : "Compartilhar"}
          </button>
        </footer>
      </section>
    </div>
  );
};
