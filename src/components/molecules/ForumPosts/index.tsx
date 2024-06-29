import { useUserContext } from "@/context";
import { formatDate } from "@/services/utils/formaters";
import { PostProps } from "@/types";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import {
  FaTrash as TrashIcon,
  FaHeart as LikeIcon,
  FaComment as CommentIcon,
} from "react-icons/fa6";
import { FaEllipsisH as Dots } from "react-icons/fa";
import { CustomPopover } from "@/components/atoms/CustomPopover";
import { useRouter } from "next/router";
import { getTitleFromTag, tagStyleMap } from "@/services/utils/mappers";
import { FaRocket } from "react-icons/fa6";

export interface PostCardProps {
  post: PostProps;
  fetch: () => Promise<void>;
  onDelete: (id: string) => void;
  onLike: (postId: string, userId: string) => void;
  hasLiked: (postId: string, userId: string) => Promise<boolean>;
}

export const ForumPosts = ({
  post,
  fetch,
  onDelete,
  onLike,
  hasLiked,
}: PostCardProps) => {
  const { user } = useUserContext();
  const auth = user?.auth;
  const [liked, setLiked] = useState(false);
  const [likedCount, setLikedCount] = useState(post.likeCount);
  const [isLikeDisabled, setIsLikeDisabled] = useState(false);
  const [errorImage, setErrorImage] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleUserLiked = async () => {
      const hasUserLiked = await hasLiked(post.id, auth?.currentUser?.uid!!);
      setLiked(hasUserLiked);
    };

    handleUserLiked();
  }, []);

  const handleLike = () => {
    setIsLikeDisabled(true);
    onLike(post.id, auth?.currentUser?.uid!!);
    setLiked(!liked);
    if (liked) setLikedCount(likedCount < 1 ? 0 : likedCount - 1);
    else setLikedCount(likedCount + 1);
    setTimeout(() => setIsLikeDisabled(false), 500);
  };

  const defaultImageContainerOnError = (
    <div className="w-full h-56 p-4 bg-slate-400 flex flex-col justify-center items-center rounded gap-3">
      <span className="font-light text-xl text-whiteColor text-center">
        (╥﹏╥)
      </span>
      <span className="font-medium text-xs text-whiteColor text-center">
        Não foi possível carregar a imagem
      </span>
    </div>
  );

  const tagStyle = tagStyleMap[post.tags[0]] || {
    backgroundColor: "#EDF2F7",
    color: "#4A5568",
  }; // Estilo padrão 
  console.log("POSTs: ", post.tags[0]);

  if (!post.user) return;

  return (
    <>
      {}
      <div
        className="w-full md:max-w-2xl h-auto pb-8 bg-white rounded-lg p-2 flex flex-col relative transition-colors hover:bg-gray-200 hover:cursor-pointer"
        onClick={() => {
          router.push(`/post/${post.id}`);
        }}
      >
        <div className="w-full flex flex-row justify-end">
          <span
            style={tagStyle}
            className="text-xs font-medium me-2 px-2.5 py-1 rounded-full flex flex-row justify-center items-center gap-1"
          >
            {getTitleFromTag(post.tags[0])}
          </span>
        </div>
        <div className="w-full relative flex flex-row">
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
                <h1 className="text-base font-bold w-auto text-left flex flex-row justify-center items-center gap-1">
                  {post.user.displayName}{" "}
                  {post.user.tag ? (
                    <span className="mt-1 ">
                      <FaRocket className="animate-blinkAnimation" />
                    </span>
                  ) : (
                    ""
                  )}
                </h1>
                <p className="font-light text-xs text-left md:w-auto w-full">
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
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(post.id);
                          }}
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

            <div className=" flex justify-center items-center">
              <div className="w-full break-words text-clip mb-3">
                {post.title && (
                  <h2 className="font-semibold mb-2 text-base text-gray-800 ">
                    {post.title}
                  </h2>
                )}
                <p className="font-normal text-sm text-gray-500 mb-2 whitespace-pre-wrap">
                  {post.description}
                </p>

                {!errorImage && (
                  <>
                    {post.mediaFile && (
                      <Image
                        className="rounded-md "
                        src={post.mediaFile}
                        alt={"user photo"}
                        width={500}
                        height={520}
                        onError={(
                          e: React.SyntheticEvent<HTMLImageElement, Event>
                        ) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none"; // Oculta a imagem em caso de erro
                          setErrorImage(true);
                        }}
                      />
                    )}
                  </>
                )}

                {errorImage && defaultImageContainerOnError}
              </div>
            </div>

            <div className="flex w-full h-5 flex-row justify-start items-center mt-auto gap-2">
              <div className="flex flex-row gap-2 justify-center items-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLike();
                  }}
                  className="w-7 h-7 z-10 flex flex-row gap-1 justify-center items-center rounded-full"
                  disabled={isLikeDisabled}
                >
                  {liked ? (
                    <LikeIcon
                      size={20}
                      className="fill-current text-red-600 transition-transform hover:scale-110"
                    />
                  ) : (
                    <LikeIcon
                      size={20}
                      className="text-gray-600 transition-transform hover:scale-110"
                    />
                  )}
                  <div className="text-gray-800 font-medium text-sm">
                    {likedCount}
                  </div>
                </button>
              </div>
              <div className="flex flex-row gap-2 justify-center items-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLike();
                  }}
                  className="w-7 h-7 z-10 flex flex-row gap-1 justify-center items-center rounded-full"
                  disabled={isLikeDisabled}
                >
                  <CommentIcon
                    size={20}
                    className=" fill-current text-gray-600 transition-transform hover:scale-110"
                  />
                  <div className="text-gray-800 font-medium text-sm">
                    {post.commentCount}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
