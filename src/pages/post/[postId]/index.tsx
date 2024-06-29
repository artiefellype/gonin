import { PostPage } from "@/components/pages/PostPage";
import { TopicPage } from "@/components/pages/TopicPage";
import { LayoutForum } from "@/components/templates/LayoutForum";
import { getTitleFromTag } from "@/services/utils/mappers";
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";

const Post = () => {
  const router = useRouter();
  const { postId } = router.query;

  return (
    <LayoutForum>
      <Head>
        <title>Post</title>
      </Head>
      <PostPage postId={postId as string} />
    </LayoutForum>
  );
};

export default Post;
