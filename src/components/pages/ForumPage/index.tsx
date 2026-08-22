"use client";
import ForumContainer from "@/components/organisms/ForumContainer";
import { useCallback, useEffect, useState } from "react";
import { CommunityProps, PostProps } from "@/types";
import { postsServices } from "@/services/postServices";
import { GetServerSideProps } from "next";
import { parseCookies } from "nookies";
import Link from "next/link";
import { ForumComposerArea } from "@/components/molecules/ForumComposer";
import { FaComments, FaMagnifyingGlass, FaUsers } from "react-icons/fa6";
import { useUserContext } from "@/context";
import { FriendshipServices } from "@/services/friendshipServices";
import { CommunityServices } from "@/services/communityServices";

export const ForumPage = () => {
  const [posts, setPosts] = useState<PostProps[]>([]);
  const [activeCommunities, setActiveCommunities] = useState<CommunityProps[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingCommunities, setLoadingCommunities] = useState(false);
  const [feedMode, setFeedMode] = useState<"all" | "friends">("all");
  const { user } = useUserContext();

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      if (feedMode === "friends") {
        if (!user?.user?.uid) {
          setPosts([]);
          return;
        }

        const friendIds = await FriendshipServices.getFriendIds(user.user.uid);
        const fetchedPosts = await postsServices.getPostsByUserIds(friendIds);
        setPosts(fetchedPosts);
        return;
      }

      const fetchedPosts = await postsServices.getPosts();
      setPosts(fetchedPosts);
    } catch (err: any) {
      console.error("ERROR: ", err.message);
    } finally {
      setLoading(false);
    }
  }, [feedMode, user?.user?.uid]);

  const fetchActiveCommunities = useCallback(async () => {
    setLoadingCommunities(true);
    try {
      const [communities, allPosts] = await Promise.all([
        CommunityServices.getCommunities(),
        postsServices.getPosts(),
      ]);
      const postCountByCommunity = allPosts.reduce<Map<string, number>>(
        (acc, post) => {
          const communityId = post.communityId || post.tags?.[0];
          if (!communityId) return acc;

          acc.set(communityId, (acc.get(communityId) || 0) + 1);
          return acc;
        },
        new Map()
      );
      const sortedCommunities = communities
        .map((community) => {
          const postCount = Math.max(
            community.postsCount || 0,
            postCountByCommunity.get(community.slug) || 0
          );

          return {
            ...community,
            postsCount: postCount,
          };
        })
        .filter(
          (community) =>
            (community.postsCount || 0) > 0 || (community.membersCount || 0) > 0
        )
        .sort((a, b) => {
          const postDifference = (b.postsCount || 0) - (a.postsCount || 0);
          if (postDifference !== 0) return postDifference;

          const memberDifference =
            (b.membersCount || 0) - (a.membersCount || 0);
          if (memberDifference !== 0) return memberDifference;

          return a.title.localeCompare(b.title);
        })
        .slice(0, 5);

      setActiveCommunities(sortedCommunities);
    } catch (err: any) {
      console.error("ERROR: ", err.message);
    } finally {
      setLoadingCommunities(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    fetchActiveCommunities();
  }, [fetchActiveCommunities]);

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
              fetchNewPosts={fetchPosts}
              variant="timeline"
            />
            <button
              onClick={fetchPosts}
              className="flex h-11 w-full items-center justify-center border-b border-borderDark bg-background/50 text-sm font-medium text-accent transition-colors hover:bg-secondary/50 md:bg-transparent"
            >
              Atualizar {feedMode === "friends" ? "amigos" : "conversas"}
            </button>
            <ForumContainer
              posts={posts}
              loading={loading}
              fetch={fetchPosts}
              setPosts={setPosts}
            />
          </div>
        </main>

        <aside className="hidden min-h-0 xl:block">
          <div className="sticky top-0 flex h-screen flex-col gap-4 overflow-y-auto py-3">
            <Link
              href="/topics"
              className="flex h-11 items-center gap-3 rounded-lg border border-borderDark bg-background px-4 text-sm font-semibold text-mutedText transition-colors hover:border-accent hover:text-accent"
            >
              <FaMagnifyingGlass size={14} />
              <span>Explorar comunidades</span>
            </Link>

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
                  <Link
                    key={community.slug}
                    href={`/topics/${community.slug}`}
                    className="flex items-start justify-between gap-3 px-4 py-3 transition-colors hover:bg-secondary/50"
                  >
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-primary">
                        {community.title}
                      </h3>
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
                  </Link>
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
