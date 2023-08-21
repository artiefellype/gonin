import React from 'react'

import { userContext } from '@/context/appContext';
import { auth, entrarComGoogle, logout } from '@/firebase/authentication';
import { fireApp } from '@/firebase/firebase';
import Forum from '@/pages/forum';
import { useRouter } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';
import SignInScreen from '@/components/SignInScreen';


const Login = () => {

    const {user, setUser} = useContext(userContext);
  
    const [isLogged, setIsLogged] = useState(false);
    const router = useRouter();
    
  
    useEffect(() => {
      auth.onAuthStateChanged((user)=>{
        setUser({
          isAuth: true,
          user: user,
        })

        if(user != null){
           setIsLogged(true)
        }
        else setIsLogged(false)
      }, (err)=> {})
    }, [])
  
    

  return (
    <div>
      { isLogged ? <Forum />: <SignInScreen loginWithGoogle={entrarComGoogle} />}
    </div>
  )
}

export default Login