import {
  PostCommentsProps,
  PostCommentWithUserProps,
  PostProps,
  UserProps,
} from "@/types";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { formatDate } from "@/services/utils/formaters";
import { useUserContext } from "@/context";
import { CustomPopover } from "@/components/atoms/CustomPopover";
import {
  FaTrash as TrashIcon,
  FaHeart as LikeIcon,
  FaComment as CommentIcon,
  FaArrowLeft,
  FaRegBookmark,
  FaBookmark,
  FaShareNodes,
  FaRocket,
} from "react-icons/fa6";
import { FaEllipsisH as Dots } from "react-icons/fa";
import { postsServices } from "@/services/postServices";
import { UserServices } from "@/services/userServices";
import { ForumCommentComposerArea } from "@/components/molecules/ForumCommentComposer";
import { ForumCommentsArea } from "@/components/organisms/ForumCommentsArea";
import { getTitleFromTag, tagStyleMap } from "@/services/utils/mappers";
import { SharePostModal } from "@/components/molecules/SharePostModal";
import { FriendActionButton } from "@/components/molecules/FriendActionButton";

export interface PostPageProps {
  postIdUrl: string;
}

export const PostPage = ({ postIdUrl }: PostPageProps) => {
  const { getUserFromLocalStorage } = useUserContext();
  const router = useRouter();
  const [post, setPost] = useState<PostProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);
  const [liked, setLiked] = useState<boolean>();
  const [likedCount, setLikedCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [shareCount, setShareCount] = useState(0);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [isLikeDisabled, setIsLikeDisabled] = useState(false);
  const [isSaveDisabled, setIsSaveDisabled] = useState(false);
  const [isShareDisabled, setIsShareDisabled] = useState(false);
  const [userOwnerInfo, setUserOwnerInfo] = useState<UserProps>(
    {} as UserProps
  );
  const [userInfo, setUserInfo] = useState<UserProps>({} as UserProps);
  const user = getUserFromLocalStorage();
  const [comments, setComments] = useState<PostCommentsProps[]>([]);
  const [userOwnerPhotoURL, setUserOwnerPhotoURL] = useState(
    "/imgs/default_perfil.jpg"
  );
  const [errorImage, setErrorImage] = useState(false);

  const { postId } = router.query;

  const fetchPost = async () => {
    setLoading(true);

    try {
      const targetPostId = (postId as string) || postIdUrl;
      if (!targetPostId) {
        throw new Error("Post ID is missing");
      }

      const fetchedPost: PostProps = await postsServices.getPostById(
        targetPostId
      );
      if (!fetchedPost) {
        throw new Error("Post not found");
      }

      const fetchedUserOwner: UserProps = await UserServices.getUserById(
        fetchedPost.userId
      );
      if (!fetchedUserOwner) {
        throw new Error("User owner not found");
      }

      const fetchedUserInfo: UserProps = await UserServices.getUserById(
        user as string
      );
      if (!fetchedUserInfo) {
        throw new Error("Current user information not found");
      }

      setPost(fetchedPost);
      setUserOwnerInfo(fetchedUserOwner);
      setUserInfo(fetchedUserInfo);
      setUserOwnerPhotoURL(fetchedUserOwner.photoURL);
      setLikedCount(fetchedPost.likeCount);
      setSavedCount(fetchedPost.savedCount || 0);
      setShareCount(fetchedPost.shareCount || 0);
    } catch (error: any) {
      console.error("Error fetching post:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPostComments = async () => {
    setLoadingComments(true);
    try {
      const response = await postsServices.getAllComments(post?.id || postIdUrl);
      setComments(response);
    } catch (error: any) {
      console.error(error.message);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleLikePost = async () => {
    try {
      setIsLikeDisabled(true);
      setLiked(!liked);
      if (liked) setLikedCount(likedCount < 1 ? 0 : likedCount - 1);
      else setLikedCount(likedCount + 1);
      await postsServices.likePost(post?.id!!, user as string);

      setTimeout(() => setIsLikeDisabled(false), 500);
    } catch (error: any) {
      console.error(error.message);
    }
  };

  const handleSavePost = async () => {
    try {
      setIsSaveDisabled(true);
      const nextSavedState = await postsServices.toggleSavedPost(
        post?.id!!,
        user as string
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

  const handleSharePost = async (shareText: string) => {
    try {
      setIsShareDisabled(true);
      await postsServices.sharePost(
        post?.originalPostId || post?.id!!,
        user as string,
        shareText
      );
      setShareCount((current) => current + 1);
      setShareModalOpen(false);
    } catch (error: any) {
      console.error(error.message);
    } finally {
      setIsShareDisabled(false);
    }
  };

  const handleDeleteUniquePost = async (id: string) => {
    try {
      setLoading(true);
      const userOwnerInfo = await UserServices.getUserById(user as string);
      const updatedUserPosts = userOwnerInfo.posts.filter(
        (postId: string) => postId !== id
      );
      userOwnerInfo.posts = updatedUserPosts;
      await UserServices.updateUser(userOwnerInfo);
      await postsServices.deletePost(id);
      router.push("/forum");
    } catch (error: any) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (content: string) => {
    try {
      const commentObject: PostCommentsProps = {
        id: "",
        user_id: userInfo?.id!!,
        content: content,
        createdAt: new Date().toISOString(),
      };

      await postsServices.addComment(post?.id!!, commentObject);

      const commentWithUser: PostCommentWithUserProps = {
        ...commentObject,
        user: userInfo,
      };

      setComments((prevComments) => [commentWithUser, ...prevComments]);

      setPost((prevPost) => ({
        ...prevPost!,
        commentCount: (prevPost?.commentCount || 0) + 1,
      }));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (postId || postIdUrl) {
      fetchPost();
    }
  }, [postId, postIdUrl]);

  useEffect(() => {
    if (post) {
      fetchPostComments();
      const handleHasUserLiked = async (): Promise<boolean> => {
        try {
          const response = await postsServices.hasUserLikedPost(
            post?.id!!,
            user as string
          );
          if (response == undefined)
            console.error("UNDEFINED RESPONSE IN HANDLER");
          setLiked(response);
          return response ?? false;
        } catch (error: any) {
          console.error(error.message);
          return false;
        }
      };

      handleHasUserLiked();

      const handleHasUserSaved = async () => {
        try {
          const response = await postsServices.hasUserSavedPost(
            post.id,
            user as string
          );
          setSaved(response);
        } catch (error: any) {
          console.error(error.message);
        }
      };

      handleHasUserSaved();
    }
  }, [post]);

  const tagStyle = post?.tags?.[0]
    ? tagStyleMap[post.tags[0]] || {
        backgroundColor: "#111B3E",
        color: "#82ABFF",
      }
    : undefined;

  const defaultImageContainerOnError = (
    <div className="flex h-56 w-full flex-col items-center justify-center gap-3 rounded-lg border border-borderDark bg-secondary p-4">
      <span className="text-center text-xs font-medium text-mutedText">
        Não foi possível carregar a imagem.
      </span>
    </div>
  );

  const renderPostMedia = (targetPost: PostProps, compact = false) => {
    if (!targetPost.mediaFile) return null;

    const isVideo =
      targetPost.mediaType === "video" ||
      targetPost.mediaFile.includes("/video/upload/");

    if (isVideo) {
      return (
        <video
          className={`w-full border-borderDark object-cover ${
            compact
              ? "max-h-[320px] border-t sm:max-h-[380px]"
              : "max-h-[560px] rounded-xl border sm:max-h-[720px] sm:rounded-2xl"
          }`}
          src={targetPost.mediaFile}
          poster={targetPost.thumbnailUrl}
          controls
          preload="metadata"
        />
      );
    }

    if (errorImage && !compact) return defaultImageContainerOnError;

    return (
      <Image
        className={`w-full border-borderDark object-cover ${
          compact ? "max-h-[320px] border-t sm:max-h-[380px]" : "max-h-[560px] rounded-xl border sm:max-h-[720px] sm:rounded-2xl"
        }`}
        src={targetPost.mediaFile}
        alt={"post media"}
        width={compact ? 640 : 920}
        height={compact ? 380 : 720}
        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
          const target = e.target as HTMLImageElement;
          target.style.display = "none";
          if (!compact) setErrorImage(true);
        }}
      />
    );
  };

  return (
    <div className="w-full pb-24 text-primary md:h-full md:min-h-0 md:overflow-y-auto md:overscroll-contain md:pb-8">
      <main className="mx-auto min-h-full w-full max-w-[820px] bg-background/75 md:border-x md:border-borderDark md:bg-background/80 2xl:max-w-[920px]">
        <header className="sticky top-14 z-20 flex h-14 items-center gap-4 border-b border-borderDark bg-background/95 px-3 backdrop-blur-xl sm:top-[72px] sm:px-5 md:top-0">
          <button
            onClick={() => router.push("/forum")}
            className="grid h-9 w-9 place-items-center rounded-full text-primary transition-colors hover:bg-secondary"
            aria-label="Voltar"
          >
            <FaArrowLeft size={18} />
          </button>
          <h1 className="text-xl font-semibold">Post</h1>
        </header>

        <article className="border-b border-borderDark px-3 py-4 sm:px-5">
          {loading && (
            <div className="animate-pulse space-y-4">
              <div className="flex gap-3">
                <div className="h-10 w-10 rounded-full bg-secondary" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 w-40 rounded bg-secondary" />
                  <div className="h-4 w-24 rounded bg-secondary" />
                </div>
              </div>
              <div className="h-5 w-3/4 rounded bg-secondary" />
              <div className="h-4 w-full rounded bg-secondary" />
              <div className="h-4 w-5/6 rounded bg-secondary" />
            </div>
          )}

          {!loading && post && (
            <>
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex min-w-0 gap-3">
                  <Link
                    href={`/profile/${post.userId}`}
                    className="flex h-12 w-12 shrink-0 overflow-hidden rounded-full border border-borderDark bg-secondary"
                  >
                    <Image
                      className="h-full w-full object-cover"
                      src={userOwnerPhotoURL || "/imgs/default_perfil.jpg"}
                      alt={"user photo"}
                      width={48}
                      height={48}
                    />
                  </Link>
                  <div className="min-w-0">
                    <Link
                      href={`/profile/${post.userId}`}
                      className="flex items-center gap-1 text-base font-semibold text-primary transition-colors hover:text-accent"
                    >
                      {userOwnerInfo?.displayName}
                      {userOwnerInfo?.tag ? (
                        <FaRocket className="animate-blinkAnimation" />
                      ) : null}
                    </Link>
                    <p className="text-sm text-mutedText">
                      {userOwnerInfo?.email?.split("@")[0]
                        ? `@${userOwnerInfo.email.split("@")[0]}`
                        : "Gonin"}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {(user as string) !== post.userId && (
                    <FriendActionButton targetUserId={post.userId} compact />
                  )}

                  {(user as string) === post.userId && (
                    <CustomPopover
                      trigger={
                        <button className="flex h-8 w-8 items-center justify-center rounded-full text-mutedText hover:bg-secondary hover:text-primary">
                          <Dots className="fill-current" size={18} />
                        </button>
                      }
                      content={
                        <div className="flex flex-col rounded-lg border border-borderDark bg-panel">
                          <button
                            className="flex flex-row items-center justify-start gap-2 rounded-lg px-4 py-2 text-coral hover:bg-coralSoft"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteUniquePost(post.id);
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

              {post.tags?.[0] && (
                <span
                  style={tagStyle}
                  className="mb-3 inline-flex rounded-full px-2.5 py-1 text-xs font-bold"
                >
                  {getTitleFromTag(post.tags[0])}
                </span>
              )}

              <div className="break-words">
                {post.title && (
                  <h2 className="mb-2 text-lg font-semibold leading-7 text-primary sm:text-xl">
                    {post.title}
                  </h2>
                )}

                <p className="whitespace-pre-wrap text-base font-normal leading-7 text-primary sm:text-lg">
                  {post.description}
                </p>

                <div className="mt-4">{renderPostMedia(post)}</div>

                {post.postType === "share" && post.originalPost && (
                  <button
                    onClick={() => router.push(`/post/${post.originalPostId}`)}
                    className="mt-4 w-full overflow-hidden rounded-xl border border-borderDark bg-panel/70 text-left transition-colors hover:border-accent sm:rounded-2xl"
                  >
                    <div className="p-3">
                      <div className="mb-2 flex items-center gap-2 text-sm">
                        <div className="h-7 w-7 overflow-hidden rounded-full bg-secondary">
                          <Image
                            src={
                              post.originalPost.user?.photoURL ||
                              "/imgs/default_perfil.jpg"
                            }
                            alt="Autor original"
                            width={28}
                            height={28}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <span className="font-semibold text-primary">
                          {post.originalPost.user?.displayName || "Usuário"}
                        </span>
                        <span className="text-mutedText">·</span>
                        <span className="text-mutedText">
                          {formatDate(post.originalPost.createdAt)}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap text-base leading-6 text-primary">
                        {post.originalPost.description}
                      </p>
                    </div>
                    {renderPostMedia(post.originalPost, true)}
                  </button>
                )}
              </div>

              <div className="mt-5 flex flex-wrap gap-x-2 gap-y-1 border-y border-borderDark py-3 text-sm text-mutedText">
                <span>{formatDate(post.createdAt)}</span>
                <span className="mx-2">·</span>
                <span className="font-semibold text-primary">{likedCount}</span>{" "}
                curtidas
                <span className="mx-2">·</span>
                <span className="font-semibold text-primary">{shareCount}</span>{" "}
                compartilhamentos
              </div>

              <div className="flex h-12 items-center justify-around border-b border-borderDark text-mutedText">
                <button
                  onClick={handleLikePost}
                  className="flex items-center gap-2 rounded-full px-3 py-2 transition-colors hover:text-coral"
                  disabled={isLikeDisabled}
                >
                  <LikeIcon
                    size={18}
                    className={liked ? "fill-current text-coral" : ""}
                  />
                  <span>{likedCount}</span>
                </button>
                <div className="flex items-center gap-2 px-3 py-2">
                  <CommentIcon size={18} />
                  <span>{post.commentCount}</span>
                </div>
                <button
                  onClick={handleSavePost}
                  className="flex items-center gap-2 rounded-full px-3 py-2 transition-colors hover:text-accent"
                  disabled={isSaveDisabled}
                >
                  {saved ? (
                    <FaBookmark size={18} className="fill-current text-accent" />
                  ) : (
                    <FaRegBookmark size={18} />
                  )}
                  <span>{savedCount}</span>
                </button>
                <button
                  onClick={() => setShareModalOpen(true)}
                  className="flex items-center gap-2 rounded-full px-3 py-2 transition-colors hover:text-accent"
                  disabled={isShareDisabled}
                >
                  <FaShareNodes size={18} />
                  <span>{shareCount}</span>
                </button>
              </div>
            </>
          )}
        </article>

        <div className="border-b border-borderDark p-3 sm:p-5">
          <ForumCommentComposerArea
            handleSubmit={handleSubmitComment}
            userInfo={userInfo as UserProps}
            loading={loading}
          />
        </div>

        {!loadingComments &&
          (comments.length > 0 ? (
            <ForumCommentsArea comments={comments} loading={loading} />
          ) : (
            <section className="border-b border-borderDark p-8 text-center">
              <h3 className="text-lg font-semibold text-primary">
                Sem comentários ainda
              </h3>
              <p className="mt-2 text-sm font-medium text-mutedText">
                Seja a primeira pessoa a continuar essa conversa.
              </p>
            </section>
          ))}

        {loadingComments && <ForumCommentsArea comments={[]} loading={true} />}
      </main>

      <SharePostModal
        open={shareModalOpen}
        post={
          post?.postType === "share" && post.originalPost
            ? post.originalPost
            : post || null
        }
        loading={isShareDisabled}
        onClose={() => setShareModalOpen(false)}
        onSubmit={handleSharePost}
      />
    </div>
  );
};
