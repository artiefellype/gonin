import { TopicsPage } from '@/components/pages/TopicsPage'
import { LayoutForum } from '@/components/templates/LayoutForum'
import Head from 'next/head'
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