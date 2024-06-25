import { TopicPage } from '@/components/pages/TopicPage';
import { LayoutForum } from '@/components/templates/LayoutForum';
import { useRouter } from 'next/router';
import React from 'react'

 const Topic = () => {

  const router = useRouter();
  const { topic } = router.query;
  
  return (
    <LayoutForum>
      <TopicPage tag={topic as string}/>
    </LayoutForum>
  )
}

export default Topic