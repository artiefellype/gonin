import { Header } from '@/components/molecules/header'
import { MenuItemsProps, SideOptions } from '@/components/molecules/SideOptions'
import { Layout } from 'antd'
import React from 'react'
import { HiHome } from "react-icons/hi";
import { MdExplore } from "react-icons/md";

interface Props {
  children: React.ReactNode;
}

export const ForumLayout = ({children}: Props) => {

  const items: MenuItemsProps[] = [
    {
      label: 'INICIO',
      icon: HiHome,
      key: 'forum',
      path: `/forum`,
      show: true,
    },
    {
      label: 'EXPLORAR',
      icon: MdExplore,
      key: 'explore',
      path: `/explore`,
      show: true,
    },
    
  ];

  return (
      <Layout>
        <div className='w-screen bg-background'>
        <Header/>
        <SideOptions items={items}>
          {children}
        </SideOptions>
        </div>
      </Layout>
  )
}