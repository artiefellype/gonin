import React, { useState } from "react";
import { BetaFlag } from "../../atoms/BetaFlag";
import { useUserContext } from "@/context";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import { AuthTitle } from "@/components/atoms/AuthTitle";
import { AuthForm } from "@/components/organisms/AuthForm";

export const SignUpScreen = () => {
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
      setError("As senhas não coincidem.");
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
    },
  ];

  return (
    <div className="flex min-h-[100svh] w-full justify-center bg-transparent px-3 text-primary sm:px-4">
      <div className="grid min-h-[100svh] w-full max-w-7xl grid-cols-1 items-center gap-8 py-6 sm:py-8 lg:grid-cols-[1.1fr_0.9fr] lg:py-0">
        <section className="hidden h-full min-h-[100svh] items-center justify-center lg:flex">
          <div className="grid w-full max-w-2xl gap-4">
            <div className="rounded-2xl border border-borderDark bg-panel/95 p-6 shadow-lg">
              <div className="mb-6 flex items-start justify-between gap-6">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-accent">
                    Comece pelo seu perfil
                  </p>
                  <h2 className="text-2xl font-semibold">
                    Crie sua conta e participe das conversas.
                  </h2>
                </div>
                <Image
                  src="/imgs/topics/Active Support-pana.svg"
                  alt="Participação no Gonin"
                  width={128}
                  height={128}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-borderDark bg-secondary p-4">
                  <p className="text-xs font-medium text-mutedText">Perfil</p>
                  <p className="text-lg font-bold">Seu nome</p>
                </div>
                <div className="rounded-xl border border-borderDark bg-secondary p-4">
                  <p className="text-xs font-medium text-mutedText">Acesso</p>
                  <p className="text-lg font-bold">Email</p>
                </div>
                <div className="rounded-xl border border-borderDark bg-secondary p-4">
                  <p className="text-xs font-medium text-mutedText">Fórum</p>
                  <p className="text-lg font-bold">Tópicos</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-borderDark bg-panel p-4 shadow-lg">
                <Image
                  src="/imgs/topics/Group discussion-pana.svg"
                  alt="Discussão em grupo"
                  width={96}
                  height={96}
                  className="mx-auto mb-3"
                />
                <h3 className="text-base font-bold">Converse</h3>
                <p className="mt-1 text-sm font-medium leading-6 text-mutedText">
                  Encontre pessoas falando sobre assuntos variados.
                </p>
              </div>
              <div className="rounded-lg border border-borderDark bg-panel p-4 shadow-lg">
                <Image
                  src="/imgs/topics/Feedback-pana.svg"
                  alt="Feedback"
                  width={96}
                  height={96}
                  className="mx-auto mb-3"
                />
                <h3 className="text-base font-bold">Contribua</h3>
                <p className="mt-1 text-sm font-medium leading-6 text-mutedText">
                  Reporte bugs, sugira melhorias e ajude o beta a evoluir.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex justify-center lg:justify-end">
          <div className="w-full max-w-[390px] rounded-2xl border border-borderDark bg-panel/95 p-5 shadow-lg sm:p-6 md:p-8">
            <Link href="/" className="mb-8 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-accent text-lg font-black text-background">
                G
              </span>
              <span className="text-2xl font-semibold">GONIN</span>
            </Link>

            <AuthTitle
              title="Registre-se"
              description="Preencha seus dados para criar uma conta."
            />

            <div className="flex w-full flex-col items-start gap-3">
              <AuthForm
                formTitle="Criar conta"
                handleSubmit={handleSubmit}
                inputArray={signUpInputs}
                error={error}
                OnSubmitLoading={loginLoading}
                isRegistered={isRegistered}
              />
              {isRegistered && (
                <p className="w-full max-w-[320px] px-2 text-xs font-medium text-accent">
                  Conta criada. Redirecionando para o login...
                </p>
              )}
              <div className="flex w-full max-w-[320px] justify-end">
                <p className="px-2 text-[12px] text-mutedText">
                  Já possui uma conta?{" "}
                  <Link
                    href="/login"
                    className="font-bold text-accent hover:cursor-pointer hover:text-primary"
                  >
                    Login
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
      <BetaFlag />
    </div>
  );
};
