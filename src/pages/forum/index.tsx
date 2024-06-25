import ForumPage from '@/components/pages/Forum'
import { ForumLayout } from '@/components/templates/ForumLayout'
import React from 'react'

const Forum = () => {
  return (
    <ForumLayout>
      <ForumPage />
    </ForumLayout>
  )
}

export default Forum