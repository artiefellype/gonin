import { useUserContext } from "@/context";
import { formatDate } from "@/services/utils/formaters";
import { PostCardProps } from "@/types";
import Image from "next/image";
import React from "react";
import { FaTrash as TrashIcon, FaHeart as LikeIcon } from "react-icons/fa6";
import { FaEllipsisH as Dots } from "react-icons/fa";
import { CustomPopover } from "@/components/atoms/CustomPopover";

export const ForumPosts = ({ post, fetch, onDelete }: PostCardProps) => {
  const { user } = useUserContext();
  const auth = user?.auth;

  if (!post.user) return;

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
            <div className="flex md:flex-row md:m-0 mb-3 flex-col md:gap-3 justify-center items-center">
              <h1 className="text-base font-bold">{post.user.displayName}</h1>
              <p className="font-light text-xs text-left">
                {formatDate(post.createdAt)}
              </p>
            </div>

            {auth?.currentUser?.uid === post.userId && (
              <div className="absolute right-1 w-12 h-5 gap-2 flex">
                <CustomPopover
                  trigger={
                    <button className=" flex justify-center items-center p-2 rounded-full hover:bg-secondary">
                      <Dots className="fill-primary" size={20} />
                    </button>
                  }
                  content={
                    <div className="flex flex-col bg-primary rounded-md ">
                      <button
                        className=" text-whiteColor px-4 py-2 hover:bg-slate-600 rounded-md flex flex-row gap-2 justify-start items-center"
                        onClick={() => onDelete(post.id)}
                      >
                        <TrashIcon size={12} className="fill-whiteColor" />
                        <p>Excluir</p>
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

              {post.mediaFile && (
                <Image
                  className="rounded-md "
                  src={post.mediaFile}
                  alt={"user photo"}
                  width={500}
                  height={520}
                />
              )}
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

              <div className="text-gray-800 font-medium text-sm">
                {post.likeCount}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
