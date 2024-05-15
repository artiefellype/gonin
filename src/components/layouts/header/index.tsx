import CustomPopover from "@/components/atoms/CustomPopover";
import MenuButton from "@/components/molecules/MenuButton";
import { User, useUserContext } from "@/context/appContext";
import { useRouter } from "next/router";
import React, { useEffect } from "react";

export function Header() {

  const {signOut, user} = useUserContext()
  const router = useRouter()

  const handleSignOut = async ()=> {
    await signOut()
    router.push('/login')
  }

  return (
    <>
      <div className="w-full h-[72px] bg-whiteColor flex justify-between p-4 items-center px-96">
        <div className=" flex md:justify-center">
          <h1 className="font-extrabold text-3xl text-primary ">GONIN</h1>
        </div>
        <div className="flex flex-row gap-2">
        <CustomPopover
          trigger={
            <MenuButton 
            className='flex flex-row gap-3 items-center rounded-full p-2 hover:bg-secondary'
            user={user as User}
           />
          }
          content={
            <div className="flex flex-col ">
              <button className="bg-whiteColor text-primary px-4 py-2 hover:bg-secondary" onClick={handleSignOut}>Sair</button>
            </div>
          }
        />
          
        </div>
      </div>
      
    </>
  );
}
