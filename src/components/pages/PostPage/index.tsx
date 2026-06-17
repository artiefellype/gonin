import {
  PostCommentsProps,
  PostCommentWithUserProps,
  PostProps,
  UserProps,
} from "@/types";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { formatDate } from "@/services/utils/formaters";
import { useUserContext } from "@/context";
import { CustomPopover } from "@/components/atoms/CustomPopover";
import {
  FaTrash as TrashIcon,
  FaHeart as LikeIcon,
  FaComment as CommentIcon,
  FaArrowLeft,
  FaRocket,
} from "react-icons/fa6";
import { FaEllipsisH as Dots } from "react-icons/fa";
import { postsServices } from "@/services/postServices";
import { UserServices } from "@/services/userServices";
import { ForumCommentComposerArea } from "@/components/molecules/ForumCommentComposer";
import { ForumCommentsArea } from "@/components/organisms/ForumCommentsArea";
import { getTitleFromTag, tagStyleMap } from "@/services/utils/mappers";

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
  const [isLikeDisabled, setIsLikeDisabled] = useState(false);
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
    }
  }, [post]);

  const tagStyle = post?.tags?.[0]
    ? tagStyleMap[post.tags[0]] || {
        backgroundColor: "#E8E4DA",
        color: "#5B554B",
      }
    : undefined;

  const defaultImageContainerOnError = (
    <div className="flex h-56 w-full flex-col items-center justify-center gap-3 rounded-md bg-slate-400 p-4">
      <span className="text-center text-xs font-medium text-whiteColor">
        Não foi possível carregar a imagem.
      </span>
    </div>
  );

  return (
    <div className="h-full min-h-0 w-full overflow-y-auto px-0 pb-20 pt-3 text-primary md:px-4 md:pb-8 md:pt-6">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 lg:grid-cols-[minmax(0,760px)_280px]">
        <div className="flex min-w-0 flex-col gap-4">
        <div className="sticky top-0 z-20 border-b border-slate-300/70 bg-background/95 px-3 py-3 backdrop-blur md:rounded-lg md:border md:bg-whiteColor/95 md:shadow-sm">
          <button
            onClick={() => router.push("/forum")}
            className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-accentSoft"
          >
            <FaArrowLeft size={14} />
            Voltar para o fórum
          </button>
        </div>

        <article className="rounded-lg border border-slate-200 bg-whiteColor p-4 shadow-sm md:p-5">
          {loading && (
            <div className="animate-pulse space-y-4">
              <div className="flex gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-400" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 w-40 rounded bg-slate-400" />
                  <div className="h-4 w-24 rounded bg-slate-400" />
                </div>
              </div>
              <div className="h-5 w-3/4 rounded bg-slate-400" />
              <div className="h-4 w-full rounded bg-slate-400" />
              <div className="h-4 w-5/6 rounded bg-slate-400" />
            </div>
          )}

          {!loading && post && (
            <>
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex min-w-0 gap-3">
                  <div className="flex h-10 w-10 shrink-0 rounded-full bg-gray-500">
                    <Image
                      className="rounded-full object-cover"
                      src={userOwnerPhotoURL || "/imgs/default_perfil.jpg"}
                      alt={"user photo"}
                      width={40}
                      height={40}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <h1 className="flex items-center gap-1 text-base font-bold text-primary">
                        {userOwnerInfo?.displayName}
                        {userOwnerInfo?.tag ? (
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
                    {post.tags?.[0] && (
                      <span
                        style={tagStyle}
                        className="mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium"
                      >
                        {getTitleFromTag(post.tags[0])}
                      </span>
                    )}
                  </div>
                </div>

                {(user as string) === post.userId && (
                  <CustomPopover
                    trigger={
                      <button className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-accentSoft">
                        <Dots className="fill-primary" size={18} />
                      </button>
                    }
                    content={
                      <div className="flex flex-col rounded-md bg-primary">
                        <button
                          className="flex flex-row items-center justify-start gap-2 rounded-md px-4 py-2 text-whiteColor hover:bg-slate-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteUniquePost(post.id);
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

              <div className="break-words">
                {post.title && (
                  <h2 className="mb-3 text-xl font-bold leading-7 text-gray-800 md:text-2xl">
                    {post.title}
                  </h2>
                )}

                <p className="mb-4 whitespace-pre-wrap text-base font-normal leading-7 text-gray-600">
                  {post.description}
                </p>

                {!errorImage && post.mediaFile && (
                  <Image
                    className="max-h-[680px] w-full rounded-md object-cover"
                    src={post.mediaFile}
                    alt={"post media"}
                    width={720}
                    height={680}
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
              </div>

              <div className="mt-5 flex flex-row items-center gap-6 border-t border-slate-200 pt-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLikePost();
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

                <div className="flex flex-row items-center gap-2 rounded-full px-2 py-1 text-gray-600">
                  <CommentIcon size={18} />
                  <span className="text-sm font-medium">
                    {post.commentCount}
                  </span>
                </div>
              </div>
            </>
          )}
        </article>

        <ForumCommentComposerArea
          handleSubmit={handleSubmitComment}
          userInfo={userInfo as UserProps}
          loading={loading}
        />

        {!loadingComments &&
          (comments.length > 0 ? (
            <ForumCommentsArea comments={comments} loading={loading} />
          ) : (
            <section className="rounded-lg border border-slate-200 bg-whiteColor p-8 text-center shadow-sm">
              <h3 className="text-lg font-bold text-primary">
                Sem comentários ainda
              </h3>
              <p className="mt-2 text-sm font-light text-slate-600">
                Seja a primeira pessoa a continuar essa conversa.
              </p>
            </section>
          ))}

        {loadingComments && <ForumCommentsArea comments={[]} loading={true} />}
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-6 flex flex-col gap-4">
            <section className="rounded-lg border border-slate-200 bg-whiteColor p-4 shadow-sm">
              <h2 className="text-base font-bold text-primary">
                Nesta conversa
              </h2>
              <div className="mt-4 flex flex-col gap-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-light text-slate-500">Categoria</span>
                  <span className="max-w-[150px] truncate font-semibold text-primary">
                    {post?.tags?.[0] ? getTitleFromTag(post.tags[0]) : "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-light text-slate-500">Curtidas</span>
                  <span className="font-semibold text-primary">
                    {loading ? "-" : likedCount}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-light text-slate-500">Respostas</span>
                  <span className="font-semibold text-primary">
                    {loading ? "-" : post?.commentCount || 0}
                  </span>
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-whiteColor p-4 shadow-sm">
              <h2 className="text-base font-bold text-primary">
                Continue no ritmo
              </h2>
              <p className="mt-2 text-sm font-light leading-6 text-slate-600">
                Leia o post, responda com contexto e volte ao feed quando quiser
                descobrir outras conversas.
              </p>
              <button
                onClick={() => router.push("/forum")}
                className="mt-4 flex h-10 w-full items-center justify-center rounded-full bg-accent text-sm font-bold text-whiteColor transition-colors hover:bg-primary"
              >
                Ver mais posts
              </button>
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
};
