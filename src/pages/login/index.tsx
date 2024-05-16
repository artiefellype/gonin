import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useUserContext } from "@/context";
import SignInScreen from "@/components/SignIn";
import Image from "next/image";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";

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
    <div className="bg-secondary bg-center w-screen h-screen flex justify-center items-center">
      <Image
        className="animate-bounce duration-3000 ease-in-out infinite"
        src={"/imgs/fivechan_logo.png"}
        alt={"Logo loading"}
        width={100}
        height={100}
      />
    </div>
  ) : (
    <SignInScreen loading={setIsLoading} loginWithGoogle={handleSignIn} />
  );
};

export default Login;
