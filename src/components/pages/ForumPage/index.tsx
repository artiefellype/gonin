"use client";
import ForumContainer from "@/components/organisms/ForumContainer";
import { useCallback, useEffect, useRef, useState } from "react";
import { CommunityProps, PaginatedPostsProps, PostProps } from "@/types";
import { postsServices } from "@/services/postServices";
import { GetServerSideProps } from "next";
import { parseCookies } from "nookies";
import Link from "next/link";
import { ForumComposerArea } from "@/components/molecules/ForumComposer";
import { FaComments, FaLock, FaUsers, FaXmark } from "react-icons/fa6";
import { useUserContext } from "@/context";
import { FriendshipServices } from "@/services/friendshipServices";
import { CommunityServices } from "@/services/communityServices";
import { useRouter } from "next/router";
import { UserSearch } from "@/components/molecules/UserSearch";

const POSTS_PAGE_SIZE = 10;

export const ForumPage = () => {
  const [posts, setPosts] = useState<PostProps[]>([]);
  const [activeCommunities, setActiveCommunities] = useState<CommunityProps[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(false);
  const [loadingCommunities, setLoadingCommunities] = useState(false);
  const [lockedCommunity, setLockedCommunity] =
    useState<CommunityProps | null>(null);
  const [feedMode, setFeedMode] = useState<"all" | "friends">("all");
  const { user } = useUserContext();
  const router = useRouter();
  const nextCursorRef = useRef<string | null>(null);
  const hasMorePostsRef = useRef(false);
  const loadingMoreRef = useRef(false);

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
      const cursor = reset ? null : nextCursorRef.current;
      let response: PaginatedPostsProps;

      if (feedMode === "friends") {
        if (!user?.user?.uid) {
          setPosts([]);
          setHasMorePosts(false);
          hasMorePostsRef.current = false;
          nextCursorRef.current = null;
          return;
        }

        const friendIds = await FriendshipServices.getFriendIds(user.user.uid);
        response = await postsServices.getPostsByUserIdsPage(
          friendIds,
          cursor,
          POSTS_PAGE_SIZE
        );
      } else {
        response = await postsServices.getPostsPage(cursor, POSTS_PAGE_SIZE);
      }

      setPosts((currentPosts) =>
        reset ? response.posts : mergePosts(currentPosts, response.posts)
      );
      nextCursorRef.current = response.nextCursor;
      const nextHasMore = response.hasMore && !!response.nextCursor;
      setHasMorePosts(nextHasMore);
      hasMorePostsRef.current = nextHasMore;
    } catch (err: any) {
      console.error("ERROR: ", err.message);
    } finally {
      if (reset) {
        setLoading(false);
      } else {
        setLoadingMore(false);
        loadingMoreRef.current = false;
      }
    }
  }, [feedMode, user?.user?.uid]);

  const fetchActiveCommunities = useCallback(async () => {
    setLoadingCommunities(true);
    try {
      const communities = await CommunityServices.getActiveByRecentPosts(3);
      setActiveCommunities(communities);
    } catch (err: any) {
      console.error("ERROR: ", err.message);
    } finally {
      setLoadingCommunities(false);
    }
  }, []);

  const refreshForum = useCallback(async () => {
    await fetchPosts(true);
    fetchActiveCommunities();
  }, [fetchActiveCommunities, fetchPosts]);

  const handleActiveCommunityClick = async (community: CommunityProps) => {
    if (community.visibility !== "private") {
      router.push(`/topics/${community.slug}`);
      return;
    }

    if (!user?.user?.uid) {
      setLockedCommunity(community);
      return;
    }

    if (community.ownerId === user.user.uid) {
      router.push(`/topics/${community.slug}`);
      return;
    }

    try {
      const isMember = await CommunityServices.checkMembership(
        community.slug,
        user.user.uid
      );

      if (isMember) {
        router.push(`/topics/${community.slug}`);
        return;
      }

      setLockedCommunity(community);
    } catch (err: any) {
      console.error("ERROR: ", err.message);
      setLockedCommunity(community);
    }
  };

  useEffect(() => {
    fetchPosts(true);
  }, [fetchPosts]);

  useEffect(() => {
    fetchActiveCommunities();
  }, [fetchActiveCommunities]);

  useEffect(() => {
    if (router.query.compose !== "1") return;

    const timer = window.setTimeout(() => {
      window.dispatchEvent(new Event("gonin:focus-composer"));
      router.replace("/forum", undefined, { shallow: true });
    }, 180);

    return () => window.clearTimeout(timer);
  }, [router]);

  return (
    <div className="w-full min-w-0 pb-2 md:h-full md:max-w-[620px] md:pb-0 xl:max-w-[980px]">
      <div className="grid h-full w-full grid-cols-1 xl:grid-cols-[minmax(0,620px)_minmax(280px,320px)] xl:gap-5">
        <main className="min-h-0 min-w-0 bg-background/60 md:flex md:flex-col md:border-x md:border-borderDark md:bg-background/70">
          <div className="sticky top-14 z-20 shrink-0 border-b border-borderDark bg-background/95 backdrop-blur-xl sm:top-[72px] md:top-0 md:bg-background/90">
            <div className="grid h-[50px] grid-cols-2 items-center text-sm sm:h-[54px]">
              <button
                onClick={() => setFeedMode("all")}
                className={`relative flex h-full items-center justify-center font-semibold transition-colors hover:bg-secondary/50 ${
                  feedMode === "all" ? "text-primary" : "text-mutedText"
                }`}
              >
                Para você
                {feedMode === "all" && (
                  <span className="absolute bottom-0 h-1 w-16 rounded-full bg-accent" />
                )}
              </button>
              <button
                onClick={() => setFeedMode("friends")}
                className={`relative flex h-full items-center justify-center font-medium transition-colors hover:bg-secondary/50 hover:text-primary ${
                  feedMode === "friends" ? "text-primary" : "text-mutedText"
                }`}
              >
                Amigos
                {feedMode === "friends" && (
                  <span className="absolute bottom-0 h-1 w-16 rounded-full bg-accent" />
                )}
              </button>
            </div>
          </div>

          <div className="min-w-0 md:min-h-0 md:flex-1 md:overflow-y-auto">
            <ForumComposerArea
              tag=""
              fetchNewPosts={refreshForum}
              variant="timeline"
            />
            <button
              onClick={refreshForum}
              className="flex h-11 w-full items-center justify-center border-b border-borderDark bg-background/50 text-sm font-medium text-accent transition-colors hover:bg-secondary/50 md:bg-transparent"
            >
              Atualizar {feedMode === "friends" ? "amigos" : "conversas"}
            </button>
            <ForumContainer
              posts={posts}
              loading={loading}
              loadingMore={loadingMore}
              hasMore={hasMorePosts}
              fetch={() => fetchPosts(true)}
              onLoadMore={() => fetchPosts(false)}
              setPosts={setPosts}
            />
          </div>
        </main>

        <aside className="hidden min-h-0 xl:block">
          <div className="sticky top-0 flex h-screen flex-col gap-4 overflow-y-auto py-3">
            <UserSearch />

            <section className="rounded-lg border border-borderDark bg-background p-4">
              <h2 className="text-lg font-semibold">Apoie o Gonin</h2>
              <p className="mt-2 text-sm font-medium leading-5 text-mutedText">
                O Gonin é um projeto independente. Se a comunidade te ajuda,
                considere apoiar quando abrirmos doações: isso mantém o fórum
                no ar e financia melhorias para todos.
              </p>
            </section>

            <section className="rounded-lg border border-borderDark bg-background py-3">
              <h2 className="px-4 text-lg font-semibold">Comunidades ativas</h2>
              <div className="mt-2">
                {loadingCommunities &&
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="px-4 py-3">
                      <div className="h-4 w-32 animate-pulse rounded bg-secondary" />
                      <div className="mt-2 h-3 w-48 animate-pulse rounded bg-secondary" />
                    </div>
                  ))}

                {!loadingCommunities && activeCommunities.length === 0 && (
                  <p className="px-4 py-3 text-sm leading-5 text-mutedText">
                    Nenhuma comunidade com atividade ainda.
                  </p>
                )}

                {!loadingCommunities && activeCommunities.map((community) => (
                  <button
                    key={community.slug}
                    onClick={() => handleActiveCommunityClick(community)}
                    className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/50"
                  >
                    <div className="min-w-0">
                      <div className="flex min-w-0 items-center gap-2">
                        <h3 className="truncate text-sm font-semibold text-primary">
                          {community.title}
                        </h3>
                        {community.visibility === "private" && (
                          <FaLock className="shrink-0 text-accent" size={10} />
                        )}
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs leading-4 text-mutedText">
                        {community.description}
                      </p>
                      <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-mutedText">
                        <span className="flex items-center gap-1">
                          <FaComments size={11} />
                          {community.postsCount || 0} posts
                        </span>
                        <span className="flex items-center gap-1">
                          <FaUsers size={11} />
                          {community.membersCount || 0} membros
                        </span>
                      </p>
                    </div>
                    <span className="mt-1 text-xs font-semibold text-accent">
                      Abrir
                    </span>
                  </button>
                ))}
              </div>
              <Link
                href="/topics"
                className="block px-4 py-3 text-sm font-medium text-blueAccent hover:bg-secondary/50"
              >
                Ver todas as comunidades
              </Link>
            </section>
          </div>
        </aside>
      </div>

      {lockedCommunity && (
        <div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-black/70 px-3 pb-3 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={() => setLockedCommunity(null)}
        >
          <section
            className="w-full max-w-md overflow-hidden rounded-2xl border border-borderDark bg-background shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="flex h-14 items-center justify-between border-b border-borderDark px-4">
              <div className="flex items-center gap-2">
                <FaLock className="text-accent" />
                <h2 className="text-base font-semibold text-primary">
                  Comunidade privada
                </h2>
              </div>
              <button
                onClick={() => setLockedCommunity(null)}
                className="grid h-9 w-9 place-items-center rounded-full text-mutedText transition-colors hover:bg-secondary hover:text-primary"
                aria-label="Fechar"
              >
                <FaXmark />
              </button>
            </header>

            <div className="p-4">
              <h3 className="text-lg font-semibold text-primary">
                {lockedCommunity.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-mutedText">
                Para entrar nessa comunidade, você precisa receber um convite
                enviado por alguém que já participa dela.
              </p>
              <button
                onClick={() => setLockedCommunity(null)}
                className="mt-5 h-10 w-full rounded-lg bg-accent px-4 text-sm font-semibold text-background transition-colors hover:bg-accent/90"
              >
                Entendi
              </button>
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
