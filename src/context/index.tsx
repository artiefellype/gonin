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
  updateDoc,
  where,
} from "firebase/firestore";
import {
  buildUsernameCandidate,
  getDisplayNameFallback,
  hydrateUserIdentity,
  isValidUsername,
  normalizeSearchText,
  normalizeUsername,
} from "@/services/utils/userIdentity";
import { UserProps } from "@/types";

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
    username: string,
    email: string,
    password: string,
    displayName?: string
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
    if (!isValidUsername(userName)) return false;

    const normalizedName = normalizeUsername(userName);

    if (!normalizedName) return false;

    const usersQuery = query(
      collection(firestore, "users"),
      where("searchUsername", "==", normalizedName)
    );
    const usersSnapshot = await getDocs(usersQuery);
    const hasCurrentUserOnly = usersSnapshot.docs.every((userDoc) => {
      const userData = userDoc.data();
      const foundUserId = userData.uid || userDoc.id;

      return Boolean(currentUserId && foundUserId === currentUserId);
    });

    if (!hasCurrentUserOnly) return false;

    const allUsersSnapshot = await getDocs(collection(firestore, "users"));
    return allUsersSnapshot.docs.every((userDoc) => {
      const userData = hydrateUserIdentity({
        id: userDoc.id,
        ...userDoc.data(),
      } as UserProps);
      const foundUserId = userData.uid || userDoc.id;

      if (currentUserId && foundUserId === currentUserId) return true;
      return userData.searchUsername !== normalizedName;
    });
  };

  const buildUniqueUsername = async (
    baseName?: string | null,
    currentUserId?: string
  ) => {
    const cleanBaseName = buildUsernameCandidate(baseName);

    if (await checkUserNameAvailability(cleanBaseName, currentUserId)) {
      return cleanBaseName;
    }

    for (let suffix = 2; suffix <= 50; suffix += 1) {
      const suffixText = String(suffix);
      const candidate = normalizeUsername(
        `${cleanBaseName.slice(0, 32 - suffixText.length)}${suffixText}`
      );

      if (await checkUserNameAvailability(candidate, currentUserId)) {
        return candidate;
      }
    }

    const fallbackSuffix = Date.now().toString(36).slice(-6);
    return `${cleanBaseName.slice(0, 32 - fallbackSuffix.length)}${fallbackSuffix}`;
  };

  const ensureCurrentUserIdentity = async (authUser: FirebaseUser) => {
    const userDocRef = doc(firestore, "users", authUser.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) return;

    const rawData = userDoc.data();
    const hydratedUser = hydrateUserIdentity({
      id: userDoc.id,
      ...rawData,
      email: rawData.email || authUser.email || "",
    } as UserProps);
    const needsUsername = !rawData.username || !rawData.searchUsername;
    const needsDisplayName = !rawData.displayName;
    const displayName = getDisplayNameFallback(
      hydratedUser.displayName,
      authUser.email
    );
    const username = needsUsername
      ? await buildUniqueUsername(displayName, authUser.uid)
      : hydratedUser.username;

    if (needsUsername || needsDisplayName) {
      await updateDoc(userDocRef, {
        displayName,
        searchName: normalizeSearchText(displayName),
        username,
        searchUsername: normalizeUsername(username),
      });
    }

    if (!authUser.displayName || authUser.displayName !== displayName) {
      await updateProfile(authUser, { displayName });
    }
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
        const displayName = getDisplayNameFallback(
          credential.user.displayName ||
            credential.user.email?.split("@")[0],
          credential.user.email
        );
        const username = await buildUniqueUsername(displayName);

        await setDoc(userDocRef, {
          uid: credential.user.uid,
          displayName,
          searchName: normalizeSearchText(displayName),
          username,
          searchUsername: normalizeUsername(username),
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
      } else {
        await ensureCurrentUserIdentity(credential.user);
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
      await ensureCurrentUserIdentity(credential.user);

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
    username: string,
    email: string,
    password: string,
    displayName?: string
  ) => {
    try {
      const requestedUsername = username.trim();

      if (!requestedUsername) {
        throw new Error("Informe um nome de usuário.");
      }

      if (!isValidUsername(requestedUsername)) {
        throw new Error("Use um nome de usuário sem espaços.");
      }

      const cleanUsername = normalizeUsername(requestedUsername);
      const isUserNameAvailable = await checkUserNameAvailability(
        cleanUsername
      );

      if (!isUserNameAvailable) {
        throw new Error("Nome de usuário já está em uso.");
      }

      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const token = await credential.user.getIdTokenResult();
      const tempName = credential.user.email?.split("@")[0]
      const cleanDisplayName = getDisplayNameFallback(displayName, email);

      await updateProfile(credential.user, {
        displayName: cleanDisplayName,
      });

      const userDocRef = doc(firestore, "users", credential.user.uid);
      await setDoc(userDocRef, {
        uid: credential.user.uid,
        displayName: cleanDisplayName || tempName || "",
        searchName: normalizeSearchText(cleanDisplayName || tempName),
        username: cleanUsername,
        searchUsername: normalizeUsername(cleanUsername),
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
