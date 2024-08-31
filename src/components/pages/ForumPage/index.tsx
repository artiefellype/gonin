"use client";
import ForumContainer from "@/components/organisms/ForumContainer";
import { useEffect, useState } from "react";
import { PostProps } from "@/types";
import { postsServices } from "@/services/postServices";
import { GetServerSideProps } from "next";
import { parseCookies } from "nookies";
import Link from "next/link";
import { ForumComposerArea } from "@/components/molecules/ForumComposer";

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
      <div className="flex justify-center items-start flex-col w-full">
        <div className="w-full mb-4 mt-11 flex justify-center items-center">
          <ForumComposerArea 
          tag={"espaco-livre"}
          fetchNewPosts={fetchPosts} />
        </div>
        <ForumContainer
          posts={posts}
          loading={loading}
          fetch={fetchPosts}
          setPosts={setPosts}
        />
      </div>
      <div className="w-80 h-96 px-4">

      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const cookies = parseCookies(ctx);

  if (!cookies.gonin_token) {
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
