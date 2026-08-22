import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import {
  FaArrowRight,
  FaBookmark,
  FaCirclePlay,
  FaComments,
  FaCompass,
  FaPeopleGroup,
  FaRetweet,
  FaShareNodes,
  FaUserGroup,
  FaVideo,
} from "react-icons/fa6";

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://gonin.vercel.app"
).replace(/\/$/, "");

const features = [
  {
    icon: FaCompass,
    title: "Feed por contexto",
    text: "Veja tudo ou filtre conversas de amigos.",
  },
  {
    icon: FaPeopleGroup,
    title: "Comunidades",
    text: "Crie ou participe de espaços por tema.",
  },
  {
    icon: FaShareNodes,
    title: "Reposts",
    text: "Compartilhe posts com comentário próprio.",
  },
  {
    icon: FaBookmark,
    title: "Salvos",
    text: "Guarde posts para voltar depois.",
  },
  {
    icon: FaVideo,
    title: "Mídia",
    text: "Publique imagens e vídeos no mesmo fluxo.",
  },
  {
    icon: FaUserGroup,
    title: "Amigos",
    text: "Conexões diretas, sem lógica de seguidores.",
  },
];

const communities = [
  {
    title: "Tecnologia",
    image: "/imgs/topics/Cool robot-bro.svg",
  },
  {
    title: "Games",
    image: "/imgs/topics/Horror video game-amico.svg",
  },
  {
    title: "Música e Arte",
    image: "/imgs/topics/Playing Music-bro.svg",
  },
];

