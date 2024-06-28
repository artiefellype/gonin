import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { UserProps } from "@/types";
import { SpinLoad } from "@/components/atoms/SpinLoad";

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
      setIsSubmitting(false);
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (userInfo) setUserPhoto(userInfo.photoURL);
  }, [userInfo]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  return (
    <div className="w-full md:max-w-2xl h-auto bg-white rounded-lg p-2 flex flex-row relative">
      <div className="w-full md:max-w-2xl h-auto bg-white rounded-lg p-2 flex flex-row">
        {!loading && (
          <div className="flex rounded-full m-2 bg-gray-500 w-full max-w-[2.5rem] h-10">
            <Image
              className="rounded-full min-w-full"
              src={userPhoto}
              alt={"user photo"}
              width={40}
              height={40}
              priority
            />
          </div>
        )}
        {loading && (
          <div className="flex rounded-full m-2  w-full max-w-[2.5rem] h-10">
            <div className="rounded-full min-w-full bg-slate-400 animate-pulse"></div>
          </div>
        )}

        <div className="flex flex-col pt-3 w-full">
          <div className="flex mb-2 flex-col justify-start ">
            <textarea
              ref={textareaRef}
              placeholder="Comente uma resposta..."
              className="font-medium text-base text-gray-500 min-h-[2.5rem] w-full border-none focus:outline-none focus:shadow-outline overflow-hidden"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={4096}
            />
          </div>

          <div className="flex w-full h-7 flex-row justify-end items-center mt-auto">
            {isSubmitting && <SpinLoad />}
            <button
              className="px-4 py-1 z-10 bg-slate-500 hover:bg-slate-600 transition-colors delay-75 text-whiteColor font-bold text-sm rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || !text.trim()}
              onClick={() => {
                if (text == "") return;
                handleSubmitComment();
              }}
            >
              ENVIAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
