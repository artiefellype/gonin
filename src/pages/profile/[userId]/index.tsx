import ForumContainer from "@/components/organisms/ForumContainer";
import { EditProfileModal } from "@/components/molecules/EditProfileModal";
import { LayoutForum } from "@/components/templates/LayoutForum";
import { useUserContext } from "@/context";
import { CommunityServices } from "@/services/communityServices";
import { FriendshipServices } from "@/services/friendshipServices";
import { postsServices } from "@/services/postServices";
import { UserServices } from "@/services/userServices";
import { CommunityProps, FriendshipProps, PostProps, UserProps } from "@/types";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { parseCookies } from "nookies";
import React, { useEffect, useState } from "react";
import { FaBookmark, FaComments, FaPen, FaUserGroup } from "react-icons/fa6";

const ProfilePage = () => {
  const router = useRouter();
  const { userId } = router.query;
  const { user } = useUserContext();
  const [profile, setProfile] = useState<UserProps | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProps | null>(null);
  const [posts, setPosts] = useState<PostProps[]>([]);
  const [savedPosts, setSavedPosts] = useState<PostProps[]>([]);
  const [friends, setFriends] = useState<UserProps[]>([]);
  const [communities, setCommunities] = useState<CommunityProps[]>([]);
  const [friendship, setFriendship] = useState<FriendshipProps | null>(null);
  const [activeTab, setActiveTab] = useState<"posts" | "saved">("posts");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [error, setError] = useState("");
  const viewedUserId = userId as string;
  const loggedUserId = user?.user?.uid || "";
  const isOwnProfile = viewedUserId === loggedUserId;

  const fetchProfile = async () => {
    if (!viewedUserId) return;

    setLoading(true);
    setError("");
    try {
      const [profileInfo, profilePosts, profileFriends, allCommunities] =
        await Promise.all([
          UserServices.getUserById(viewedUserId),
          postsServices.getPostsByUserId(viewedUserId),
          FriendshipServices.getFriends(viewedUserId),
          CommunityServices.getCommunities(),
        ]);

      setProfile(profileInfo);
      setPosts(profilePosts);
      setFriends(profileFriends);
      setCommunities(
        allCommunities.filter((community) =>
          (profileInfo.communities || []).includes(community.slug)
        )
      );

      if (loggedUserId) {
        const loggedInfo = await UserServices.getUserById(loggedUserId);
        setCurrentUser(loggedInfo);

        if (!isOwnProfile) {
          const friendshipInfo = await FriendshipServices.getFriendshipBetween(
            loggedUserId,
            viewedUserId
          );
          setFriendship(friendshipInfo);
        } else {
          const saved = await postsServices.getSavedPostsByUser(loggedUserId);
          setSavedPosts(saved);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFriendAction = async () => {
    if (!loggedUserId || !viewedUserId) return;

    setActionLoading(true);
    try {
      if (!friendship) {
        const response = await FriendshipServices.sendRequest(
          loggedUserId,
          viewedUserId
        );
        setFriendship(response);
        return;
      }

      if (
        friendship.status === "pending" &&
        friendship.addresseeId === loggedUserId
      ) {
        const response = await FriendshipServices.acceptRequest(
          friendship.id,
          loggedUserId
        );
        setFriendship(response);
        setFriends((current) =>
          currentUser ? [currentUser, ...current] : current
        );
        setProfile((current) =>
          current
            ? { ...current, friendCount: (current.friendCount || 0) + 1 }
            : current
        );
        return;
      }

      if (friendship.status === "accepted") {
        await FriendshipServices.removeFriend(loggedUserId, viewedUserId);
        setFriendship(null);
        setFriends((current) =>
          current.filter((friend) => friend.uid !== loggedUserId)
        );
        setProfile((current) =>
          current
            ? {
                ...current,
                friendCount: Math.max(0, (current.friendCount || 0) - 1),
              }
            : current
        );
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getFriendButtonText = () => {
    if (!friendship) return "Adicionar amigo";
    if (friendship.status === "accepted") return "Amigos";
    if (friendship.addresseeId === loggedUserId) return "Aceitar amizade";
    return "Convite enviado";
  };

  const handleSaveProfile = async (updatedProfile: UserProps) => {
    setProfileSaving(true);
    setError("");
    try {
      await UserServices.updateUser(updatedProfile);
      setProfile(updatedProfile);
      setCurrentUser(updatedProfile);
      setEditProfileOpen(false);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setProfileSaving(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [viewedUserId, loggedUserId]);

  const visiblePosts = activeTab === "posts" ? posts : savedPosts;

  return (
    <LayoutForum>
      <Head>
        <title>{profile?.displayName || "Perfil"} - Gonin</title>
      </Head>
      <div className="w-full px-3 pb-24 text-primary md:h-full md:min-h-0 md:overflow-y-auto md:overscroll-contain md:px-0 md:pb-8">
        <div className="mx-auto w-full max-w-[920px] py-3 md:px-4 md:py-6">
          <section className="rounded-2xl border border-borderDark bg-panel/90 shadow-lg">
            <div className="relative h-32 overflow-hidden rounded-t-2xl bg-accentSoft sm:h-44">
              {profile?.profileBanner ? (
                <Image
                  src={profile.profileBanner}
                  alt="Imagem de fundo do perfil"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full bg-[radial-gradient(circle_at_30%_20%,rgba(130,171,255,0.32),transparent_38%),linear-gradient(135deg,#111B3E,#10191F)]" />
              )}
            </div>
            <div className="relative px-4 pb-5 md:px-6">
              <div className="-mt-10 flex flex-col gap-4 sm:-mt-12 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex items-end gap-3 sm:gap-4">
                  <div className="relative z-10 h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-4 border-background bg-secondary shadow-lg sm:h-28 sm:w-28">
                    {!loading && profile ? (
                      <Image
                        src={profile.photoURL || "/imgs/default_perfil.jpg"}
                        alt={profile.displayName}
                        width={112}
                        height={112}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full animate-pulse bg-secondary" />
                    )}
                  </div>
                  <div className="min-w-0 pb-1 pt-10 sm:pt-0">
                    <h1 className="text-xl font-semibold text-primary sm:text-2xl">
                      {loading ? "Carregando..." : profile?.displayName}
                    </h1>
                    <p className="mt-1 text-sm text-mutedText">
                      {profile?.location || profile?.email || "Gonin"}
                    </p>
                  </div>
                </div>

                {isOwnProfile && (
                  <button
                    onClick={() => setEditProfileOpen(true)}
                    disabled={loading}
                    className="flex h-10 items-center justify-center gap-2 rounded-lg border border-borderDark bg-secondary px-4 text-sm font-semibold text-primary transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <FaPen size={13} />
                    Editar perfil
                  </button>
                )}

                {!isOwnProfile && (
                  <button
                    onClick={handleFriendAction}
                    disabled={
                      actionLoading ||
                      (friendship?.status === "pending" &&
                        friendship.requesterId === loggedUserId)
                    }
                    className="h-10 rounded-lg bg-accent px-4 text-sm font-semibold text-background transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {actionLoading ? "Aguarde..." : getFriendButtonText()}
                  </button>
                )}
              </div>

              <p className="mt-5 max-w-2xl text-base leading-7 text-primary">
                {profile?.bio || "Ainda sem recado no perfil."}
              </p>

              <div className="mt-5 flex flex-wrap gap-6 text-sm text-mutedText">
                <span>
                  <strong className="text-primary">{posts.length}</strong> posts
                </span>
                <span>
                  <strong className="text-primary">
                    {profile?.friendCount || friends.length}
                  </strong>{" "}
                  amigos
                </span>
                <span>
                  <strong className="text-primary">{communities.length}</strong>{" "}
                  comunidades
                </span>
                <span>desde {profile?.createdAt?.slice(0, 10) || "-"}</span>
              </div>

              {error && (
                <p className="mt-4 rounded-lg border border-coral/30 bg-coralSoft p-3 text-sm font-semibold text-coral">
                  {error}
                </p>
              )}
            </div>
          </section>

          <EditProfileModal
            open={editProfileOpen}
            profile={profile}
            loading={profileSaving}
            onClose={() => setEditProfileOpen(false)}
            onSave={handleSaveProfile}
          />

          <section className="mt-4 grid grid-cols-1 gap-3 md:gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-borderDark bg-panel/90 p-4">
              <div className="mb-3 flex items-center gap-2">
                <FaUserGroup className="text-accent" />
                <h2 className="text-base font-semibold text-primary">Amigos</h2>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {friends.slice(0, 12).map((friend) => (
                  <Link
                    key={friend.uid}
                    href={`/profile/${friend.uid}`}
                    className="group w-20 shrink-0 text-center"
                  >
                    <div className="mx-auto h-14 w-14 overflow-hidden rounded-xl bg-secondary">
                      <Image
                        src={friend.photoURL || "/imgs/default_perfil.jpg"}
                        alt={friend.displayName}
                        width={56}
                        height={56}
                        className="h-full w-full object-cover motion-safe:transition-transform motion-safe:group-hover:scale-105"
                      />
                    </div>
                    <p className="mt-1 truncate text-xs font-medium text-mutedText group-hover:text-primary">
                      {friend.displayName}
                    </p>
                  </Link>
                ))}
                {!loading && friends.length === 0 && (
                  <p className="text-sm text-mutedText">
                    Nenhum amigo por aqui ainda.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-borderDark bg-panel/90 p-4">
              <div className="mb-3 flex items-center gap-2">
                <FaComments className="text-accent" />
                <h2 className="text-base font-semibold text-primary">
                  Comunidades
                </h2>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {communities.slice(0, 8).map((community) => (
                  <Link
                    key={community.slug}
                    href={`/topics/${community.slug}`}
                    className="min-w-[170px] rounded-xl border border-borderDark bg-secondary p-3 transition-colors hover:border-accent"
                  >
                    <p className="truncate text-sm font-semibold text-primary">
                      {community.title}
                    </p>
                    <p className="mt-1 text-xs text-mutedText">
                      {community.membersCount} membros
                    </p>
                  </Link>
                ))}
                {!loading && communities.length === 0 && (
                  <p className="text-sm text-mutedText">
                    Ainda não participa de comunidades.
                  </p>
                )}
              </div>
            </div>
          </section>

          {isOwnProfile && (
            <section className="mt-4 rounded-2xl border border-accent/30 bg-accentSoft p-4">
              <div className="flex items-center gap-2 text-accent">
                <FaBookmark />
                <h2 className="text-base font-semibold">Posts salvos</h2>
              </div>
              <p className="mt-2 text-sm leading-6 text-mutedText">
                Use a aba Salvos para voltar em conversas importantes sem
                precisar procurar no feed.
              </p>
            </section>
          )}

          <section className="mt-4 overflow-hidden rounded-2xl border border-borderDark bg-panel/90 shadow-lg">
            <div className="grid h-12 grid-cols-2 border-b border-borderDark text-sm">
              <button
                onClick={() => setActiveTab("posts")}
                className={`relative font-semibold transition-colors hover:bg-secondary/50 ${
                  activeTab === "posts" ? "text-primary" : "text-mutedText"
                }`}
              >
                Posts
                {activeTab === "posts" && (
                  <span className="absolute bottom-0 left-1/2 h-1 w-16 -translate-x-1/2 rounded-full bg-accent" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("saved")}
                disabled={!isOwnProfile}
                className={`relative font-semibold transition-colors hover:bg-secondary/50 disabled:cursor-not-allowed disabled:opacity-40 ${
                  activeTab === "saved" ? "text-primary" : "text-mutedText"
                }`}
              >
                Salvos
                {activeTab === "saved" && (
                  <span className="absolute bottom-0 left-1/2 h-1 w-16 -translate-x-1/2 rounded-full bg-accent" />
                )}
              </button>
            </div>
            <ForumContainer
              posts={visiblePosts}
              loading={loading}
              fetch={fetchProfile}
              setPosts={activeTab === "posts" ? setPosts : setSavedPosts}
            />
          </section>
        </div>
      </div>
    </LayoutForum>
  );
};

export default ProfilePage;

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
