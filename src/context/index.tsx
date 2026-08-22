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
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { fireApp as app, firestore } from "@/firebase/firebase";
import { destroyCookie, parseCookies, setCookie } from "nookies";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";

const normalizeSearchName = (value?: string | null) =>
  (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

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
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (
    userName: string,
    email: string,
    password: string
  ) => Promise<void>;
  checkUserNameAvailability: (
    userName: string,
    currentUserId?: string
  ) => Promise<boolean>;
};

export const UserFiveContext = createContext({} as UserContextType);

export const UserContextProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>({ isAuth: false, user: null });
  const googleProvider = new GoogleAuthProvider();
  const auth = getAuth(app);

  const checkUserNameAvailability = async (
    userName: string,
    currentUserId?: string
  ) => {
    const normalizedName = normalizeSearchName(userName);

    if (!normalizedName) return false;

    const usersQuery = query(
      collection(firestore, "users"),
      where("searchName", "==", normalizedName)
    );
    const usersSnapshot = await getDocs(usersQuery);

    return usersSnapshot.docs.every((userDoc) => {
      const userData = userDoc.data();
      const foundUserId = userData.uid || userDoc.id;

      return Boolean(currentUserId && foundUserId === currentUserId);
    });
  };

  const buildUniqueDisplayName = async (baseName?: string | null) => {
    const cleanBaseName = (baseName || "Usuário").trim() || "Usuário";

    if (await checkUserNameAvailability(cleanBaseName)) {
      return cleanBaseName;
    }

    for (let suffix = 2; suffix <= 50; suffix += 1) {
      const candidate = `${cleanBaseName} ${suffix}`;

      if (await checkUserNameAvailability(candidate)) {
        return candidate;
      }
    }

    return `${cleanBaseName} ${Date.now().toString(36)}`;
  };

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
        const displayName = await buildUniqueDisplayName(
          credential.user.displayName ||
            credential.user.email?.split("@")[0] ||
            "Usuário"
        );

        await setDoc(userDocRef, {
          uid: credential.user.uid,
          displayName,
          searchName: normalizeSearchName(displayName),
          email: credential.user.email,
          photoURL: credential.user.photoURL,
          createdAt: new Date().toISOString(),
          tag: '',
          posts: [],
          member: false,
          bio: "",
          location: "",
          profileBanner: "",
          friendCount: 0,
          savedCount: 0,
          communityId: "",
          communities: [],
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


  const signUpWithEmail = async (
    userName: string,
    email: string,
    password: string
  ) => {
    try {
      const cleanUserName = userName.trim();

      if (!cleanUserName) {
        throw new Error("Informe um nome de usuário.");
      }

      const isUserNameAvailable = await checkUserNameAvailability(
        cleanUserName
      );

      if (!isUserNameAvailable) {
        throw new Error("Nome de usuário já está em uso.");
      }

      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const token = await credential.user.getIdTokenResult();
      const tempName = credential.user.email?.split("@")[0]

      await updateProfile(credential.user, {
        displayName: cleanUserName,
      });

      const userDocRef = doc(firestore, "users", credential.user.uid);
      await setDoc(userDocRef, {
        uid: credential.user.uid,
        displayName: cleanUserName || tempName || "",
        searchName: normalizeSearchName(cleanUserName || tempName),
        email: credential.user.email,
        photoURL: credential.user.photoURL || "",
        createdAt: new Date().toISOString(),
        tag: '',
        posts: [],
        member: false,
        bio: "",
        location: "",
        profileBanner: "",
        friendCount: 0,
        savedCount: 0,
        communityId: "",
        communities: [],
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
      throw err;
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
    signUpWithEmail: signUpWithEmail,
    checkUserNameAvailability,
  };

  

  return (
    <UserFiveContext.Provider value={contextValue}>
      {children}
    </UserFiveContext.Provider>
  );
};

export const useUserContext = () => useContext(UserFiveContext);
