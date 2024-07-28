import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { BetaFlag } from "../../atoms/BetaFlag";
import { useUserContext } from "@/context";
import Link from "next/link";
import { useRouter } from "next/router";
import { AuthTitle } from "@/components/atoms/AuthTitle";
import { AuthForm } from "@/components/organisms/AuthForm";

export const SignUpScreen = ({}) => {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { signUpWithEmail } = useUserContext();
  const [loginLoading, setLoginLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }
    setLoginLoading(true);
    try {
      await signUpWithEmail(userName, email, password);
      setIsRegistered(true);
      setTimeout(() => {
        router.push("/login");
      }, 1000);
    } catch (error: any) {
      setError("Erro ao registrar: " + error.message);
    }
    setLoginLoading(false);
  };

  const signUpInputs = [
    {
        title: "Nome de usuário",
        type: "text",
        value: userName,
        onChange: (e: any) => setUserName(e.target.value),
        required: true,
      },
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
    {
      title: "Confirme sua senha",
      type: "password",
      value: confirmPassword,
      onChange: (e: any) => setConfirmPassword(e.target.value),
      required: true,
      style: {marginBottom: '24px'}
    },
    
  ];

  return (
    <div className="w-screen h-screen flex flex-row-reverse justify-center items-center bg-slate-200 relative px-2">
      <img
        src={"/imgs/fivechan_logo.png"}
        alt={"background"}
        className="bg-center w-12 h-12 absolute top-4 left-4 lg:hidden "
      />
      <div className=" w-full max-w-[320px] lg:max-w-none lg:w-2/5 h-screen flex md:flex-col justify-center items-center text-slate-900 relative ">
        <div className="flex flex-col w-full lg:w-1/2">
          <AuthTitle
            title="Registre-se"
            description="Preencha os campos abaixo para criar sua conta."
          />

          <div className="w-full flex justify-center items-start flex-col gap-3 relative">
            <AuthForm
              formTitle={"Registre-se"}
              handleSubmit={handleSubmit}
              inputArray={signUpInputs}
              error={error}
              OnSubmitLoading={loginLoading}
              isRegistered={isRegistered}
            />
            <div className="w-full flex justify-end">
              <p className="text-[12px] p-2">
                Já possui uma conta?{" "}
                <Link
                  href="/login"
                  className="text-blue-600 hover:cursor-pointer hover:text-blue-800"
                >
                  Login
                </Link>
              </p>
            </div>
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
