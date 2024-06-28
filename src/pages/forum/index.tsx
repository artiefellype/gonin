
import { ForumPage } from '@/components/pages/ForumPage'
import { LayoutForum } from '@/components/templates/LayoutForum'
import Head from 'next/head'
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