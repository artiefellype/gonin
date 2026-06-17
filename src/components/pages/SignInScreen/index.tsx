import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { BetaFlag } from "../../atoms/BetaFlag";
import { useUserContext } from "@/context";
import Link from "next/link";
import Image from "next/image";
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
        setError("Email ou senha incorretos. Verifique e tente novamente.");
      } else {
        setError("Erro ao fazer login: " + error.message);
      }
    }
    setLoginLoading(false);
  };

  const signInInputs = [
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
    <div className="flex min-h-screen w-screen justify-center bg-background px-4 text-primary">
      <div className="grid min-h-screen w-full max-w-7xl grid-cols-1 items-center gap-8 py-8 lg:grid-cols-[0.9fr_1.1fr] lg:py-0">
        <section className="flex justify-center lg:justify-start">
          <div className="w-full max-w-[380px] rounded-lg bg-whiteColor p-6 shadow-lg md:p-8">
            <Link href="/" className="mb-10 flex items-center gap-3">
              <Image
                src="/imgs/fivechan_logo.png"
                alt="Gonin"
                width={40}
                height={40}
                priority
              />
              <span className="text-3xl font-extrabold">GONIN</span>
            </Link>

            <AuthTitle title="Explore" description="Entre para continuar." />

            <div className="flex w-full flex-col items-start gap-3">
              <AuthForm
                formTitle="Login"
                handleSubmit={handleSubmit}
                inputArray={signInInputs}
                error={error}
                OnSubmitLoading={loginLoading}
              />
              <div className="flex w-full max-w-[320px] justify-end">
                <p className="px-2 text-[12px]">
                  Não tem uma conta?{" "}
                  <Link
                    href="/register"
                    className="text-accent hover:cursor-pointer hover:text-primary"
                  >
                    Registre-se
                  </Link>
                </p>
              </div>
              <div className="flex w-full max-w-[320px] flex-row items-center justify-center">
                <div className="h-[1px] w-full bg-slate-400"></div>
                <div className="p-2 text-sm text-slate-600">ou</div>
                <div className="h-[1px] w-full bg-slate-400"></div>
              </div>
              <button
                onClick={() => {
                  loginWithGoogle();
                  loading(true);
                }}
                className="flex h-10 w-full max-w-[320px] flex-row items-center justify-center gap-2 rounded-full border-2 border-solid border-slate-300 bg-white text-base font-semibold transition-all duration-400 ease-in-out hover:border-accent hover:bg-accentSoft"
              >
                <FcGoogle className="mb-[1px] rounded-full bg-slate-100" />
                Continue com o Google
              </button>
            </div>
          </div>
        </section>

        <section className="hidden h-full min-h-screen items-center justify-center lg:flex">
          <div className="grid w-full max-w-2xl gap-4">
            <div className="rounded-lg bg-whiteColor p-6 shadow-lg">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <p className="text-sm font-light text-slate-600">
                    Fórum aberto
                  </p>
                  <h2 className="text-3xl font-extrabold">
                    Conversas sem complicação.
                  </h2>
                </div>
                <Image
                  src="/imgs/topics/Welcome aboard-pana.svg"
                  alt="Boas-vindas ao Gonin"
                  width={112}
                  height={112}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-md bg-white p-4">
                  <p className="text-xs font-light text-slate-600">Tópicos</p>
                  <p className="text-lg font-bold">Diversos</p>
                </div>
                <div className="rounded-md bg-white p-4">
                  <p className="text-xs font-light text-slate-600">Entrada</p>
                  <p className="text-lg font-bold">Fácil</p>
                </div>
                <div className="rounded-md bg-white p-4">
                  <p className="text-xs font-light text-slate-600">Status</p>
                  <p className="text-lg font-bold">Beta</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-3">
                <Image
                  src="/imgs/default_perfil.jpg"
                  alt="Perfil"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div>
                  <p className="text-base font-bold">Novo usuário</p>
                  <p className="text-xs font-light text-slate-600">
                    agora mesmo
                  </p>
                </div>
              </div>
              <h3 className="mb-2 text-base font-semibold">
                Qual assunto você quer abrir hoje?
              </h3>
              <p className="text-sm font-light leading-6 text-slate-600">
                Compartilhe uma ideia, peça recomendações, participe de um
                tópico ou ajude o Gonin a melhorar com feedback.
              </p>
            </div>
          </div>
        </section>
      </div>
      <BetaFlag />
    </div>
  );
};
