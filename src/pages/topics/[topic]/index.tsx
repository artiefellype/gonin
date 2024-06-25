import { TopicPage } from '@/components/pages/Topic';
import { ForumLayout } from '@/components/templates/ForumLayout';
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