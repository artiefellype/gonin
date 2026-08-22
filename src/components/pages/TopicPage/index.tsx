
import { CustomDivider } from "@/components/atoms/CustomDivider";
import { ForumComposerArea } from "@/components/molecules/ForumComposer";
import ForumContainer from "@/components/organisms/ForumContainer";
import { useUserContext } from "@/context";
import { CommunityServices } from "@/services/communityServices";
import { postsServices } from "@/services/postServices";
import { CommunityProps, PostProps } from "@/types";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import React, { useEffect, useState } from "react";
import { FaTrash, FaTriangleExclamation, FaXmark } from "react-icons/fa6";

interface TopicPageProps {
  tag: string;
}

export const TopicPage = ({ tag }: TopicPageProps) => {
  const [posts, setPosts] = useState<PostProps[]>([]);
  const [community, setCommunity] = useState<CommunityProps | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [communityLoading, setCommunityLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingCommunity, setDeletingCommunity] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUserContext();
  const router = useRouter();
  const isCommunityOwner =
    !!community &&
    !community.isSystem &&
    !!user?.user?.uid &&
    community.ownerId === user.user.uid;

  const fetchCommunity = async () => {
    setCommunityLoading(true);
    try {
      const response = await CommunityServices.getCommunityBySlug(tag);
      setCommunity(response);

      if (response && user?.user?.uid) {
        const membership = await CommunityServices.checkMembership(
          response.slug,
          user.user.uid
        );
        setIsMember(membership);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCommunityLoading(false);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const newPosts = await postsServices.getPostsByCommunity(tag);
      setPosts(newPosts);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMembership = async () => {
    if (!user?.user?.uid || !community) return;

    try {
      if (isMember) {
        const nextState = await CommunityServices.leaveCommunity(
          community.slug,
          user.user.uid
        );
        setIsMember(nextState);
        setCommunity((current) =>
          current
            ? {
                ...current,
                membersCount: Math.max(0, current.membersCount - 1),
              }
            : current
        );
        return;
      }

      const nextState = await CommunityServices.joinCommunity(
        community.slug,
        user.user.uid
      );
      setIsMember(nextState);
      setCommunity((current) =>
        current
          ? {
              ...current,
              membersCount: current.membersCount + 1,
            }
          : current
      );
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteCommunity = async () => {
    if (!user?.user?.uid || !community || !isCommunityOwner) return;

    setDeletingCommunity(true);
    setError(null);
    try {
      await CommunityServices.deleteCommunity(community.slug, user.user.uid);
      setDeleteModalOpen(false);
      router.push("/topics");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeletingCommunity(false);
    }
  };

  useEffect(() => {
    fetchCommunity();
    fetchPosts();
  }, [tag, user?.user?.uid]);

  return (
    <div className="w-full px-3 pb-24 md:h-full md:min-h-0 md:overflow-y-auto md:overscroll-contain md:px-4 md:pb-8">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 py-3 md:py-6 lg:grid-cols-[minmax(0,720px)_280px] lg:gap-5">
        <main className="min-w-0">
          <div className="mb-3 md:mb-4">
            <CustomDivider tag={tag} />
          </div>
          <section className="mb-4 rounded-xl border border-borderDark bg-panel/90 p-4 shadow-lg">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-accent">
                  Comunidade
                </p>
                <h1 className="mt-1 text-2xl font-semibold text-primary">
                  {community?.title || "Comunidade"}
                </h1>
                <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-mutedText">
                  {community?.description ||
                    "Participe das conversas e publique ideias para esta comunidade."}
                </p>
                <p className="mt-3 text-xs font-semibold text-mutedText">
                  {communityLoading
                    ? "Carregando participação..."
                    : `${community?.membersCount || 0} membros`}
                </p>
              </div>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
                {isCommunityOwner ? (
                  <>
                    <span className="flex h-10 w-full items-center justify-center rounded-lg border border-borderDark bg-secondary px-4 text-sm font-semibold text-mutedText sm:w-auto">
                      Dono
                    </span>
                    <button
                      onClick={() => setDeleteModalOpen(true)}
                      className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-coral/50 bg-coralSoft px-4 text-sm font-semibold text-coral transition-colors hover:border-coral sm:w-auto"
                    >
                      <FaTrash size={13} />
                      Apagar comunidade
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleToggleMembership}
                    className="h-10 w-full rounded-lg border border-accent bg-accent px-4 text-sm font-semibold text-background transition-colors hover:bg-accent/90 sm:w-auto"
                  >
                    {isMember ? "Participando" : "Participar"}
                  </button>
                )}
              </div>
            </div>
          </section>
          <div className="flex flex-col gap-3 md:gap-4">
            <ForumComposerArea
              tag={tag}
              fetchNewPosts={fetchPosts}
              lockCommunity
            />
            {error && (
              <div className="rounded-lg border border-coral/40 bg-coralSoft p-4 text-sm font-semibold text-coral">
                {error}
              </div>
            )}
            <ForumContainer
              posts={posts}
              loading={loading}
              fetch={fetchPosts}
              setPosts={setPosts}
            />
          </div>
        </main>

        <aside className="hidden lg:block">
          <div className="sticky top-24 flex flex-col gap-4">
            <section className="rounded-lg border border-borderDark bg-panel/90 p-4 shadow-lg">
              <h2 className="text-base font-bold text-primary">
                Sobre esta comunidade
              </h2>
              <p className="mt-2 text-sm font-medium leading-6 text-mutedText">
                {community?.description ||
                  "Publique ideias pequenas, perguntas abertas e mídias que ajudem outras pessoas a entrar na conversa."}
              </p>
            </section>
            <section className="rounded-lg border border-accent/30 bg-accentSoft p-4 shadow-lg">
              <p className="text-xs font-bold uppercase tracking-wide text-accent">
                Dica
              </p>
              <h3 className="mt-1 text-base font-bold text-primary">
                Títulos ajudam muito
              </h3>
              <p className="mt-2 text-sm font-medium leading-6 text-mutedText">
                Use o campo de título quando quiser transformar uma pergunta em
                uma conversa mais fácil de encontrar.
              </p>
            </section>
          </div>
        </aside>
      </div>

      {deleteModalOpen && community && (
        <div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-black/70 px-3 pb-3 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={() => {
            if (!deletingCommunity) setDeleteModalOpen(false);
          }}
        >
          <section
            className="w-full max-w-md overflow-hidden rounded-2xl border border-borderDark bg-background shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="flex h-14 items-center justify-between border-b border-borderDark px-4">
              <div className="flex items-center gap-2">
                <FaTriangleExclamation className="text-coral" />
                <h2 className="text-base font-semibold text-primary">
                  Apagar comunidade
                </h2>
              </div>
              <button
                onClick={() => setDeleteModalOpen(false)}
                disabled={deletingCommunity}
                className="grid h-9 w-9 place-items-center rounded-full text-mutedText transition-colors hover:bg-secondary hover:text-primary disabled:opacity-50"
                aria-label="Fechar"
              >
                <FaXmark />
              </button>
            </header>

            <div className="p-4">
              <p className="text-sm leading-6 text-mutedText">
                Essa operação é irreversível. A comunidade{" "}
                <strong className="text-primary">{community.title}</strong>{" "}
                será apagada, os membros serão removidos e os posts vinculados
                virarão posts livres.
              </p>

              {error && (
                <p className="mt-4 rounded-lg border border-coral/30 bg-coralSoft px-3 py-2 text-sm font-semibold text-coral">
                  {error}
                </p>
              )}

              <footer className="mt-5 flex items-center justify-end gap-2">
                <button
                  onClick={() => setDeleteModalOpen(false)}
                  disabled={deletingCommunity}
                  className="h-10 rounded-lg px-4 text-sm font-semibold text-mutedText transition-colors hover:bg-secondary hover:text-primary disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteCommunity}
                  disabled={deletingCommunity}
                  className="h-10 rounded-lg bg-coral px-4 text-sm font-semibold text-background transition-colors hover:bg-coral/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deletingCommunity ? "Apagando..." : "Apagar"}
                </button>
              </footer>
            </div>
          </section>
        </div>
      )}
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
