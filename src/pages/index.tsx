import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import {
  FaArrowRight,
  FaRegLightbulb,
} from "react-icons/fa6";

const topicCards = [
  {
    title: "Espaço livre",
    description: "Abra conversas sem precisar encaixar tudo em uma categoria perfeita.",
    image: "/imgs/topics/Group discussion-pana.svg",
  },
  {
    title: "Feedback do beta",
    description: "Aponte bugs, sugira melhorias e participe da evolução do produto.",
    image: "/imgs/topics/Feedback-pana.svg",
  },
  {
    title: "Perguntas abertas",
    description: "Teste uma ideia, peça opinião ou descubra como outras pessoas pensam.",
    image: "/imgs/topics/curiosity child-rafiki.svg",
  },
  {
    title: "Recomendações",
    description: "Peça indicações, compartilhe achados e transforme gosto pessoal em conversa.",
    image: "/imgs/topics/Book lover-bro.svg",
  },
];

const highlights = [
  {
    title: "Menos feed, mais escolha",
    text: "Você entra pelos tópicos que quer explorar, não por um algoritmo decidindo a próxima conversa.",
    image: "/imgs/topics/World Press Freedom Day-cuate.svg",
  },
  {
    title: "Um lugar para testar ideias",
    text: "Publique uma pergunta, uma opinião ou uma descoberta sem precisar transformar tudo em post perfeito.",
    image: "/imgs/topics/curiosity child-rafiki.svg",
  },
  {
    title: "Boas conversas podem voltar",
    text: "Tópicos, comentários e feedback deixam cada assunto mais fácil de retomar quando alguém tiver algo novo a dizer.",
    image: "/imgs/topics/Group discussion-pana.svg",
  },
];

