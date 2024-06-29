import { TopicPage } from "@/components/pages/TopicPage";
import { LayoutForum } from "@/components/templates/LayoutForum";
import { getTitleFromTag } from "@/services/utils/mappers";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import React from "react";

const Topic = () => {
  const router = useRouter();
  const { topic } = router.query;

  return (
    <LayoutForum>
      <Head>
        <title>Tópicos - {getTitleFromTag(topic as string)}</title>
      </Head>
      <TopicPage tag={topic as string} />
    </LayoutForum>
  );
};

export default Topic;


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