"use client";
import ForumContainer from "@/components/organisms/ForumContainer";
import { useEffect, useState } from "react";
import { PostProps } from "@/types";
import { postsServices } from "@/services/postServices";
import { GetServerSideProps } from "next";
import { parseCookies } from "nookies";
import Link from "next/link";

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
        <div className="w-full h-8 my-4 flex justify-center items-center">
          <Link
            href={"/topics"}
            className="w-full h-8 bg-slate-700  rounded-2xl max-w-[250px] text-whiteColor font-semibold text-sm px-4 py-1 hover:bg-slate-600 flex justify-center items-center hover:text-slate-100 delay-75 transition-colors"
          >
            Comece uma nova discussão
          </Link>
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