export default function LandPage() {
  return (
    <>
      <Head>
        <title>Gonin | Fórum simples para assuntos diversos</title>
        <meta
          name="description"
          content="Gonin é um fórum simples e diverso para começar conversas, explorar tópicos e participar sem complicação."
        />
      </Head>
      <main className="min-h-screen bg-background text-primary">
        <header className="sticky top-0 z-40 w-full border-b border-slate-300/70 bg-whiteColor/95 backdrop-blur">
          <div className="mx-auto flex h-[72px] w-full max-w-7xl items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/imgs/fivechan_logo.png"
                alt="Gonin"
                width={40}
                height={40}
                priority
              />
              <span className="text-3xl font-extrabold">GONIN</span>
            </Link>
            <nav className="flex items-center gap-2 text-sm font-semibold">
              <Link
                href="/login"
                className="rounded-full px-4 py-2 transition-colors hover:bg-secondary"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-accent px-4 py-2 text-whiteColor transition-colors hover:bg-primary"
              >
                Criar conta
              </Link>
            </nav>
          </div>
        </header>

        <section className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-4 py-12 lg:min-h-[calc(100vh-72px)] lg:grid-cols-[0.92fr_1.08fr] lg:py-14">
          <div className="flex max-w-2xl flex-col gap-6 gonin-fade-up">
            <span className="w-fit rounded-full bg-whiteColor px-3 py-1 text-xs font-bold uppercase tracking-normal shadow-sm">
              Fórum aberto em beta
            </span>
            <div className="flex flex-col gap-4">
              <h1 className="text-3xl font-extrabold leading-tight md:text-5xl">
                Um fórum para quem quer conversar, não decifrar menus.
              </h1>
              <p className="max-w-xl text-base font-light leading-7 text-slate-700 md:text-lg">
                O Gonin junta tópicos variados em uma experiência direta:
                encontre um assunto, publique sua ideia e continue a conversa
                sem complicação.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="flex h-11 items-center justify-center gap-2 rounded-full bg-accent px-6 text-base font-semibold text-whiteColor transition-colors hover:bg-primary"
              >
                Entrar no fórum
                <FaArrowRight size={14} />
              </Link>
              <Link
                href="/register"
                className="flex h-11 items-center justify-center rounded-full border-2 border-accent px-6 text-base font-semibold text-accent transition-colors hover:bg-accentSoft"
              >
                Criar conta
              </Link>
            </div>
            <div className="grid max-w-xl grid-cols-1 gap-3 pt-2 sm:grid-cols-3">
              <div className="rounded-md bg-whiteColor p-3 shadow-sm">
                <p className="text-lg font-extrabold">Diverso</p>
                <p className="text-xs font-light text-slate-600">
                  assuntos para gostos diferentes
                </p>
              </div>
              <div className="rounded-md bg-whiteColor p-3 shadow-sm">
                <p className="text-lg font-extrabold">Simples</p>
                <p className="text-xs font-light text-slate-600">
                  fluxo pensado para novos usuários
                </p>
              </div>
              <div className="rounded-md bg-whiteColor p-3 shadow-sm">
                <p className="text-lg font-extrabold">Aberto</p>
                <p className="text-xs font-light text-slate-600">
                  feedback faz parte do produto
                </p>
              </div>
            </div>
          </div>

          <div className="flex min-h-[320px] items-center justify-center gonin-fade-up gonin-delay-1 lg:min-h-[520px] lg:justify-end">
            <Image
              src="/imgs/topics/Welcome aboard-pana.svg"
              alt="Boas-vindas ao Gonin"
              width={500}
              height={500}
              priority
              className="gonin-float h-auto w-full max-w-[360px] md:max-w-[430px] lg:max-w-[500px]"
            />
          </div>
        </section>

        <section className="bg-whiteColor">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-4 px-4 py-14 md:grid-cols-3">
            {highlights.map(({ image, title, text }, index) => (
              <article
                key={title}
                className="gonin-reveal rounded-md bg-white p-5 shadow-sm transition-transform duration-300 hover:-translate-y-1"
                style={{ animationDelay: `${index * 110}ms` }}
              >
                <div className="mb-4 flex h-28 items-center justify-center">
                  <Image
                    src={image}
                    alt={title}
                    width={132}
                    height={132}
                    className="h-full w-auto object-contain"
                  />
                </div>
                <h2 className="text-lg font-bold">{title}</h2>
                <p className="mt-2 text-sm font-light leading-6 text-slate-600">
                  {text}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 py-16">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div className="max-w-2xl gonin-reveal">
              <p className="text-sm font-bold uppercase text-slate-600">
                Jeitos de usar
              </p>
              <h2 className="mt-2 text-3xl font-extrabold leading-tight">
                O Gonin funciona melhor quando a conversa ainda está nascendo.
              </h2>
            </div>
            <p className="max-w-md text-sm font-light leading-6 text-slate-700 gonin-reveal gonin-delay-1">
              Em vez de exigir um post pronto, o fórum abre espaço para
              perguntas, rascunhos de ideia, recomendações e feedback direto.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {topicCards.map((topic, index) => (
              <article
                key={topic.title}
                className="gonin-reveal rounded-lg bg-whiteColor p-5 shadow-sm transition-transform duration-300 hover:-translate-y-1"
                style={{ animationDelay: `${index * 90}ms` }}
              >
                <div className="mb-4 flex h-24 items-center justify-center">
                  <Image
                    src={topic.image}
                    alt={topic.title}
                    width={112}
                    height={112}
                  />
                </div>
                <h3 className="text-lg font-bold">{topic.title}</h3>
                <p className="mt-2 text-sm font-light leading-6 text-slate-600">
                  {topic.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-primary text-whiteColor">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-8 px-4 py-14 lg:grid-cols-[1fr_0.75fr]">
            <div className="gonin-reveal">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-200">
                <FaRegLightbulb />
                Projeto em evolução
              </div>
              <h2 className="text-3xl font-extrabold leading-tight">
                Entre agora e ajude a definir o que um fórum moderno deve ser.
              </h2>
              <p className="mt-4 max-w-2xl text-base font-light leading-7 text-slate-200">
                O Gonin ainda está em beta. Isso significa que cada sugestão,
                bug reportado e conversa criada ajuda a lapidar a experiência.
              </p>
            </div>
            <div className="flex flex-col gap-3 rounded-lg bg-whiteColor p-5 text-primary shadow-lg gonin-reveal gonin-delay-1">
              <Link
                href="/register"
                className="flex h-10 items-center justify-center rounded-full bg-accent px-5 text-base font-semibold text-whiteColor transition-colors hover:bg-primary"
              >
                Criar conta
              </Link>
              <Link
                href="/login"
                className="flex h-10 items-center justify-center rounded-full border-2 border-accent px-5 text-base font-semibold text-accent transition-colors hover:bg-accentSoft"
              >
                Já tenho acesso
              </Link>
            </div>
          </div>
        </section>

        <footer className="bg-whiteColor">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-8 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/imgs/fivechan_logo.png"
                alt="Gonin"
                width={36}
                height={36}
              />
              <span className="text-2xl font-extrabold">GONIN</span>
            </div>
            <div className="flex gap-4 text-sm font-semibold">
              <Link href="/login" className="hover:text-slate-600">
                Login
              </Link>
              <Link href="/register" className="hover:text-slate-600">
                Criar conta
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
