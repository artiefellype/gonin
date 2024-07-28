import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  Auth,
  User as FirebaseUser,
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { fireApp as app, firestore } from "@/firebase/firebase";
import { destroyCookie, parseCookies, setCookie } from "nookies";
import { doc, getDoc, setDoc } from "firebase/firestore";

export type User = {
  isAuth: boolean;
  auth?: Auth;
  user: FirebaseUser | null;
};

export type UserContextType = {
  user: User | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  getUserFromLocalStorage: () => string | null;
  signInWithEmail: (email: string, password: string) => Promise<void>,
  signUpWithEmail: (userName: string, email: string, password: string) => Promise<void>
};

export const UserFiveContext = createContext({} as UserContextType);

export const UserContextProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>({ isAuth: false, user: null });
  const googleProvider = new GoogleAuthProvider();
  const auth = getAuth(app);

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
      const credential = await signInWithPopup(auth, googleProvider);
      const token = await credential.user.getIdTokenResult();

      const userDocRef = doc(firestore, "users", credential.user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          uid: credential.user.uid,
          displayName: credential.user.displayName,
          email: credential.user.email,
          photoURL: credential.user.photoURL,
          createdAt: new Date().toISOString(),
          tag: '',
          posts: [],
          member: false
        });
      }

      setCookie(null, "userId", credential.user.uid, {
        maxAge: 30 * 24 * 60 * 60, // 30 dias
        path: "/", 
      });

      setCookie(null, "gonin_token", token.token, {
        maxAge: 30 * 24 * 60 * 60, // 30 dias
        path: "/",
      });
    } catch (err: any) {
      const errorCode = err.code;
      const errorMessage = err.message;
      const email = err.customData.email;
      const credential = GoogleAuthProvider.credentialFromError(err);

      console.error(errorCode, ": ", errorMessage);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const token = await credential.user.getIdTokenResult();

      setCookie(null, "userId", credential.user.uid, {
        maxAge: 30 * 24 * 60 * 60, // 30 dias
        path: "/", 
      });

      setCookie(null, "gonin_token", token.token, {
        maxAge: 30 * 24 * 60 * 60, // 30 dias
        path: "/",
      });
    } catch (err: any) {
      console.error(err.code, ": ", err.message);
      throw err
    }
  };


  const signUpWithEmail = async (userName: string, email: string, password: string) => {
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const token = await credential.user.getIdTokenResult();
      const tempName = credential.user.email?.split("@")[0]

      const userDocRef = doc(firestore, "users", credential.user.uid);
      await setDoc(userDocRef, {
        uid: credential.user.uid,
        displayName: credential.user.displayName || userName || tempName || "",
        email: credential.user.email,
        photoURL: credential.user.photoURL || "",
        createdAt: new Date().toISOString(),
        tag: '',
        posts: [],
        member: false
      });

      setCookie(null, "userId", credential.user.uid, {
        maxAge: 30 * 24 * 60 * 60, // 30 dias
        path: "/", 
      });

      setCookie(null, "gonin_token", token.token, {
        maxAge: 30 * 24 * 60 * 60, // 30 dias
        path: "/",
      });
    } catch (err: any) {
      console.error(err.code, ": ", err.message);
      return err
    }
  };

  const signOutHandler = async () => {
    await signOut(auth);
    destroyCookie(null, "gonin_token", { path: '/' });
    destroyCookie(null, "userId", { path: '/' });
  };

  const getUserFromLocalStorage = (): string | null => {
    const cookies = parseCookies();
    const userId = cookies.userId;
    if(userId) return userId
    else return null
  };

  const contextValue: UserContextType = {
    user,
    signIn: signInHandler,
    signOut: signOutHandler,
    getUserFromLocalStorage: getUserFromLocalStorage,
    signInWithEmail: signInWithEmail,
    signUpWithEmail: signUpWithEmail
  };

  

  return (
    <UserFiveContext.Provider value={contextValue}>
      {children}
    </UserFiveContext.Provider>
  );
};

export const useUserContext = () => useContext(UserFiveContext);
