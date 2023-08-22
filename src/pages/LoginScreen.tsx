import React from "react";

import { userContext } from "@/context/appContext";
import { auth, entrarComGoogle, logout } from "@/firebase/authentication";
import { fireApp } from "@/firebase/firebase";
import Forum from "@/pages/forum";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import SignInScreen from "@/components/SignInScreen";
import Image from "next/image";

const Login = () => {
  const { user, setUser } = useContext(userContext);
  const [isLoading, setIsloading] = useState(false);
  const [isLogged, setIsLogged] = useState(false);
  const router = useRouter();

  const setUserLogged = async () => {
    setIsloading(true);
    auth.onAuthStateChanged(
      (user) => {
        setUser({
          isAuth: true,
          user: user,
        });

        if (user != null) {
          setIsLogged(true);
        } else setIsLogged(false);
        setIsloading(false);
      },
      (err) => {
        setIsloading(false);
      }
    );
  };

  useEffect(() => {
    setUserLogged();
  }, []);

  return (
    <>
      {isLoading ? (
        <div className="bg-animb bg-center w-screen h-screen flex justify-center items-center">
          <Image
            className="animate-bounce duration-3000 ease-in-out infinite"
            src={"/imgs/fivechan_logo.png"}
            alt={"Logo loading"}
            width={100}
            height={100}
          />
        </div>
      ) : (
        <div>
          {isLogged ? (
            <Forum />
          ) : (
            <SignInScreen
              loginWithGoogle={entrarComGoogle}
              loading={setIsloading}
            />
          )}
        </div>
      )}
    </>
  );
};

export default Login;
