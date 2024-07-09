import {
  PostCommentsProps,
  PostCommentWithUserProps,
  PostProps,
  UserProps,
} from "@/types";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { formatDate } from "@/services/utils/formaters";
import { useUserContext } from "@/context";
import { CustomPopover } from "@/components/atoms/CustomPopover";
import {
  FaTrash as TrashIcon,
  FaHeart as LikeIcon,
  FaComment as CommentIcon,
} from "react-icons/fa6";
import { FaEllipsisH as Dots } from "react-icons/fa";
import { postsServices } from "@/services/postServices";
import { UserServices } from "@/services/userServices";
import { SpinLoad } from "@/components/atoms/SpinLoad";
import { ForumCommentComposerArea } from "@/components/molecules/ForumCommentComposer";
import { ForumCommentsArea } from "@/components/organisms/ForumCommentsArea";
import { FaRocket } from "react-icons/fa6";

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

  useEffect(() => {
    if (postId) {
      fetchPost();
    }
  }, [postId]);

  const fetchPost = async () => {
    setLoading(true);

    try {
      if (!postId) {
        throw new Error("Post ID is missing");
      }

      const fetchedPost: PostProps = await postsServices.getPostById(
        postId as string
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
      setLoading(false);
    } catch (error: any) {
      console.error("Error fetching post:", error.message);
      setLoading(false);
    }
  };

  const fetchPostComments = async () => {
    setLoadingComments(true);
    try {
      const response = await postsServices.getAllComments(postId as string);
      setComments(response);
      setLoadingComments(false);
    } catch (error: any) {
      console.error(error.message);
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
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      console.error(error.message);
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

  return (
    <div className="w-screen md:w-full min-h-screen h-auto mt-10 mb-10 flex flex-col justify-start items-center gap-1 text-primary">
      <div className="w-full md:max-w-2xl min-h-[10rem] h-auto bg-white rounded-lg p-2 flex flex-row relative">
        {!loading && (
          <div className="flex rounded-full m-2 bg-gray-500 w-full max-w-[2.5rem] h-10">
            <Image
              className="rounded-full "
              src={userOwnerPhotoURL}
              alt={"user photo"}
              width={40}
              height={40}
            />
          </div>
        )}
        {loading && (
          <div className="flex rounded-full m-2 w-full max-w-[2.5rem] h-10 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-slate-400"></div>
          </div>
        )}

        <div className="flex flex-col pt-2 w-full md:w-screen">
          <div className="flex">
            {!loading && (
              <div className="flex md:flex-row md:m-0 mb-3 flex-col md:gap-3 justify-center items-center">
                <h1 className="text-base font-bold w-auto text-left flex flex-row justify-center items-center gap-1">
                  {userOwnerInfo?.displayName}{" "}
                  {userOwnerInfo?.tag ? (
                    <span className="mt-1 ">
                      <FaRocket className="animate-blinkAnimation" />
                    </span>
                  ) : (
                    ""
                  )}
                </h1>
                <p className="font-light text-xs text-left md:w-auto w-full">
                  {formatDate(post?.createdAt!!)}
                </p>
              </div>
            )}
            {loading && (
              <div className="flex w-full md:flex-row md:m-0 mb-3 flex-col md:gap-3 justify-center items-center">
                <div className="h-5 w-28 bg-slate-400 rounded animate-pulse"></div>
                <div className="h-5 w-16 bg-slate-400 rounded animate-pulse"></div>
              </div>
            )}

            {(user as string) === post?.userId && (
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
                          handleDeleteUniquePost(post?.id!!);
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
              {!loading && (
                <>
                  {post?.title && (
                    <h2 className="font-semibold mb-2 text-base text-gray-800">
                      {post.title}
                    </h2>
                  )}

                  <p className="font-normal text-sm text-gray-500 mb-2 whitespace-pre-wrap">
                    {post?.description}
                  </p>

                  {!errorImage && (
                    <>
                      {post?.mediaFile && (
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
                            target.style.display = "none";
                            setErrorImage(true);
                          }}
                        />
                      )}
                    </>
                  )}

                  {errorImage && defaultImageContainerOnError}
                </>
              )}
              {loading && (
                <div className="gap-2 w-full  flex flex-col mt-2">
                  <div className="h-5 w-full bg-slate-400 rounded animate-pulse"></div>
                  <div className="h-5 w-full bg-slate-400 rounded animate-pulse"></div>
                  <div className="h-5 w-full bg-slate-400 rounded animate-pulse"></div>
                </div>
              )}
            </div>
          </div>

          <div className="flex w-full h-5 flex-row justify-start items-center mt-auto gap-2">
            {!loading && (
              <>
                <div className="flex flex-row gap-2 justify-center items-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLikePost();
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
                    }}
                    className="w-7 h-7 z-10 flex flex-row gap-1 justify-center items-center rounded-full"
                    disabled={isLikeDisabled}
                  >
                    <CommentIcon
                      size={20}
                      className=" fill-current text-gray-600 transition-transform hover:scale-110"
                    />
                    <div className="text-gray-800 font-medium text-sm">
                      {post?.commentCount}
                    </div>
                  </button>
                </div>
              </>
            )}
            {loading && (
              <div className="gap-2 flex flex-row mt-2">
                <div className="h-5 w-8 bg-slate-400 rounded animate-pulse"></div>
                <div className="h-5 w-8 bg-slate-400 rounded animate-pulse"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* comment area */}
      <ForumCommentComposerArea
        handleSubmit={handleSubmitComment}
        userInfo={userInfo as UserProps}
        loading={loading}
      />

      {/* all comments area */}
      {!loadingComments &&
        (comments.length > 0 ? (
          <ForumCommentsArea comments={comments} loading={loading} />
        ) : (
          <div className="w-full md:max-w-2xl h-auto bg-white rounded-lg p-6 flex flex-col justify-center items-center relative">
            <h3 className="font-bold text-center text-lg">
              Sem comentários ainda
            </h3>
            <p className="font-light text-center text-sm">
              Seja o primeiro a comentar
            </p>
          </div>
        ))}
      {loadingComments && (
        <div className="w-screen md:max-w-2xl h-auto bg-white rounded-lg p-2 flex flex-col relative">
          <div className="w-full  mt-1 flex flex-row justify-start items-start gap-1">
            <div className="flex rounded-full m-2 w-full max-w-[2.5rem] h-10 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-slate-400"></div>
            </div>
            <div className="flex flex-col pt-2 w-full">
              <div className="flex">
                <div className="flex md:flex-row md:m-0 mb-3 flex-col md:gap-3 justify-center items-center">
                  <div className="h-5 w-28 bg-slate-400 rounded animate-pulse"></div>
                  <div className="h-5 w-16 bg-slate-400 rounded animate-pulse"></div>
                </div>
              </div>

              <div className=" flex justify-center items-center">
                <div className="w-full break-words text-clip mb-3">
                  <div className="gap-2 flex flex-col mt-2">
                    <div className="h-5 w-full bg-slate-400 rounded animate-pulse"></div>
                    <div className="h-5 w-full bg-slate-400 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
