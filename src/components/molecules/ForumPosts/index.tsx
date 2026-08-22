import { useUserContext } from "@/context";
import { formatDate } from "@/services/utils/formaters";
import { PostProps } from "@/types";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import {
  FaTrash as TrashIcon,
  FaRegComment,
  FaRegHeart,
  FaHeart,
  FaRegBookmark,
  FaBookmark,
  FaShareNodes,
  FaRocket,
} from "react-icons/fa6";
import { FaEllipsisH as Dots, FaMapPin } from "react-icons/fa";
import { CustomPopover } from "@/components/atoms/CustomPopover";
import { useRouter } from "next/router";
import { getTitleFromTag, tagStyleMap } from "@/services/utils/mappers";
import { postsServices } from "@/services/postServices";
import { SharePostModal } from "@/components/molecules/SharePostModal";
import { FriendActionButton } from "@/components/molecules/FriendActionButton";
import Link from "next/link";
import { LinkifiedText } from "@/components/atoms/LinkifiedText";

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
  const [saved, setSaved] = useState(false);
  const [savedCount, setSavedCount] = useState(post.savedCount || 0);
  const [shareCount, setShareCount] = useState(post.shareCount || 0);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [isLikeDisabled, setIsLikeDisabled] = useState(false);
  const [isSaveDisabled, setIsSaveDisabled] = useState(false);
  const [isShareDisabled, setIsShareDisabled] = useState(false);
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
    const handleUserSaved = async () => {
      if (!auth?.currentUser?.uid) return;
      const hasSaved = await postsServices.hasUserSavedPost(
        post.id,
        auth.currentUser.uid
      );
      setSaved(hasSaved);
    };

    handleUserSaved();
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

  const handleSave = async () => {
    if (!auth?.currentUser?.uid) return;
    setIsSaveDisabled(true);
    try {
      const nextSavedState = await postsServices.toggleSavedPost(
        post.id,
        auth.currentUser.uid
      );
      setSaved(nextSavedState);
      setSavedCount((current) =>
        nextSavedState ? current + 1 : Math.max(0, current - 1)
      );
    } catch (error: any) {
      console.error(error.message);
    } finally {
      setIsSaveDisabled(false);
    }
  };

  const shareTarget =
    post.postType === "share" && post.originalPost ? post.originalPost : post;
  const targetPostId =
    post.postType === "share" && post.originalPostId
      ? post.originalPostId
      : post.id;

  const handleShare = async (shareText: string) => {
    if (!auth?.currentUser?.uid) return;

    setIsShareDisabled(true);
    try {
      await postsServices.sharePost(
        targetPostId,
        auth.currentUser.uid,
        shareText
      );
      setShareCount((current) => current + 1);
      await fetch();
    } catch (error: any) {
      console.error(error.message);
      throw error;
    } finally {
      setIsShareDisabled(false);
    }
  };

  const defaultImageContainerOnError = (
    <div className="flex h-56 w-full flex-col items-center justify-center gap-3 rounded-lg border border-borderDark bg-secondary p-4">
      <span className="text-center text-xs font-medium text-mutedText">
        Não foi possível carregar a imagem.
      </span>
    </div>
  );

  const renderMedia = (targetPost: PostProps, compact = false) => {
    if (!targetPost.mediaFile) return null;

    const isVideo =
      targetPost.mediaType === "video" ||
      targetPost.mediaFile.includes("/video/upload/");

    if (isVideo) {
      return (
        <video
          className={`mt-3 w-full rounded-xl border border-borderDark object-cover sm:rounded-2xl ${
            compact ? "max-h-[260px] sm:max-h-[280px]" : "max-h-[420px] sm:max-h-[510px]"
          }`}
          src={targetPost.mediaFile}
          poster={targetPost.thumbnailUrl}
          controls
          preload="metadata"
          onClick={(event) => event.stopPropagation()}
        />
      );
    }

    if (errorImage) return defaultImageContainerOnError;

    return (
      <Image
        className={`mt-3 w-full rounded-xl border border-borderDark object-cover sm:rounded-2xl ${
          compact ? "max-h-[260px] sm:max-h-[280px]" : "max-h-[420px] sm:max-h-[510px]"
        }`}
        src={targetPost.mediaFile}
        alt={"post media"}
        width={compact ? 520 : 620}
        height={compact ? 300 : 540}
        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
          const target = e.target as HTMLImageElement;
          target.style.display = "none";
          setErrorImage(true);
        }}
      />
    );
  };

  const primaryTag = post.communityId || post.tags?.[0] || "";
  const tagStyle = primaryTag ? tagStyleMap[primaryTag] || {
    backgroundColor: "#111B3E",
    color: "#82ABFF",
  } : undefined;
  const tagLabel = primaryTag ? getTitleFromTag(primaryTag) : "";

  if (!post.user) return null;

  return (
    <article
      className="w-full border-b border-borderDark bg-background/70 px-3 py-3 transition-colors hover:cursor-pointer md:bg-background md:px-4 md:hover:bg-secondary/30"
      onClick={() => {
        router.push(`/post/${targetPostId}`);
      }}
    >
      <div className="relative grid grid-cols-[36px_minmax(0,1fr)] gap-3 sm:grid-cols-[40px_minmax(0,1fr)]">
        <Link
          href={`/profile/${post.userId}`}
          className="flex h-9 w-9 shrink-0 overflow-hidden rounded-full border border-borderDark bg-secondary sm:h-10 sm:w-10"
          onClick={(event) => event.stopPropagation()}
        >
          <Image
            className="h-full w-full object-cover"
            src={post.user.photoURL || "/imgs/default_perfil.jpg"}
            alt={"user photo"}
            width={40}
            height={40}
          />
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1">
                <Link
                  href={`/profile/${post.userId}`}
                  className="flex min-w-0 items-center gap-1 text-[15px] font-semibold text-primary transition-colors hover:text-accent"
                  onClick={(event) => event.stopPropagation()}
                >
                  <span className="truncate">{post.user.displayName}</span>
                  {post.user.tag ? (
                    <span className="mt-0.5">
                      <FaRocket className="animate-blinkAnimation" />
                    </span>
                  ) : null}
                </Link>
                <span className="text-sm text-mutedText">·</span>
                <span className="text-sm text-mutedText">
                  {formatDate(post.createdAt)}
                </span>
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-mutedText">
                {post.postType === "share" && (
                  <span className="font-medium text-accent">
                    compartilhou uma conversa
                  </span>
                )}
                {tagLabel && <span>{tagLabel}</span>}
                {post.pinned && (
                  <span
                    style={tagStyle}
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                  >
                    <FaMapPin size={11} className="fill-current" /> Fixado
                  </span>
                )}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {auth?.currentUser?.uid !== post.userId && (
                <FriendActionButton targetUserId={post.userId} compact />
              )}

              {auth?.currentUser?.uid === post.userId && (
                <CustomPopover
                  trigger={
                    <button
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-mutedText hover:bg-secondary hover:text-primary"
                      onClick={(e) => e.stopPropagation()}
                      aria-label="Opções do post"
                    >
                      <Dots className="fill-current" size={16} />
                    </button>
                  }
                  content={
                    <div className="flex flex-col rounded-lg border border-borderDark bg-panel">
                      <button
                        className="flex flex-row items-center justify-start gap-2 rounded-lg px-4 py-2 text-coral hover:bg-coralSoft"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(post.id);
                        }}
                      >
                        <TrashIcon size={12} className="fill-current" />
                        <p>Excluir</p>
                      </button>
                    </div>
                  }
                />
              )}
            </div>
          </div>

          <div
            ref={contentRef}
            className="relative mt-1 max-h-[560px] w-full overflow-hidden break-words sm:max-h-[620px]"
          >
            {post.title && (
              <h2 className="mb-1 text-[15px] font-semibold leading-5 text-primary">
                {post.title}
              </h2>
            )}
            <p className="whitespace-pre-wrap text-[15px] font-normal leading-5 text-primary">
              <LinkifiedText text={post.description} />
            </p>

            {renderMedia(post)}

            {post.postType === "share" && post.originalPost && (
              <div
                className="mt-3 overflow-hidden rounded-xl border border-borderDark bg-background transition-colors hover:border-accent sm:rounded-2xl"
                onClick={(event) => {
                  event.stopPropagation();
                  router.push(`/post/${post.originalPostId}`);
                }}
              >
                <div className="px-3 py-2">
                  <div className="flex min-w-0 items-center gap-2 text-sm">
                    <div className="h-6 w-6 overflow-hidden rounded-full bg-secondary">
                      <Image
                        src={
                          post.originalPost.user?.photoURL ||
                          "/imgs/default_perfil.jpg"
                        }
                        alt="Autor original"
                        width={24}
                        height={24}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <span className="truncate font-semibold text-primary">
                      {post.originalPost.user?.displayName ||
                        post.originalUser?.displayName ||
                        "Usuário"}
                    </span>
                    <span className="text-mutedText">·</span>
                    <span className="shrink-0 text-mutedText">
                      {formatDate(post.originalPost.createdAt)}
                    </span>
                  </div>
                  {post.originalPost.title && (
                    <h3 className="mt-1 text-sm font-semibold leading-5 text-primary">
                      {post.originalPost.title}
                    </h3>
                  )}
                  <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-sm leading-5 text-primary">
                    <LinkifiedText text={post.originalPost.description} />
                  </p>
                </div>
                {renderMedia(post.originalPost, true)}
              </div>
            )}

            {shouldShowButton && (
              <div className="absolute bottom-0 left-0 right-0 h-12 rounded-xl bg-background/85 backdrop-blur-md sm:rounded-2xl">
                <div className="flex h-full w-full items-center justify-center">
                  <p className="text-sm font-medium text-blueAccent">
                    Ver conversa completa
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 text-mutedText sm:justify-start sm:gap-x-6">
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/post/${targetPostId}`);
              }}
              className="z-10 flex items-center gap-2 rounded-full py-1 text-sm transition-colors hover:text-blueAccent"
            >
              <FaRegComment size={17} />
              <span>{post.commentCount}</span>
              <span className="hidden sm:inline">respostas</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleLike();
              }}
              className="z-10 flex items-center gap-2 rounded-full py-1 text-sm transition-colors hover:text-coral"
              disabled={isLikeDisabled}
            >
              {liked ? (
                <FaHeart size={17} className="fill-current text-coral" />
              ) : (
                <FaRegHeart size={17} />
              )}
              <span>{likedCount}</span>
              <span className="hidden sm:inline">curtidas</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSave();
              }}
              className="z-10 flex items-center gap-2 rounded-full py-1 text-sm transition-colors hover:text-accent"
              disabled={isSaveDisabled}
            >
              {saved ? (
                <FaBookmark size={17} className="fill-current text-accent" />
              ) : (
                <FaRegBookmark size={17} />
              )}
              <span>{savedCount}</span>
              <span className="hidden sm:inline">salvos</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setShareModalOpen(true);
              }}
              className="z-10 flex items-center gap-2 rounded-full py-1 text-sm transition-colors hover:text-accent"
              disabled={isShareDisabled}
            >
              <FaShareNodes size={17} />
              <span>{shareCount}</span>
              <span className="hidden sm:inline">compartilhar</span>
            </button>
          </div>
        </div>
      </div>
      <SharePostModal
        open={shareModalOpen}
        post={shareTarget}
        loading={isShareDisabled}
        onClose={() => setShareModalOpen(false)}
        onSubmit={handleShare}
      />
    </article>
  );
};
