import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { BetaFlag } from "../../atoms/BetaFlag";
import { useUserContext } from "@/context";
import Link from "next/link";
import { AuthForm } from "@/components/organisms/AuthForm";
import { AuthTitle } from "@/components/atoms/AuthTitle";

export interface SignInScreenProps {
  loginWithGoogle: () => void;
  loading: (value: boolean) => void;
}
export const SignInScreen = ({
  loginWithGoogle,
  loading,
}: SignInScreenProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signInWithEmail } = useUserContext();
  const [loginLoading, setLoginLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoginLoading(true);
    try {
      await signInWithEmail(email, password);
    } catch (error: any) {
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        setError("Email ou senha incorretos.Verifique e tente novamente.");
      } else {
        setError("Erro ao fazer login: " + error.message);
      }
    }
    setLoginLoading(false);
  };

  const signInIputs = [
    {
      title: "Email",
      type: "email",
      value: email,
      onChange: (e: any) => setEmail(e.target.value),
      required: true,
    },
    {
      title: "Senha",
      type: "password",
      value: password,
      onChange: (e: any) => setPassword(e.target.value),
      required: true,
    },
  ];

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-slate-200 relative px-2">
      <img
        src={"/imgs/fivechan_logo.png"}
        alt={"background"}
        className="bg-center w-12 h-12 absolute top-4 left-4 lg:hidden"
      />
      <div className=" w-full max-w-[320px] lg:max-w-none lg:w-2/5 h-screen flex md:flex-col justify-center items-center text-slate-900 relative">
        <div className="flex flex-col w-full lg:w-1/2">
          <AuthTitle title="Explore" description="Descubra o Gonin agora" />

          <div className="w-full flex justify-center items-start flex-col gap-3 relative">
            <AuthForm
              formTitle={"Login"}
              handleSubmit={handleSubmit}
              inputArray={signInIputs}
              error={error}
              OnSubmitLoading={loginLoading}
            />
            <div className="w-full flex justify-end">
              <p className="text-[12px] px-2">
                Não tem uma conta?{" "}
                <Link
                  href="/register"
                  className="text-blue-600 hover:cursor-pointer hover:text-blue-800"
                >
                  Registre-se
                </Link>
              </p>
            </div>
            <div className="w-full flex flex-row justify-center items-center lg:max-w-[320px]">
              <div className="h-[1px] w-full bg-slate-600"></div>
              <div className="p-2 text-slate-600">ou</div>
              <div className="h-[1px] w-full bg-slate-600"></div>
            </div>
            <button
              onClick={() => {
                loginWithGoogle();
                loading(true);
              }}
              className="border-red-500 text-base lg:max-w-[320px] border-solid border-2 w-full h-11 rounded-3xl flex flex-row justify-center items-center gap-2 hover:text-slate-200 hover:bg-red-500 transition-all duration-400 ease-in-out"
            >
              {" "}
              <FcGoogle className="mb-[1px] bg-slate-200 rounded-full" />{" "}
              Continue com o Google
            </button>
            <BetaFlag />
          </div>
        </div>
      </div>
      <div className=" w-3/5 h-screen hidden lg:flex  flex-col justify-center items-center relative">
        <img
          src={"/imgs/fivechan_logo.png"}
          alt={"background"}
          className="bg-center w-72 h-72 absolute"
        />
      </div>
    </div>
  );
};
