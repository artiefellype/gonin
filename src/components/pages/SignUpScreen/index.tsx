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
    <div className="flex min-h-screen w-screen justify-center bg-background px-4 text-primary">
      <div className="grid min-h-screen w-full max-w-7xl grid-cols-1 items-center gap-8 py-8 lg:grid-cols-[1.1fr_0.9fr] lg:py-0">
        <section className="hidden h-full min-h-screen items-center justify-center lg:flex">
          <div className="grid w-full max-w-2xl gap-4">
            <div className="rounded-lg bg-whiteColor p-6 shadow-lg">
              <div className="mb-6 flex items-start justify-between gap-6">
                <div>
                  <p className="text-sm font-light text-slate-600">
                    Comece pelo seu perfil
                  </p>
                  <h2 className="text-3xl font-extrabold">
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
                <div className="rounded-md bg-white p-4">
                  <p className="text-xs font-light text-slate-600">Perfil</p>
                  <p className="text-lg font-bold">Seu nome</p>
                </div>
                <div className="rounded-md bg-white p-4">
                  <p className="text-xs font-light text-slate-600">Acesso</p>
                  <p className="text-lg font-bold">Email</p>
                </div>
                <div className="rounded-md bg-white p-4">
                  <p className="text-xs font-light text-slate-600">Fórum</p>
                  <p className="text-lg font-bold">Tópicos</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-white p-4 shadow-sm">
                <Image
                  src="/imgs/topics/Group discussion-pana.svg"
                  alt="Discussão em grupo"
                  width={96}
                  height={96}
                  className="mx-auto mb-3"
                />
                <h3 className="text-base font-bold">Converse</h3>
                <p className="mt-1 text-sm font-light leading-6 text-slate-600">
                  Encontre pessoas falando sobre assuntos variados.
                </p>
              </div>
              <div className="rounded-lg bg-white p-4 shadow-sm">
                <Image
                  src="/imgs/topics/Feedback-pana.svg"
                  alt="Feedback"
                  width={96}
                  height={96}
                  className="mx-auto mb-3"
                />
                <h3 className="text-base font-bold">Contribua</h3>
                <p className="mt-1 text-sm font-light leading-6 text-slate-600">
                  Reporte bugs, sugira melhorias e ajude o beta a evoluir.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex justify-center lg:justify-end">
          <div className="w-full max-w-[380px] rounded-lg bg-whiteColor p-6 shadow-lg md:p-8">
            <Link href="/" className="mb-8 flex items-center gap-3">
              <Image
                src="/imgs/fivechan_logo.png"
                alt="Gonin"
                width={40}
                height={40}
                priority
              />
              <span className="text-3xl font-extrabold">GONIN</span>
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
                <p className="w-full max-w-[320px] px-2 text-xs font-medium text-green-700">
                  Conta criada. Redirecionando para o login...
                </p>
              )}
              <div className="flex w-full max-w-[320px] justify-end">
                <p className="px-2 text-[12px]">
                  Já possui uma conta?{" "}
                  <Link
                    href="/login"
                    className="text-accent hover:cursor-pointer hover:text-primary"
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
