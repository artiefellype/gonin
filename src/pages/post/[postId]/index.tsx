import { PostPage } from "@/components/pages/PostPage";
import { TopicPage } from "@/components/pages/TopicPage";
import { LayoutForum } from "@/components/templates/LayoutForum";
import { getTitleFromTag } from "@/services/utils/mappers";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import React from "react";

const Post = () => {
  const router = useRouter();
  const { postId } = router.query;

  return (
    <LayoutForum>
      <Head>
        <title>Post</title>
      </Head>
      <PostPage postIdUrl={postId as string} />
    </LayoutForum>
  );
};

export default Post;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const cookies = parseCookies(ctx);

  if (cookies.gonin_token) {
    return {
      props: {},
    };
  }

  return {
    redirect: {
      destination: '/login',
      permanent: false,
    },
  };
};
