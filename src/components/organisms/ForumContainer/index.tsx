import React, { useEffect, useState } from "react";
import { ForumPosts } from "../../molecules/ForumPosts";
import CardSkeleton from "../../atoms/CardSkeleton";
import { postsServices } from "@/services/postServices";
import { PostProps } from "@/types";

interface HomeProps {
  posts: PostProps[]
  loading?: boolean
  fetch: () => Promise<void>
  setPosts: (posts: PostProps[]) => void
}

const ForumContainer = ({ posts, loading, fetch, setPosts }: HomeProps) => {
  const [foundPosts, setFoundPosts] = useState(posts);

  const handleDeletePost = async (id: string) => {
    try {
      const updatedPosts = posts.filter((post) => post.id !== id);
      setPosts(updatedPosts)
      await postsServices.deletePost(id);
    } catch (error: any) {
      console.error(error.message);
    } 
  };

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
            />
          );
        })
      ) : (
        <div>Vazio</div>
      )}
    </div>
  );
};

export default ForumContainer;
