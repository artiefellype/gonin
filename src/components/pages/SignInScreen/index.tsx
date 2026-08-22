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
    <div className="flex min-h-[100svh] w-full justify-center bg-transparent px-3 text-primary sm:px-4">
      <div className="grid min-h-[100svh] w-full max-w-7xl grid-cols-1 items-center gap-8 py-6 sm:py-8 lg:grid-cols-[0.9fr_1.1fr] lg:py-0">
        <section className="flex justify-center lg:justify-start">
          <div className="w-full max-w-[390px] rounded-2xl border border-borderDark bg-panel/95 p-5 shadow-lg sm:p-6 md:p-8">
            <Link href="/" className="mb-8 flex items-center gap-3 sm:mb-10">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-accent text-lg font-black text-background">
                G
              </span>
              <span className="text-2xl font-semibold">GONIN</span>
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
                <p className="px-2 text-[12px] text-mutedText">
                  Não tem uma conta?{" "}
                  <Link
                    href="/register"
                    className="font-bold text-accent hover:cursor-pointer hover:text-primary"
                  >
                    Registre-se
                  </Link>
                </p>
              </div>
              <div className="flex w-full max-w-[320px] flex-row items-center justify-center">
                <div className="h-[1px] w-full bg-borderDark"></div>
                <div className="p-2 text-sm text-mutedText">ou</div>
                <div className="h-[1px] w-full bg-borderDark"></div>
              </div>
              <button
                onClick={() => {
                  loginWithGoogle();
                  loading(true);
                }}
                className="flex h-11 w-full max-w-[320px] flex-row items-center justify-center gap-2 rounded-lg border border-borderDark bg-secondary text-base font-bold text-primary transition-all duration-300 ease-in-out hover:border-accent hover:bg-accentSoft"
              >
                <FcGoogle className="mb-[1px] rounded-full bg-white" />
                Continue com o Google
              </button>
            </div>
          </div>
        </section>

        <section className="hidden h-full min-h-[100svh] items-center justify-center lg:flex">
          <div className="grid w-full max-w-2xl gap-4">
            <div className="rounded-2xl border border-borderDark bg-panel/95 p-6 shadow-lg">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-accent">
                    Fórum aberto
                  </p>
                  <h2 className="text-2xl font-semibold">
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
                <div className="rounded-xl border border-borderDark bg-secondary p-4">
                  <p className="text-xs font-medium text-mutedText">Tópicos</p>
                  <p className="text-lg font-bold">Diversos</p>
                </div>
                <div className="rounded-xl border border-borderDark bg-secondary p-4">
                  <p className="text-xs font-medium text-mutedText">Entrada</p>
                  <p className="text-lg font-bold">Fácil</p>
                </div>
                <div className="rounded-xl border border-borderDark bg-secondary p-4">
                  <p className="text-xs font-medium text-mutedText">Status</p>
                  <p className="text-lg font-bold">Beta</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-borderDark bg-panel p-4 shadow-lg">
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
                  <p className="text-xs font-medium text-mutedText">
                    agora mesmo
                  </p>
                </div>
              </div>
              <h3 className="mb-2 text-base font-semibold">
                Qual assunto você quer abrir hoje?
              </h3>
              <p className="text-sm font-medium leading-6 text-mutedText">
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
