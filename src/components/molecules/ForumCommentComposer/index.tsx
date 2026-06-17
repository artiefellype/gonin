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
    <section className="w-full rounded-lg border border-slate-200 bg-whiteColor p-4 shadow-sm">
      <div className="mb-3">
        <h2 className="text-base font-bold text-primary">Responder</h2>
        <p className="text-xs font-light text-slate-500">
          Acrescente algo à conversa.
        </p>
      </div>

      <div className="flex gap-3">
        {!loading && (
          <div className="flex h-10 w-10 shrink-0 rounded-full bg-gray-500">
            <Image
              className="rounded-full object-cover"
              src={userPhoto}
              alt={"user photo"}
              width={40}
              height={40}
              priority
            />
          </div>
        )}
        {loading && <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-slate-400" />}

        <div className="min-w-0 flex-1">
          <textarea
            ref={textareaRef}
            placeholder="Escreva uma resposta..."
            className="min-h-[4rem] w-full resize-none overflow-hidden border-none bg-transparent text-base font-medium text-gray-700 placeholder:text-slate-400 focus:outline-none"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={4096}
            disabled={loading}
          />

          <div className="mt-3 flex items-center justify-end gap-2 border-t border-slate-200 pt-3">
            {isSubmitting && <SpinLoad />}
            <button
              className="z-10 flex h-9 items-center justify-center gap-2 rounded-full bg-accent px-4 text-sm font-bold text-whiteColor transition-colors hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50"
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
