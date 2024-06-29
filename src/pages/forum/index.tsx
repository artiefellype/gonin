
import { ForumPage } from '@/components/pages/ForumPage'
import { LayoutForum } from '@/components/templates/LayoutForum'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { parseCookies } from 'nookies'
import React from 'react'

const Forum = () => {
  return (
    <LayoutForum>
      <Head>
        <title>GONIN</title>
      </Head>
      <ForumPage />
    </LayoutForum>
  )
}

export default Forum

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