import React, { useEffect, useState } from "react";
import { ForumPosts } from "../../molecules/ForumPosts";
import CardSkeleton from "../../atoms/CardSkeleton";
import { postsServices } from "@/services/postServices";
import { PostProps } from "@/types";
import { UserServices } from "@/services/userServices";
import { useUserContext } from "@/context";

interface HomeProps {
  posts: PostProps[]
  loading?: boolean
  fetch: () => Promise<void>
  setPosts: (posts: PostProps[]) => void
}

const ForumContainer = ({ posts, loading, fetch, setPosts }: HomeProps) => {
  const [foundPosts, setFoundPosts] = useState(posts);
  const { user } = useUserContext()

  const handleDeletePost = async (id: string) => {
    try {
      const updatedPosts = posts.filter((post) => post.id !== id);
      setPosts(updatedPosts)
      const userInfo = await UserServices.getUserById(user?.user?.uid!!)
      const updatedUserPosts = userInfo.posts.filter((postId: string) => postId !== id);
      userInfo.posts = updatedUserPosts;
      await UserServices.updateUser(userInfo)
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
  }

  const handleHasUserLiked = async (postId: string, userId: string): Promise<boolean> => {
    try {
      const response = await postsServices.hasUserLikedPost(postId, userId);
      if(response== undefined) console.log("UNDEFINED RESPONSE IN HANDLER")
      return response
    } catch (error: any) {
      console.error(error.message);
      return false
      
    } 
  }

  useEffect(() => {
    const sortedPosts = posts.slice().sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
    setFoundPosts(sortedPosts);
  }, [posts]);

  return (
    <div className="md:w-full w-screen px-3 md:px-0 min-h-screen md:max-w-4xl flex flex-col items-center gap-y-5 pb-5 relative">
      {loading && <CardSkeleton />}
      {!loading && foundPosts.length !== 0 ? (
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
        })
      ) : (
        <div className="mt-4 font-semibold text-base text-center">Nada para ver aqui :/</div>
      )}
    </div>
  );
};

export default ForumContainer;
