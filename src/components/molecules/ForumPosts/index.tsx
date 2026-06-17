import { useUserContext } from "@/context";
import { formatDate } from "@/services/utils/formaters";
import { PostProps } from "@/types";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import {
  FaTrash as TrashIcon,
  FaHeart as LikeIcon,
  FaComment as CommentIcon,
  FaRocket,
} from "react-icons/fa6";
import { FaEllipsisH as Dots, FaMapPin } from "react-icons/fa";
import { CustomPopover } from "@/components/atoms/CustomPopover";
import { useRouter } from "next/router";
import { getTitleFromTag, tagStyleMap } from "@/services/utils/mappers";

export interface PostCardProps {
  post: PostProps;
  fetch: () => Promise<void>;
  onDelete: (id: string) => void;
  onLike: (postId: string, userId: string) => void;
  hasLiked: (postId: string, userId: string) => Promise<boolean>;
}

export const ForumPosts = ({
  post,
  onDelete,
  onLike,
  hasLiked,
}: PostCardProps) => {
  const { user } = useUserContext();
  const auth = user?.auth;
  const [liked, setLiked] = useState(false);
  const [likedCount, setLikedCount] = useState(post.likeCount);
  const [isLikeDisabled, setIsLikeDisabled] = useState(false);
  const [shouldShowButton, setShouldShowButton] = useState(false);
  const [errorImage, setErrorImage] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleUserLiked = async () => {
      const hasUserLiked = await hasLiked(post.id, auth?.currentUser?.uid!!);
      setLiked(hasUserLiked);
    };

    handleUserLiked();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const content = contentRef.current;
      setShouldShowButton(!!content && content.scrollHeight > 560);
    }, 100);

    return () => clearTimeout(timeout);
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
    <div className="flex h-56 w-full flex-col items-center justify-center gap-3 rounded-md bg-slate-400 p-4">
      <span className="text-center text-xs font-medium text-whiteColor">
        Não foi possível carregar a imagem.
      </span>
    </div>
  );

  const tagStyle = tagStyleMap[post.tags[0]] || {
    backgroundColor: "#E8E4DA",
    color: "#5B554B",
  };

  if (!post.user) return null;

  return (
    <article
      className="w-full rounded-lg border border-slate-200 bg-whiteColor p-4 shadow-sm transition-colors hover:bg-white hover:cursor-pointer"
      onClick={() => {
        router.push(`/post/${post.id}`);
      }}
    >
      <div className="mb-3 flex flex-row items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <span
            style={tagStyle}
            className="flex flex-row items-center justify-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
          >
            {getTitleFromTag(post.tags[0])}
          </span>
          {post.pinned && (
            <span className="flex flex-row items-center justify-center gap-1 rounded-full bg-cyan-200 px-2.5 py-1 text-xs font-medium text-cyan-800">
              <FaMapPin size={13} className="fill-cyan-800" /> Fixado
            </span>
          )}
        </div>

        {auth?.currentUser?.uid === post.userId && (
          <CustomPopover
            trigger={
              <button
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-secondary"
                onClick={(e) => e.stopPropagation()}
              >
                <Dots className="fill-primary" size={18} />
              </button>
            }
            content={
              <div className="flex flex-col rounded-md bg-primary">
                <button
                  className="flex flex-row items-center justify-start gap-2 rounded-md px-4 py-2 text-whiteColor hover:bg-slate-600"
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
        )}
      </div>

      <div className="relative flex flex-row gap-3">
        <div className="flex h-10 w-10 shrink-0 rounded-full bg-gray-500">
          <Image
            className="rounded-full object-cover"
            src={post.user.photoURL || "/imgs/default_perfil.jpg"}
            alt={"user photo"}
            width={40}
            height={40}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1">
            <h1 className="flex items-center gap-1 text-base font-bold text-primary">
              {post.user.displayName}
              {post.user.tag ? (
                <span className="mt-1">
                  <FaRocket className="animate-blinkAnimation" />
                </span>
              ) : (
                ""
              )}
            </h1>
            <p className="text-xs font-light text-slate-500">
              {formatDate(post.createdAt)}
            </p>
          </div>

          <div
            ref={contentRef}
            className="relative mb-4 max-h-[560px] w-full overflow-hidden break-words"
          >
            {post.title && (
              <h2 className="mb-2 text-base font-semibold text-gray-800">
                {post.title}
              </h2>
            )}
            <p className="mb-3 whitespace-pre-wrap text-sm font-normal leading-6 text-gray-600">
              {post.description}
            </p>

            {!errorImage && post.mediaFile && (
              <Image
                className="max-h-[540px] w-full rounded-md object-cover"
                src={post.mediaFile}
                alt={"post media"}
                width={620}
                height={540}
                onError={(
                  e: React.SyntheticEvent<HTMLImageElement, Event>
                ) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  setErrorImage(true);
                }}
              />
            )}

            {errorImage && defaultImageContainerOnError}

            {shouldShowButton && (
              <div className="absolute bottom-0 left-0 right-0 h-12 rounded-md bg-white/70 backdrop-blur-md">
                <div className="flex h-full w-full items-center justify-center">
                  <p className="text-sm font-semibold text-accent">
                    Ver conversa completa
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-row items-center gap-6 border-t border-slate-200 pt-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleLike();
              }}
              className="z-10 flex flex-row items-center gap-2 rounded-full px-2 py-1 text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600"
              disabled={isLikeDisabled}
            >
              <LikeIcon
                size={18}
                className={
                  liked
                    ? "fill-current text-red-600 transition-transform hover:scale-110"
                    : "transition-transform hover:scale-110"
                }
              />
              <span className="text-sm font-medium">{likedCount}</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/post/${post.id}`);
              }}
              className="z-10 flex flex-row items-center gap-2 rounded-full px-2 py-1 text-gray-600 transition-colors hover:bg-accentSoft hover:text-accent"
            >
              <CommentIcon size={18} />
              <span className="text-sm font-medium">{post.commentCount}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
