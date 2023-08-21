import React from 'react'

interface ForumCardInfoProps {
  setShowInfo: (value: boolean) => void
}
const ForumCardInfo = ({setShowInfo}:ForumCardInfoProps) => {
  return (
    <div className=' text-black'>
      <div>CARDS INFO</div>
      <div onClick={()=> setShowInfo(false)}>A</div>
    </div>
  )
}

export default ForumCardInfo