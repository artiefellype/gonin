import { TopicPage } from '@/components/pages/topic';
import { ForumLayout } from '@/components/templates/forumLayout';
import { useRouter } from 'next/router';
import React from 'react'

 const Topic = () => {

  const router = useRouter();
  const { topic } = router.query;
  
  return (
    <ForumLayout>
      <TopicPage tag={topic as string}/>
    </ForumLayout>
  )
}

export default Topic