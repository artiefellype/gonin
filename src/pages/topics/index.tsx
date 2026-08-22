import { TopicsPage } from '@/components/pages/TopicsPage'
import { LayoutForum } from '@/components/templates/LayoutForum'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { parseCookies } from 'nookies'
import React from 'react'

const Topics = () => {
  return (
    <LayoutForum>
      <Head>
        <title>Tópicos</title>
      </Head>
        <TopicsPage/>
    </LayoutForum>
  )
}

export default Topics

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
