// userProvider.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Auth, User as FirebaseUser, GoogleAuthProvider, getAuth, signInWithPopup, signInWithRedirect, signOut } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { fireApp as app } from '@/firebase/firebase';

type User = {
  isAuth: boolean;
  auth?: Auth;
  user: FirebaseUser | null;
};

type UserContextType = {
  user: User | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
};

export const UserFiveContext = createContext({} as UserContextType);


export const UserContextProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>({ isAuth: false, user: null  });
  const googleProvider = new GoogleAuthProvider();
  const auth = getAuth(app)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        setUser({ isAuth: true, user: authUser, auth: auth });
      } else {
        setUser({ isAuth: false, user: null, auth: auth });
      }
    });

    return () => unsubscribe();
  }, []);

  const signInHandler = async () => {
    try {
      const credential = await signInWithPopup(auth, googleProvider)

      console.log("CRED: ", credential)
      const token = credential.user.getIdTokenResult();

    } catch (err: any) {
      const errorCode = err.code;
      const errorMessage = err.message;
      const email = err.customData.email;
      const credential = GoogleAuthProvider.credentialFromError(err);

      console.error(errorCode, ": ", errorMessage)
    }

  };

  const signOutHandler = async () => {
    await  signOut(auth);
  };

  const contextValue: UserContextType = {
    user,
    signIn: signInHandler,
    signOut: signOutHandler,
  };

  return <UserFiveContext.Provider value={contextValue}>{children}</UserFiveContext.Provider>
  
};

export const useUserContext = () => useContext(UserFiveContext);
