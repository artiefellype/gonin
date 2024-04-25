import { useUserContext } from "@/context/appContext";
import Image from "next/image";
import React, { useEffect } from "react";
import { FcGoogle } from "react-icons/fc";
import { BetaFlag } from "../utils/BetaFlag";

interface SignInScreenProps {
  loginWithGoogle: () => void;
  loading: (value: boolean) => void;
}
const SignInScreen = ({ loginWithGoogle, loading }: SignInScreenProps) => {
  return (
    <div className="w-screen h-screen flex justify-center items-center bg-slate-200 relative">
      <img
          src={"/imgs/fivechan_logo.png"}
          alt={"background"}
          className="bg-center w-24 h-24 absolute top-4 left-4 lg:hidden"
        />
      <div className=" w-full max-w-sm lg:max-w-none lg:w-2/5 h-screen flex md:flex-col justify-center items-center text-slate-900 relative">
      
        <div className="flex flex-col w-full lg:w-1/2">
          <div className="w-full pb-5 flex justify-center lg:justify-start">
            <h1 className="text-3xl font-bold ">Login</h1>

          </div>
          <div className="w-full flex justify-center items-start flex-col gap-3 relative">
            <button
              onClick={() => {
                loginWithGoogle();
                loading(true);
              }}
              className="border-red-500 lg:max-w-sm border-solid border-2 w-full h-11 rounded-3xl flex flex-row justify-center items-center gap-2 hover:text-slate-200 hover:bg-red-500 transition-all duration-400 ease-in-out"
            >
              {" "}
              <FcGoogle className="mb-[1px] bg-slate-200 rounded-full" />{" "}
              Continue com Google
            </button>
            <BetaFlag />
          </div>
        </div>
      </div>
      <div className=" w-3/5 h-screen hidden lg:flex  flex-col justify-center items-center relative">
        <img
          src={"/imgs/fivechan_logo.png"}
          alt={"background"}
          className="bg-center w-48 h-48 absolute"
        />
        <img
          src={"/imgs/background2.jpg"}
          alt={"background"}
          className="bg-center w-full h-full"
        />
      </div>
    </div>
  );
};

export default SignInScreen;