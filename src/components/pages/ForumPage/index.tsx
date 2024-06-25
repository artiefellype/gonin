"use client";
import ForumContainer from "@/components/organisms/ForumContainer";
import { useEffect, useState } from "react";
import { PostProps } from "@/types";
import { postsServices } from "@/services/postServices";
import { GetServerSideProps } from "next";
import { parseCookies } from "nookies";

export const ForumPage = () => {
  const [posts, setPosts] = useState<PostProps[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const fetchedPosts = await postsServices.getPosts();
      const updatedPosts = fetchedPosts.filter(
        (newPost) =>
          !posts.some((existingPost) => newPost.id === existingPost.id)
      );
      setPosts((prevPosts) => [...prevPosts, ...updatedPosts]);
      setLoading(false);
    } catch (err: any) {
      console.error("ERROR: ", err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <>
      <div className="pt-10"></div>
      <ForumContainer posts={posts} loading={loading} fetch={fetchPosts} setPosts={setPosts} />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const cookies = parseCookies(ctx);

  if (!cookies.token) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};
