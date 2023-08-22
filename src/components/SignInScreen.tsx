import Image from 'next/image'
import React from 'react'
import { FaGofore } from 'react-icons/fa'

interface SignInScreenProps {
  loginWithGoogle: ()=>void;
  loading: (value: boolean) => void
}
const SignInScreen = ({loginWithGoogle, loading}: SignInScreenProps) => {
  return (
    <div className='w-screen h-screen  flex justify-center items-center bg-animb bg-center'>
        <div className=' w-11/12 h-screen flex flex-col justify-around items-center relative'>
          <div className='absolute flex flex-row items-center top-12 inset-x-auto'>
            <Image src={'/imgs/fivechan_logo.png'} alt={'fivechan logo'} width={70} height={70}/>
            <h1 className='text-3xl font-bold ml-2'>5chan</h1>
          </div>
          <div className='flex flex-col gap-2 items-center w-full'>
            <h1>Sign In</h1>
            <button onClick={() => {
              loginWithGoogle()
              loading(true)
              }} className='border-red-500 border-solid border-2 w-2/3 h-9 rounded-3xl flex flex-row justify-center items-center gap-2'> <FaGofore className="mb-[1px] bg-slate-200 text-gray-700 rounded-full" /> Continue com Google</button>
          </div>
        </div>
    </div>
  )
}

export default SignInScreen 