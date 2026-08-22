
import { CustomDivider } from "@/components/atoms/CustomDivider";
import { ForumComposerArea } from "@/components/molecules/ForumComposer";
import ForumContainer from "@/components/organisms/ForumContainer";
import { useUserContext } from "@/context";
import { CommunityServices } from "@/services/communityServices";
import { postsServices } from "@/services/postServices";
import { UserServices } from "@/services/userServices";
import { CommunityProps, PostProps, UserProps } from "@/types";
import { GetServerSideProps } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FaLock,
  FaPaperPlane,
  FaTrash,
  FaTriangleExclamation,
  FaUserPlus,
  FaXmark,
} from "react-icons/fa6";

interface TopicPageProps {
  tag: string;
}

const POSTS_PAGE_SIZE = 10;

export const TopicPage = ({ tag }: TopicPageProps) => {
  const [posts, setPosts] = useState<PostProps[]>([]);
  const [community, setCommunity] = useState<CommunityProps | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [membershipLoading, setMembershipLoading] = useState(false);
  const [membershipConfirmation, setMembershipConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [communityLoading, setCommunityLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteSearch, setInviteSearch] = useState("");
  const [inviteResults, setInviteResults] = useState<UserProps[]>([]);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMessage, setInviteMessage] = useState("");
  const [invitingUserId, setInvitingUserId] = useState("");
  const [deletingCommunity, setDeletingCommunity] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(false);
  const { user } = useUserContext();
  const router = useRouter();
  const nextCursorRef = useRef<string | null>(null);
  const hasMorePostsRef = useRef(false);
  const loadingMoreRef = useRef(false);
  const isCommunityOwner =
    !!community &&
    !community.isSystem &&
    !!user?.user?.uid &&
    community.ownerId === user.user.uid;
  const isPrivateCommunity = community?.visibility === "private";
  const canAccessCommunity =
    !isPrivateCommunity || isMember || isCommunityOwner;
  const canCreateCommunityPost = isMember || isCommunityOwner;
  const canInviteToCommunity =
    !!user?.user?.uid && !!community && isPrivateCommunity && canAccessCommunity;

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

  const mergePosts = (currentPosts: PostProps[], nextPosts: PostProps[]) => {
    const postsMap = new Map<string, PostProps>();
    [...currentPosts, ...nextPosts].forEach((post) => {
      if (post.id) postsMap.set(post.id, post);
    });
    return Array.from(postsMap.values());
  };

  const fetchPosts = useCallback(async (reset: boolean = true) => {
    if (reset) {
      setLoading(true);
      setHasMorePosts(false);
      hasMorePostsRef.current = false;
      nextCursorRef.current = null;
    } else {
      if (loadingMoreRef.current || !hasMorePostsRef.current) return;
      setLoadingMore(true);
      loadingMoreRef.current = true;
    }

    try {
      const response = await postsServices.getPostsByCommunityPage(
        tag,
        reset ? null : nextCursorRef.current,
        POSTS_PAGE_SIZE
      );
      setPosts((currentPosts) =>
        reset ? response.posts : mergePosts(currentPosts, response.posts)
      );
      nextCursorRef.current = response.nextCursor;
      const nextHasMore = response.hasMore && !!response.nextCursor;
      setHasMorePosts(nextHasMore);
      hasMorePostsRef.current = nextHasMore;
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      if (reset) {
        setLoading(false);
      } else {
        setLoadingMore(false);
        loadingMoreRef.current = false;
      }
    }
  }, [tag]);

  const handleToggleMembership = async () => {
    if (!user?.user?.uid || !community || membershipLoading) return;

    setMembershipLoading(true);
    setMembershipConfirmation("");
    setError(null);
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
      setMembershipConfirmation("Agora você é membro");
      window.setTimeout(() => {
        setMembershipConfirmation("");
      }, 1800);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setMembershipLoading(false);
    }
  };

  const membershipButtonText = membershipLoading
    ? isMember
      ? "Saindo..."
      : "Entrando..."
    : membershipConfirmation ||
      (isMember
        ? "Participando"
        : isPrivateCommunity
          ? "Convite necessário"
          : "Participar");

  const joinCommunityButtonText =
    membershipLoading ? "Entrando..." : membershipConfirmation || "Participar";

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
  }, [tag, user?.user?.uid]);

  useEffect(() => {
    if (!community) return;

    if (!canAccessCommunity) {
      setPosts([]);
      return;
    }

    fetchPosts(true);
  }, [community?.slug, canAccessCommunity, fetchPosts]);

  useEffect(() => {
    if (!inviteModalOpen || inviteSearch.trim().length < 2) {
      setInviteResults([]);
      setInviteLoading(false);
      return;
    }

    setInviteLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const users = await UserServices.searchUsers(
          inviteSearch,
          user?.user?.uid
        );
        setInviteResults(users);
      } catch (err: any) {
        setInviteMessage(err.message || "Não foi possível buscar usuários.");
      } finally {
        setInviteLoading(false);
      }
    }, 280);

    return () => window.clearTimeout(timer);
  }, [inviteModalOpen, inviteSearch, user?.user?.uid]);

  const handleInviteUser = async (targetUserId: string) => {
    if (!community || !user?.user?.uid || invitingUserId) return;

    setInvitingUserId(targetUserId);
    setInviteMessage("");
    try {
      await CommunityServices.inviteToCommunity(
        community.slug,
        user.user.uid,
        targetUserId
      );
      setInviteMessage("Convite enviado.");
    } catch (err: any) {
      setInviteMessage(err.message || "Não foi possível enviar o convite.");
    } finally {
      setInvitingUserId("");
    }
  };

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
                  {isPrivateCommunity ? " · privada" : ""}
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
                    {canInviteToCommunity && (
                      <button
                        onClick={() => setInviteModalOpen(true)}
                        className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-accent/50 bg-accentSoft px-4 text-sm font-semibold text-accent transition-colors hover:border-accent sm:w-auto"
                      >
                        <FaUserPlus size={13} />
                        Convidar
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    {canInviteToCommunity && (
                      <button
                        onClick={() => setInviteModalOpen(true)}
                        className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-accent/50 bg-accentSoft px-4 text-sm font-semibold text-accent transition-colors hover:border-accent sm:w-auto"
                      >
                        <FaUserPlus size={13} />
                        Convidar
                      </button>
                    )}
                    <button
                      onClick={handleToggleMembership}
                      disabled={
                        membershipLoading ||
                        !!membershipConfirmation ||
                        (isPrivateCommunity && !isMember)
                      }
                      className="h-10 w-full rounded-lg border border-accent bg-accent px-4 text-sm font-semibold text-background transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:border-borderDark disabled:bg-secondary disabled:text-mutedText sm:w-auto"
                    >
                      {membershipButtonText}
                    </button>
                  </>
                )}
              </div>
            </div>
          </section>
          <div className="flex flex-col gap-3 md:gap-4">
            {canCreateCommunityPost ? (
              <ForumComposerArea
                tag={tag}
                fetchNewPosts={() => fetchPosts(true)}
                lockCommunity
              />
            ) : !canAccessCommunity ? (
              <section className="rounded-xl border border-borderDark bg-panel/90 p-5 text-center shadow-lg">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-accentSoft text-accent">
                  <FaLock />
                </span>
                <h2 className="mt-3 text-lg font-semibold text-primary">
                  Comunidade privada
                </h2>
                <p className="mt-2 text-sm leading-6 text-mutedText">
                  Você precisa receber um convite de um membro para participar
                  e ver as conversas daqui.
                </p>
              </section>
            ) : (
              <section className="rounded-xl border border-borderDark bg-panel/90 p-5 text-center shadow-lg">
                <h2 className="text-lg font-semibold text-primary">
                  Participe para publicar
                </h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-mutedText">
                  Entre na comunidade para criar posts, responder melhor ao
                  assunto e acompanhar as próximas conversas.
                </p>
                <button
                  onClick={handleToggleMembership}
                  disabled={membershipLoading || !!membershipConfirmation}
                  className="mt-4 h-10 rounded-lg bg-accent px-4 text-sm font-semibold text-background transition-colors hover:bg-accent/90 disabled:cursor-wait disabled:opacity-70"
                >
                  {joinCommunityButtonText}
                </button>
              </section>
            )}
            {error && (
              <div className="rounded-lg border border-coral/40 bg-coralSoft p-4 text-sm font-semibold text-coral">
                {error}
              </div>
            )}
            {canAccessCommunity && (
              <ForumContainer
                posts={posts}
                loading={loading}
                loadingMore={loadingMore}
                hasMore={hasMorePosts}
                fetch={() => fetchPosts(true)}
                onLoadMore={() => fetchPosts(false)}
                setPosts={setPosts}
              />
            )}
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
          className="fixed inset-0 z-[120] flex items-end justify-center overflow-hidden bg-black/70 px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-sm sm:items-center sm:p-4"
          onClick={() => {
            if (!deletingCommunity) setDeleteModalOpen(false);
          }}
        >
          <section
            className="w-full max-w-md overflow-hidden rounded-t-2xl border border-borderDark bg-background shadow-2xl sm:rounded-2xl"
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

              <footer className="mt-5 grid grid-cols-2 gap-2 sm:flex sm:items-center sm:justify-end">
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

      {inviteModalOpen && community && (
        <div
          className="fixed inset-0 z-[120] flex items-end justify-center overflow-hidden bg-black/70 px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-sm sm:items-center sm:p-4"
          onClick={() => setInviteModalOpen(false)}
        >
          <section
            className="flex max-h-[calc(100svh-1.5rem)] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-borderDark bg-background shadow-2xl sm:max-h-[86svh] sm:rounded-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="flex h-14 shrink-0 items-center justify-between border-b border-borderDark px-4">
              <div className="flex min-w-0 items-center gap-2">
                <FaUserPlus className="text-accent" />
                <h2 className="truncate text-base font-semibold text-primary">
                  Convidar para {community.title}
                </h2>
              </div>
              <button
                onClick={() => setInviteModalOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-full text-mutedText transition-colors hover:bg-secondary hover:text-primary"
                aria-label="Fechar"
              >
                <FaXmark />
              </button>
            </header>

            <div className="shrink-0 border-b border-borderDark p-4">
              <input
                value={inviteSearch}
                onChange={(event) => setInviteSearch(event.target.value)}
                placeholder="Buscar usuário por nome"
                className="h-11 w-full rounded-lg border border-borderDark bg-secondary px-3 text-sm font-medium text-primary placeholder:text-mutedText/70 focus:border-accent focus:outline-none"
              />
              {inviteMessage && (
                <p className="mt-3 rounded-lg border border-borderDark bg-panel px-3 py-2 text-sm text-mutedText">
                  {inviteMessage}
                </p>
              )}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
              {inviteSearch.trim().length < 2 && (
                <p className="px-3 py-8 text-center text-sm text-mutedText">
                  Digite pelo menos duas letras.
                </p>
              )}
              {inviteLoading && (
                <div className="space-y-2 p-2">
                  {[0, 1, 2].map((item) => (
                    <div
                      key={item}
                      className="h-14 animate-pulse rounded-xl bg-secondary"
                    />
                  ))}
                </div>
              )}
              {!inviteLoading &&
                inviteSearch.trim().length >= 2 &&
                inviteResults.length === 0 && (
                  <p className="px-3 py-8 text-center text-sm text-mutedText">
                    Nenhum usuário encontrado.
                  </p>
                )}
              {!inviteLoading &&
                inviteResults.map((foundUser) => {
                  const profileId = foundUser.uid || foundUser.id;
                  return (
                    <div
                      key={profileId}
                      className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-secondary/70 sm:flex sm:items-center"
                    >
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-secondary">
                        <Image
                          src={foundUser.photoURL || "/imgs/default_perfil.jpg"}
                          alt={foundUser.displayName || "Usuário"}
                          width={40}
                          height={40}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-primary">
                          {foundUser.displayName || "Usuário do Gonin"}
                        </p>
                        <p className="truncate text-xs text-mutedText">
                          {foundUser.username
                            ? `@${foundUser.username}`
                            : foundUser.bio || foundUser.location || "Perfil"}
                        </p>
                      </div>
                      <button
                        onClick={() => handleInviteUser(profileId)}
                        disabled={invitingUserId === profileId}
                        className="col-span-2 inline-flex h-9 items-center justify-center gap-2 rounded-full bg-accent px-3 text-xs font-semibold text-background transition-colors hover:bg-accent/90 disabled:cursor-wait disabled:opacity-70 sm:col-span-1 sm:shrink-0"
                      >
                        <FaPaperPlane size={12} />
                        Convidar
                      </button>
                    </div>
                  );
                })}
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
