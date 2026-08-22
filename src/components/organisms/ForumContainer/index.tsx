import React, { useEffect, useRef, useState } from "react";
import { ForumPosts } from "../../molecules/ForumPosts";
import CardSkeleton from "../../atoms/CardSkeleton";
import { postsServices } from "@/services/postServices";
import { PostProps } from "@/types";
import { UserServices } from "@/services/userServices";
import { useUserContext } from "@/context";

interface HomeProps {
  posts: PostProps[];
  loading?: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  fetch: () => Promise<void>;
  onLoadMore?: () => Promise<void>;
  setPosts: (posts: PostProps[]) => void;
}

const ForumContainer = ({
  posts,
  loading,
  loadingMore = false,
  hasMore = false,
  fetch,
  onLoadMore,
  setPosts,
}: HomeProps) => {
  const [foundPosts, setFoundPosts] = useState(posts);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const { user } = useUserContext();

  const handleDeletePost = async (id: string) => {
    try {
      const updatedPosts = posts.filter((post) => post.id !== id);
      setPosts(updatedPosts);
      const userInfo = await UserServices.getUserById(user?.user?.uid!!);
      const updatedUserPosts = userInfo.posts.filter(
        (postId: string) => postId !== id
      );
      userInfo.posts = updatedUserPosts;
      await UserServices.updateUser(userInfo);
      await postsServices.deletePost(id);
    } catch (error: any) {
      console.error(error.message);
    }
  };

  const handleLikePost = async (postId: string, id: string) => {
    try {
      await postsServices.likePost(postId, id);
    } catch (error: any) {
      console.error(error.message);
    }
  };

  const handleHasUserLiked = async (
    postId: string,
    userId: string
  ): Promise<boolean> => {
    try {
      const response = await postsServices.hasUserLikedPost(postId, userId);
      if (response == undefined) console.error("UNDEFINED RESPONSE IN HANDLER");
      return response;
    } catch (error: any) {
      console.error(error.message);
      return false;
    }
  };

  useEffect(() => {
    const sortedPosts = posts.slice().sort((a, b) => {
      const aPinned = a.pinned !== undefined ? a.pinned : false;
      const bPinned = b.pinned !== undefined ? b.pinned : false;

      if (bPinned && !aPinned) {
        return 1;
      } else if (!bPinned && aPinned) {
        return -1;
      } else {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      }
    });

    setFoundPosts(sortedPosts);
  }, [posts]);

  useEffect(() => {
    if (!onLoadMore || !hasMore || loading || loadingMore) return;

    const sentinel = loadMoreRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMore();
        }
      },
      {
        root: null,
        rootMargin: "360px 0px",
        threshold: 0,
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, onLoadMore]);

  return (
    <div className="flex w-full min-w-0 flex-col pb-5">
      {loading && posts.length === 0 && <CardSkeleton />}
      {!loading && foundPosts.length !== 0 &&
        foundPosts.map((item) => {
          return (
            <ForumPosts
              key={item.id}
              post={item}
              fetch={fetch}
              onDelete={handleDeletePost}
              onLike={handleLikePost}
              hasLiked={handleHasUserLiked}
            />
          );
        })}
      {!loading && foundPosts.length === 0 && (
        <div className="border-b border-borderDark bg-background/70 p-6 text-center sm:p-8 md:bg-background">
          <h2 className="text-base font-semibold text-primary">
            Nenhuma conversa por aqui ainda.
          </h2>
          <p className="mt-2 text-sm font-medium text-mutedText">
            Seja a primeira pessoa a abrir uma ideia no feed.
          </p>
        </div>
      )}
      {!loading && loadingMore && (
        <div className="py-5 text-center text-sm font-semibold text-mutedText">
          Carregando mais conversas...
        </div>
      )}
      {!loading && foundPosts.length !== 0 && !hasMore && (
        <div className="py-6 text-center text-sm font-semibold text-mutedText">
          Você chegou ao fim por enquanto.
        </div>
      )}
      <div ref={loadMoreRef} className="h-1 w-full" aria-hidden="true" />
    </div>
  );
};

export default ForumContainer;
