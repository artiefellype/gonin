import { ForumPage } from '@/components/pages/forum'
import { ForumLayout } from '@/components/templates/forumLayout'
import React from 'react'

const Forum = () => {
  return (
    <ForumLayout>
      <ForumPage />
    </ForumLayout>
  )
}

export default Forum