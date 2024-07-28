import React, { ButtonHTMLAttributes } from 'react'
import Image from 'next/image'
import { FaEllipsisH as Dots } from "react-icons/fa";
import { User } from '@/context';
import { UserProps } from '@/types';

export interface MenuButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  user?: UserProps;
}

export const MenuButton = ({user, ...rest}: MenuButtonProps) => {

  return (
    <button 
      {...rest}
      >
        {/* FOTO DE PERFIL */}
        
        <div className='w-10 h-10 flex justify-center items-center'>
        <Image 
            src={user?.photoURL || "/imgs/default_perfil.jpg"}
            alt={'perfil photo'} 
            width={40} 
            height={40}
            className='rounded-full'
        />
        </div>
        {/* Nome E EMAIL */}
        <div className='flex flex-col justify-center items-start text-primary'>
          <h3 className='font-semibold h-5 text-base'>{user?.displayName}</h3>
          <p className='font-extralight text-sm'>{user?.email}</p>
        </div>
        {/* Botao */}
        <div className=' flex justify-center items-center'>
          <Dots className='fill-primary' size={20}/>
        </div>
    </button>
  )
}