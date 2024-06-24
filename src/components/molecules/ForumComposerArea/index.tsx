import React, { useEffect, useRef, useState } from "react";
import { FaPaperclip } from "react-icons/fa";
import { FaMarker } from "react-icons/fa6";
import Image from "next/image";
import { UserProps } from "@/types";
import { useUserContext } from "@/context";
import { UserServices } from "@/services/userServices";


interface ForumComposerProps {
    tag: string
}
const ForumComposerArea = ({tag}: ForumComposerProps) => {
  const [loadingUser, setLoadingUser] = useState(false);
  const { user } = useUserContext();
  const [userInfo, setUserInfo] = useState<UserProps>();
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const fetchUserLoggedInfo = async (id: string) => {
    setLoadingUser(true);
    try {
      const response = await UserServices.getUserById(id);
      setUserInfo(response);
      return response;
    } catch (error: any) {
      console.error(error.message);
    }
    setLoadingUser(false);
  };

  useEffect(() => {
    fetchUserLoggedInfo(user?.user?.uid as string);
  }, [tag]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  return (
    <div className="w-full md:max-w-2xl h-auto bg-white rounded-lg p-2 flex flex-row">
      <div className="flex rounded-full m-2 bg-gray-500 w-full max-w-[2.5rem] h-10">
        <Image
          className="rounded-full "
          src={userInfo?.photoURL as string || user?.user?.photoURL as string}
          alt={"user photo"}
          width={40}
          height={40}
        />
      </div>

      <div className="flex flex-col pt-3 w-full">
        <div className="flex mb-2">
          <textarea
            ref={textareaRef}
            placeholder="Compartilhe suas ideias..."
            className="font-medium text-base text-gray-500 min-h-[2.5rem] w-full border-none focus:outline-none focus:shadow-outline overflow-hidden"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={4096}
          />
        </div>

        <div className="flex w-full h-7 flex-row justify-between items-center mt-auto">
          <div className="flex flex-row gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                //handleLike();
              }}
              className="w-5 h-5 z-10"
            >
              <FaPaperclip
                size={18}
                className="fill-slate-500 hover:fill-slate-600"
              />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                //handleLike();
              }}
              className="w-5 h-5 z-10"
            >
              <FaMarker
                size={18}
                className="fill-slate-500 hover:fill-slate-600"
              />
            </button>
          </div>
          <div className="pr-3 h-7">
            <button className="px-4 py-1 z-10 bg-slate-500 hover:bg-slate-600 transition-colors delay-75 text-whiteColor font-bold text-sm rounded-xl">
              ENVIAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumComposerArea;
