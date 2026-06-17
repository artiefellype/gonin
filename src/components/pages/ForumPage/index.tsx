"use client";
import ForumContainer from "@/components/organisms/ForumContainer";
import { useCallback, useEffect, useState } from "react";
import { PostProps } from "@/types";
import { postsServices } from "@/services/postServices";
import { GetServerSideProps } from "next";
import { parseCookies } from "nookies";
import Link from "next/link";
import { ForumComposerArea } from "@/components/molecules/ForumComposer";
import {
  FaBolt,
  FaComments,
  FaRegCompass,
  FaRegLightbulb,
} from "react-icons/fa6";

const sidebarTopics = [
  { label: "Espaço livre", href: "/topics/espaco-livre" },
  { label: "Tecnologia", href: "/topics/tecnologia" },
  { label: "Feedbacks", href: "/topics/feedbacks" },
  { label: "Curiosidades", href: "/topics/curiosidades" },
];

export const ForumPage = () => {
  const [posts, setPosts] = useState<PostProps[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedPosts = await postsServices.getPosts();
      setPosts((prevPosts) => {
        const updatedPosts = fetchedPosts.filter(
          (newPost) =>
            !prevPosts.some((existingPost) => newPost.id === existingPost.id)
        );

        return [...prevPosts, ...updatedPosts];
      });
    } catch (err: any) {
      console.error("ERROR: ", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);
  return (
    <div className="w-full px-0 pb-20 md:h-full md:px-4 md:pb-0">
      <div className="mx-auto grid h-full w-full max-w-6xl grid-cols-1 gap-5 xl:grid-cols-[minmax(0,680px)_320px]">
        <main className="min-h-0 min-w-0 md:flex md:flex-col">
          <div className="sticky top-0 z-20 shrink-0 border-b border-slate-300/70 bg-background/95 px-3 py-4 backdrop-blur md:static md:rounded-t-lg md:border md:bg-whiteColor">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Início
                </p>
                <h1 className="text-2xl font-extrabold text-primary">
                  Conversas recentes
                </h1>
              </div>
              <Link
                href="/topics"
                className="hidden rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold transition-colors hover:bg-white md:flex"
              >
                Explorar tópicos
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-4 pt-4 md:min-h-0 md:flex-1 md:overflow-y-auto md:pr-2 md:pt-5">
            <ForumComposerArea
              tag={"espaco-livre"}
              fetchNewPosts={fetchPosts}
            />
            <ForumContainer
              posts={posts}
              loading={loading}
              fetch={fetchPosts}
              setPosts={setPosts}
            />
          </div>
        </main>

        <aside className="hidden min-h-0 xl:block">
          <div className="flex h-full flex-col gap-4 overflow-y-auto py-5">
            <section className="rounded-lg bg-whiteColor p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <FaBolt className="text-primary" />
                <h2 className="text-base font-bold">Comece por aqui</h2>
              </div>
              <p className="text-sm font-light leading-6 text-slate-600">
                O feed principal é livre. Publique uma pergunta, uma ideia ou
                algo que valha continuar em conversa.
              </p>
            </section>

            <section className="rounded-lg bg-whiteColor p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <FaRegCompass className="text-primary" />
                <h2 className="text-base font-bold">Tópicos ativos</h2>
              </div>
              <div className="flex flex-col gap-2">
                {sidebarTopics.map((topic) => (
                  <Link
                    key={topic.href}
                    href={topic.href}
                    className="rounded-md bg-white px-3 py-2 text-sm font-semibold transition-colors hover:bg-accentSoft hover:text-accent"
                  >
                    {topic.label}
                  </Link>
                ))}
              </div>
            </section>

            <section className="rounded-lg bg-accent p-4 text-whiteColor shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <FaRegLightbulb />
                <h2 className="text-base font-bold">Ideias abertas</h2>
              </div>
              <p className="text-sm font-light leading-6 text-slate-200">
                Ideias não precisam nascer prontas. Poste pequeno, ajuste com
                feedback e volte quando a conversa crescer.
              </p>
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const cookies = parseCookies(ctx);

  if (!cookies.gonin_token) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};
