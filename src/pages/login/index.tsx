import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useUserContext } from "@/context";
import Image from "next/image";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { SignInScreen } from "@/components/pages/SignInScreen";
import Head from "next/head";

const Login = () => {
  const { user, signIn } = useUserContext();
  const auth = getAuth(user?.auth?.app);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (user?.isAuth) {
      router.push("/forum");
    }
  }, [user, router]);

  const handleSignIn = async () => {
    setIsLoading(true);
    await signIn();
    setIsLoading(false);
  };

  useEffect(() => {
    const authStateChangedHandler = async (authUser: User | null) => {
      if (authUser) {
        router.push("/forum");
      } else {
        setIsLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, authStateChangedHandler);

    return () => {
      unsubscribe();
    };
  }, [auth, router]);

  return isLoading ? (
    <>
      <Head>
        <title>GONIN</title>
        <meta name="robots" content="noindex,follow" />
      </Head>
      <div className="flex min-h-[100svh] w-full items-center justify-center bg-transparent bg-center">
        <Image
          className="motion-safe:animate-bounce"
          src={"/imgs/fivechan_logo.png"}
          alt={"Logo loading"}
          width={100}
          height={100}
        />
      </div>
    </>
  ) : (
    <div className="flex min-h-[100svh] items-center justify-center bg-transparent">
      <Head>
        <title>Login</title>
        <meta name="robots" content="noindex,follow" />
      </Head>
      <SignInScreen loading={setIsLoading} loginWithGoogle={handleSignIn} />
    </div>
  );
};

export default Login;
