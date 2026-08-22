import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { UserProps } from "@/types";
import { SpinLoad } from "@/components/atoms/SpinLoad";
import { TbSend2 as SendIcon } from "react-icons/tb";

export interface CommentComposerAreaProps {
  handleSubmit: (content: string) => Promise<void>;
  userInfo: UserProps;
  loading: boolean;
}

export const ForumCommentComposerArea = ({
  handleSubmit,
  userInfo,
  loading,
}: CommentComposerAreaProps) => {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [userPhoto, setUserPhoto] = useState("/imgs/default_perfil.jpg");

  const handleSubmitComment = async () => {
    setIsSubmitting(true);
    try {
      await handleSubmit(text);
      setText("");
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (userInfo?.photoURL) setUserPhoto(userInfo.photoURL);
  }, [userInfo]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  return (
    <section className="w-full rounded-xl border border-borderDark bg-panel/90 p-3 shadow-lg sm:p-4 md:rounded-lg">
      <div className="mb-3">
        <h2 className="text-base font-bold text-primary">Responder</h2>
        <p className="text-xs font-medium text-mutedText">
          Acrescente algo à conversa.
        </p>
      </div>

      <div className="flex gap-3">
        {!loading && (
          <div className="flex h-9 w-9 shrink-0 overflow-hidden rounded-full border border-borderDark bg-secondary sm:h-10 sm:w-10">
            <Image
              className="h-full w-full object-cover"
              src={userPhoto}
              alt={"user photo"}
              width={40}
              height={40}
              priority
            />
          </div>
        )}
        {loading && <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-secondary sm:h-10 sm:w-10" />}

        <div className="min-w-0 flex-1">
          <textarea
            ref={textareaRef}
            placeholder="Escreva uma resposta..."
            className="min-h-[4rem] w-full resize-none overflow-hidden border-none bg-transparent text-base font-medium text-primary placeholder:text-mutedText/70 focus:outline-none"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={4096}
            disabled={loading}
          />

          <div className="mt-3 flex items-center justify-end gap-2 border-t border-borderDark pt-3">
            {isSubmitting && <SpinLoad />}
            <button
              className="z-10 flex h-9 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-bold text-background transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSubmitting || loading || !text.trim()}
              onClick={() => {
                if (text === "") return;
                handleSubmitComment();
              }}
            >
              <SendIcon size={16} />
              <span>Responder</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
