import Image from 'next/image'
import React from 'react'
import { FaGofore } from 'react-icons/fa'

interface SignInScreenProps {
  loginWithGoogle: ()=>void;
}
const SignInScreen = ({loginWithGoogle}: SignInScreenProps) => {
  return (
    <div className='w-screen h-screen  flex justify-center items-center bg-animb bg-center'>
        <div className='bg-[rgba(17,25,40,.75)] border-[1px] border-[rgba(255,255,255,.125)] rounded-lg backdrop-filter backdrop-blur-[16px] backdrop-saturate-[180%] w-11/12 h-4/6 flex flex-col justify-around items-center relative'>
          <div className='absolute flex flex-row items-center top-12 inset-x-auto'>
            <Image src={'/imgs/fivechan_logo.png'} alt={'fivechan logo'} width={70} height={70}/>
            <h1 className='text-3xl font-bold ml-2'>5chan</h1>
          </div>
          <div className='flex flex-col gap-1 items-center'>
            <h1>Sign In with</h1>
            <button onClick={loginWithGoogle} className='border-red-500 border-solid border-2 w-24 h-9 flex flex-row justify-center items-center'><FaGofore className="mb-[1px]" />oogle</button>
          </div>
        </div>
    </div>
  )
}

export default SignInScreen 