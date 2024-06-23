import CustomPopover from "@/components/atoms/CustomPopover";
import { useUserContext } from "@/context";
import { formatDate } from "@/services/utils/formaters";
import {
  ForumCardProps,
  ForumProps,
  MessagesProps,
  PostCardProps,
} from "@/types";
import Image from "next/image";
import React, { useImperativeHandle, useState } from "react";
import {
  FaPenToSquare as EditIcon,
  FaTrash as TrashIcon,
  FaCheck as CheckIcon,
  FaXmark as UncheckIcon,
  FaHeart as LikeIcon,
} from "react-icons/fa6";
import { FaEllipsisH as Dots } from "react-icons/fa";

export const ForumPosts = ({ post }: PostCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUserContext();
  const auth = user?.auth;
  const [inputTitle, setInputTitle] = useState(post.title);
  const [inputDescription, setInputDescription] = useState(post.description);
  //const [liked, setLiked] = useState(liked_list);


  

  return (
    <>
      <div className="w-full md:max-w-2xl min-h-[10rem] h-auto bg-white rounded-lg p-2 flex flex-row relative">
        <div className="flex rounded-full m-2 bg-gray-500 w-full max-w-[2.5rem] h-10">
          <Image
            className="rounded-full "
            src={post.user.photoURL}
            alt={"user photo"}
            width={40}
            height={40}
          />
        </div>

        <div className="flex flex-col pt-2 w-full">
          <div className="flex">
            <div className="flex flex-row gap-3 justify-center items-center">
              <h1 className="text-base font-bold">{post.user.displayName}</h1>
              <p className="font-light text-xs">{formatDate(post.createdAt)}</p>
            </div>

            {auth?.currentUser?.uid === post.userId && (
              <div className="absolute right-1 w-12 h-5 gap-2 flex">
                <CustomPopover
                  trigger={
                    <button className=" flex justify-center items-center">
                      <Dots className="fill-primary" size={20} />
                    </button>
                  }
                  content={
                    <div className="flex flex-col ">
                      <button
                        className="bg-whiteColor text-primary px-4 py-2 hover:bg-secondary"
                        onClick={() => console.log("CLICOU")}
                      >
                        Editar
                      </button>
                    </div>
                  }
                />
              </div>
            )}
          </div>

          {/* POR PARA CLICAR AQUI E ABRIR A PAGINA DO POST */}
          <div className=" flex justify-center items-center">
            <div className="w-full break-words text-clip mb-3">
              {post.title && (
                <h2 className="font-semibold mb-2 text-base text-gray-800">
                  {post.title}
                </h2>
              )}
              <p className="font-normal text-sm text-gray-500 mb-2">
                {post.description}
              </p>

              { post.mediaFile && <Image
                className="rounded-md "
                src={post.mediaFile}
                alt={"user photo"}
                width={500}
                height={520}
              />}
            </div>
          </div>

          <div className="flex w-full h-5 flex-row justify-start items-center mt-auto">
            <div className="flex flex-row gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  //handleLike();
                }}
                className="w-5 h-5 z-10"
              >
                {/* {liked_list?.indexOf(auth?.currentUser?.photoURL!) !== -1 ? (
                <LikeIcon size={20} className=" fill-current text-red-600 " />
              ) : (
                <LikeIcon size={20} className="text-gray-600" />
              )} */}
                <LikeIcon size={20} className=" fill-current text-red-600 " />
              </button>

              <div className="text-gray-800 font-medium text-sm">{post.likeCount}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