const footerLinks = [
  {
    title: "Produto",
    links: ["Comunidades", "Feed", "Perfis"],
  },
  {
    title: "Conta",
    links: ["Login", "Criar conta"],
  },
  {
    title: "Projeto",
    links: ["Beta", "Feedbacks"],
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
        <meta
          name="robots"
          content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"
        />
        <link rel="canonical" href={`${siteUrl}/`} />
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content="Gonin | Fórum simples para assuntos diversos"
        />
        <meta
          property="og:description"
          content="Comece conversas, explore comunidades e participe de um fórum simples, direto e em beta."
        />
        <meta property="og:url" content={`${siteUrl}/`} />
        <meta name="twitter:card" content="summary" />
      </Head>

      <main className="min-h-[100svh] overflow-x-hidden bg-transparent text-primary">
        <header className="sticky top-2 z-40 px-3 sm:top-3 sm:px-4">
          <div className="mx-auto flex h-12 w-full max-w-6xl items-center justify-between rounded-full border border-borderDark bg-panel/90 px-3 shadow-2xl backdrop-blur-xl">
            <Link href="/" className="flex items-center gap-2 pl-1">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-accent text-sm font-black text-background">
                G
              </span>
              <span className="text-sm font-semibold">Gonin</span>
            </Link>

            <nav className="hidden items-center gap-6 text-sm font-medium text-mutedText md:flex">
              <a href="#recursos" className="transition-colors hover:text-primary">
                Recursos
              </a>
              <a
                href="#comunidades"
                className="transition-colors hover:text-primary"
              >
                Comunidades
              </a>
              <a href="#sobre" className="transition-colors hover:text-primary">
                Sobre
              </a>
            </nav>

            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="hidden rounded-full border border-borderDark px-4 py-2 text-xs font-semibold text-primary transition-colors hover:border-accent md:block"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-background transition-colors hover:bg-accent"
              >
                Criar conta
              </Link>
            </div>
          </div>
        </header>

        <section className="relative overflow-hidden px-3 pt-16 sm:px-4 sm:pt-20">
          <div className="absolute inset-x-0 top-0 -z-0 h-[460px] bg-[radial-gradient(circle_at_50%_0%,rgba(130,171,255,0.18),transparent_58%)] sm:h-[520px]" />
          <div className="relative mx-auto w-full max-w-6xl">
            <div className="max-w-3xl gonin-fade-up">
              <span className="inline-flex rounded-full border border-borderDark bg-panel px-3 py-1 text-xs font-semibold text-accent">
                Beta aberto
              </span>
              <h1 className="mt-5 max-w-3xl text-3xl font-semibold leading-[1.08] tracking-normal sm:text-4xl md:text-6xl">
                Converse em comunidades sem perder o ritmo do feed.
              </h1>
              <p className="mt-5 max-w-2xl text-sm font-medium leading-6 text-mutedText sm:text-base md:text-lg md:leading-7">
                O Gonin junta posts, amigos e comunidades em uma experiência
                direta para publicar, responder e descobrir assuntos.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className="flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-bold text-background transition-colors hover:bg-accent"
                >
                  Criar conta
                  <FaArrowRight size={13} />
                </Link>
                <Link
                  href="/login"
                  className="flex h-11 items-center justify-center gap-2 rounded-full border border-borderDark px-6 text-sm font-semibold text-primary transition-colors hover:border-accent"
                >
                  <FaCirclePlay size={14} />
                  Entrar
                </Link>
              </div>
            </div>

            <div className="relative mt-10 min-h-[320px] gonin-reveal gonin-delay-1 sm:mt-12 sm:min-h-[420px]">
              <section className="relative z-10 overflow-hidden rounded-2xl border border-borderDark bg-panel/95 shadow-2xl">
                <div className="flex h-12 items-center justify-between border-b border-borderDark px-4">
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-accent text-background">
                      G
                    </span>
                    Gonin
                  </div>
                  <div className="hidden items-center gap-5 text-xs font-medium text-mutedText md:flex">
                    <span>Para você</span>
                    <span>Amigos</span>
                    <span>Comunidades</span>
                  </div>
                </div>

                <div className="grid min-h-[360px] grid-cols-1 lg:grid-cols-[1fr_320px]">
                  <div className="border-borderDark p-4 lg:border-r">
                    <div className="mb-4 rounded-xl border border-borderDark bg-background/80 p-4">
                      <p className="text-sm text-mutedText">
                        Compartilhe uma ideia no Gonin
                      </p>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex gap-2 text-accent">
                          <FaVideo />
                          <FaComments />
                        </div>
                        <span className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-background">
                          Postar
                        </span>
                      </div>
                    </div>

                    <article className="rounded-xl border border-borderDark bg-panel p-4">
                      <div className="flex items-center gap-3">
                        <Image
                          src="/imgs/default_perfil.jpg"
                          alt="Perfil"
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-sm font-semibold">Lia</p>
                          <p className="text-xs text-mutedText">
                            em Tecnologia
                          </p>
                        </div>
                      </div>
                      <h2 className="mt-4 text-lg font-semibold sm:text-xl">
                        Como vocês organizam ideias de projetos?
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-mutedText">
                        Estou testando um fluxo novo e queria comparar com
                        outras pessoas.
                      </p>
                      <div className="mt-4 h-28 rounded-xl bg-blueSoft" />
                      <div className="mt-4 flex gap-5 text-xs font-semibold text-mutedText">
                        <span>24 respostas</span>
                        <span className="flex items-center gap-1">
                          <FaRetweet />
                          8 reposts
                        </span>
                      </div>
                    </article>
                  </div>

                  <aside className="hidden p-4 lg:block">
                    <h3 className="text-sm font-semibold">Comunidades</h3>
                    <div className="mt-4 grid gap-3">
                      {communities.map((community) => (
                        <div
                          key={community.title}
                          className="flex items-center gap-3 rounded-xl border border-borderDark bg-background/70 p-3"
                        >
                          <Image
                            src={community.image}
                            alt={community.title}
                            width={42}
                            height={42}
                            className="h-10 w-10 rounded-lg bg-secondary object-contain p-1"
                          />
                          <span className="text-sm font-semibold">
                            {community.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </aside>
                </div>
              </section>

              <section className="absolute bottom-0 right-0 hidden w-[38%] translate-x-8 translate-y-10 rounded-2xl border border-borderDark bg-background/95 p-4 shadow-2xl xl:block">
                <p className="text-xs font-semibold text-accent">
                  Perfil ativo
                </p>
                <h3 className="mt-2 text-lg font-semibold">Amigos e posts</h3>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-panel p-3">
                    <p className="text-2xl font-semibold">18</p>
                    <p className="text-mutedText">amigos</p>
                  </div>
                  <div className="rounded-xl bg-panel p-3">
                    <p className="text-2xl font-semibold">42</p>
                    <p className="text-mutedText">posts</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </section>

        <section id="recursos" className="px-3 py-16 sm:px-4 sm:py-20">
          <div className="mx-auto w-full max-w-6xl">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-semibold md:text-3xl">
                O essencial para conversar melhor.
              </h2>
              <p className="mt-3 text-sm font-medium leading-6 text-mutedText">
                Sem excesso de telas. Só o que ajuda o assunto a continuar.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {features.map(({ icon: Icon, title, text }) => (
                <article
                  key={title}
                  className="rounded-xl border border-borderDark bg-panel p-5 transition-colors hover:border-accent"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-lg border border-borderDark text-accent">
                    <Icon size={16} />
                  </div>
                  <h3 className="mt-5 text-base font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-mutedText">
                    {text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="comunidades"
          className="border-y border-borderDark bg-panel/90 px-3 py-16 sm:px-4 sm:py-20"
        >
          <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <h2 className="text-2xl font-semibold md:text-3xl">
                Comunidades dão contexto. Amigos dão continuidade.
              </h2>
              <p className="mt-4 text-sm font-medium leading-6 text-mutedText">
                Publique livremente no feed ou entre em uma comunidade para
                participar de um tema específico.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {communities.map((community) => (
                <article
                  key={community.title}
                  className="rounded-xl border border-borderDark bg-background/70 p-4"
                >
                  <Image
                    src={community.image}
                    alt={community.title}
                    width={92}
                    height={92}
                    className="mx-auto h-24 w-24 object-contain"
                  />
                  <h3 className="mt-4 text-center text-sm font-semibold">
                    {community.title}
                  </h3>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="sobre" className="px-3 py-16 sm:px-4 sm:py-20">
          <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1fr_320px] lg:items-center">
            <blockquote className="max-w-3xl">
              <div className="mb-5 flex text-goldAccent" aria-hidden="true">
                ★★★★★
              </div>
              <p className="text-xl font-medium leading-snug sm:text-2xl md:text-3xl">
                “O Gonin deixa a conversa leve: você encontra um tema, publica
                rápido e volta quando alguém responde.”
              </p>
              <footer className="mt-6 text-sm">
                <p className="font-semibold">Equipe Gonin</p>
                <p className="text-mutedText">Projeto em beta</p>
              </footer>
            </blockquote>

            <div className="rounded-2xl border border-borderDark bg-panel p-5">
              <Image
                src="/imgs/topics/Group discussion-pana.svg"
                alt="Pessoas conversando"
                width={260}
                height={260}
                className="mx-auto h-56 w-56 object-contain"
              />
            </div>
          </div>
        </section>

        <footer className="border-t border-borderDark px-3 py-10 sm:px-4 sm:py-12">
          <div className="mx-auto w-full max-w-6xl">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-accent text-sm font-black text-background">
                G
              </span>
              <span className="text-sm font-semibold">Gonin</span>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-8 sm:grid-cols-3">
              {footerLinks.map((group) => (
                <div key={group.title}>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-mutedText">
                    {group.title}
                  </h3>
                  <div className="mt-4 grid gap-2 text-sm">
                    {group.links.map((link) => (
                      <span key={link}>{link}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-10 text-xs text-mutedText">
              © 2026 Gonin. Todos os direitos reservados.
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
