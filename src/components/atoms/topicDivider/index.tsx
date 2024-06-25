import { getTitleFromTag } from '@/services/utils/mappers'
import React from 'react'

interface DividerProps {
    tag: string
}
export const TopicDivider = ({tag}: DividerProps) => {
  return (
    <>
    <h2 className='font-bold text-lg text-primary'>{getTitleFromTag(tag)}</h2>
    <div className='w-9/12 h-[2px] bg-slate-400 mb-2 '></div>
    </>
  )
}