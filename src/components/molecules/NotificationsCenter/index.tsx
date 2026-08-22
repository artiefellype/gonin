import { useUserContext } from "@/context";
import { firestore } from "@/firebase/firebase";
import { CommunityServices } from "@/services/communityServices";
import { FriendshipServices } from "@/services/friendshipServices";
import { postsServices } from "@/services/postServices";
import { UserServices } from "@/services/userServices";
import {
  CommunityInviteProps,
  FriendshipProps,
  NotificationProps,
  UserProps,
} from "@/types";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { FaBell, FaCheck, FaTimes, FaUserFriends } from "react-icons/fa";

type RequestWithUser = FriendshipProps & {
  requester?: UserProps | null;
};

type CommunityInviteWithUser = CommunityInviteProps & {
  inviter?: UserProps | null;
};

type NotificationWithActor = NotificationProps & {
  actor?: UserProps | null;
};

interface NotificationsCenterProps {
  compact?: boolean;
  label?: boolean;
}

const notifyFriendshipChanged = (friendship: FriendshipProps | null) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("gonin:friendship-updated", {
      detail: { friendship },
    })
  );
};

export const NotificationsCenter = ({
  compact = false,
  label = false,
}: NotificationsCenterProps) => {
  const { user } = useUserContext();
  const loggedUserId = user?.user?.uid || "";
  const [open, setOpen] = useState(false);
  const [requests, setRequests] = useState<RequestWithUser[]>([]);
  const [communityInvites, setCommunityInvites] = useState<
    CommunityInviteWithUser[]
  >([]);
  const [postNotifications, setPostNotifications] = useState<
    NotificationWithActor[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [invitesLoading, setInvitesLoading] = useState(true);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [mounted, setMounted] = useState(false);

  const pendingCount =
    requests.length + communityInvites.length + postNotifications.length;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loggedUserId) {
      setRequests([]);
      setCommunityInvites([]);
      setPostNotifications([]);
      setLoading(false);
      setInvitesLoading(false);
      setNotificationsLoading(false);
      return;
    }

    setLoading(true);
    const requestsQuery = query(
      collection(firestore, "friendships"),
      where("addresseeId", "==", loggedUserId),
      where("status", "==", "pending")
    );

    const unsubscribe = onSnapshot(
      requestsQuery,
      async (snapshot) => {
        const pendingRequests = snapshot.docs
          .map((requestDoc) => ({
            id: requestDoc.id,
            ...requestDoc.data(),
          }))
          .sort(
            (a, b) =>
              new Date((b as FriendshipProps).createdAt).getTime() -
              new Date((a as FriendshipProps).createdAt).getTime()
          ) as FriendshipProps[];

        const hydratedRequests = await Promise.all(
          pendingRequests.map(async (request) => {
            try {
              const requester = await UserServices.getUserById(
                request.requesterId
              );
              return { ...request, requester };
            } catch (error) {
              console.error("Erro ao carregar solicitante:", error);
              return { ...request, requester: null };
            }
          })
        );

        setRequests(hydratedRequests);
        setLoading(false);
      },
      (error) => {
        console.error("Erro ao carregar notificações:", error);
        setMessage("Não foi possível carregar seus pedidos agora.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [loggedUserId]);

  useEffect(() => {
    if (!loggedUserId) {
      setCommunityInvites([]);
      setInvitesLoading(false);
      return;
    }

    setInvitesLoading(true);
    const invitesQuery = query(
      collection(firestore, "communityInvites"),
      where("inviteeId", "==", loggedUserId),
      where("status", "==", "pending")
    );

    const unsubscribe = onSnapshot(
      invitesQuery,
      async (snapshot) => {
        const pendingInvites = snapshot.docs
          .map((inviteDoc) => ({
            id: inviteDoc.id,
            ...inviteDoc.data(),
          }))
          .sort(
            (a, b) =>
              new Date((b as CommunityInviteProps).createdAt).getTime() -
              new Date((a as CommunityInviteProps).createdAt).getTime()
          ) as CommunityInviteProps[];

        const hydratedInvites = await Promise.all(
          pendingInvites.map(async (invite) => {
            try {
              const inviter = await UserServices.getUserById(invite.inviterId);
              return { ...invite, inviter };
            } catch (error) {
              console.error("Erro ao carregar convite:", error);
              return { ...invite, inviter: null };
            }
          })
        );

        setCommunityInvites(hydratedInvites);
        setInvitesLoading(false);
      },
      (error) => {
        console.error("Erro ao carregar convites:", error);
        setMessage("Não foi possível carregar seus convites agora.");
        setInvitesLoading(false);
      }
    );

    return () => unsubscribe();
  }, [loggedUserId]);

  useEffect(() => {
    if (!loggedUserId) {
      setPostNotifications([]);
      setNotificationsLoading(false);
      return;
    }

    setNotificationsLoading(true);
    const notificationsQuery = query(
      collection(firestore, "notifications"),
      where("recipientId", "==", loggedUserId),
      where("status", "==", "active")
    );

    const unsubscribe = onSnapshot(
      notificationsQuery,
      async (snapshot) => {
        const notifications = snapshot.docs
          .map((notificationDoc) => ({
            id: notificationDoc.id,
            ...notificationDoc.data(),
          }))
          .sort(
            (a, b) =>
              new Date((b as NotificationProps).createdAt).getTime() -
              new Date((a as NotificationProps).createdAt).getTime()
          ) as NotificationProps[];

        const hydratedNotifications = await Promise.all(
          notifications.map(async (notification) => {
            try {
              const actor = await UserServices.getUserById(
                notification.actorId
              );
              return { ...notification, actor };
            } catch (error) {
              console.error("Erro ao carregar autor da notificação:", error);
              return { ...notification, actor: null };
            }
          })
        );

        setPostNotifications(hydratedNotifications);
        setNotificationsLoading(false);
      },
      (error) => {
        console.error("Erro ao carregar notificações de posts:", error);
        setMessage("Não foi possível carregar suas notificações agora.");
        setNotificationsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [loggedUserId]);

  useEffect(() => {
    if (!open) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  const title = useMemo(() => {
    if (pendingCount === 0) return "Notificações";
    if (pendingCount === 1) return "1 notificação pendente";
    return `${pendingCount} notificações pendentes`;
  }, [pendingCount]);
  const badgeClassName = compact
    ? "absolute -right-1 -top-1 z-10 grid min-h-[18px] min-w-[18px] place-items-center rounded-full border-2 border-panel bg-accent px-1 text-[10px] font-black leading-none text-background shadow-lg"
    : "absolute right-1 top-1 z-10 grid min-h-[18px] min-w-[18px] place-items-center rounded-full bg-accent px-1 text-[10px] font-black leading-none text-background";

  const handleAccept = async (request: RequestWithUser) => {
    if (!loggedUserId || actionId) return;

    setActionId(request.id);
    setMessage("");
    try {
      const response = await FriendshipServices.acceptRequest(
        request.id,
        loggedUserId
      );
      setRequests((current) =>
        current.filter((item) => item.id !== request.id)
      );
      notifyFriendshipChanged(response);
      setMessage("Pedido aceito.");
    } catch (error) {
      console.error("Erro ao aceitar pedido:", error);
      setMessage("Não foi possível aceitar esse pedido.");
    } finally {
      setActionId(null);
    }
  };

  const handleDecline = async (request: RequestWithUser) => {
    if (!loggedUserId || actionId) return;

    setActionId(request.id);
    setMessage("");
    try {
      await FriendshipServices.declineRequest(request.id, loggedUserId);
      setRequests((current) =>
        current.filter((item) => item.id !== request.id)
      );
      notifyFriendshipChanged(null);
      setMessage("Pedido recusado.");
    } catch (error) {
      console.error("Erro ao recusar pedido:", error);
      setMessage("Não foi possível recusar esse pedido.");
    } finally {
      setActionId(null);
    }
  };

  const handleAcceptCommunityInvite = async (invite: CommunityInviteWithUser) => {
    if (!loggedUserId || actionId) return;

    setActionId(invite.id);
    setMessage("");
    try {
      await CommunityServices.joinCommunity(invite.communityId, loggedUserId);
      setCommunityInvites((current) =>
        current.filter((item) => item.id !== invite.id)
      );
      setMessage("Convite aceito.");
    } catch (error) {
      console.error("Erro ao aceitar convite:", error);
      setMessage("Não foi possível aceitar esse convite.");
    } finally {
      setActionId(null);
    }
  };

  const handleDeclineCommunityInvite = async (
    invite: CommunityInviteWithUser
  ) => {
    if (!loggedUserId || actionId) return;

    setActionId(invite.id);
    setMessage("");
    try {
      await CommunityServices.declineInvite(invite.id, loggedUserId);
      setCommunityInvites((current) =>
        current.filter((item) => item.id !== invite.id)
      );
      setMessage("Convite recusado.");
    } catch (error) {
      console.error("Erro ao recusar convite:", error);
      setMessage("Não foi possível recusar esse convite.");
    } finally {
      setActionId(null);
    }
  };

  const handleDismissPostNotification = async (
    notification: NotificationWithActor
  ) => {
    if (!loggedUserId || actionId) return;

    setActionId(notification.id);
    setMessage("");
    try {
      await postsServices.dismissNotification(notification.id, loggedUserId);
      setPostNotifications((current) =>
        current.filter((item) => item.id !== notification.id)
      );
      setMessage("Notificação dispensada.");
    } catch (error) {
      console.error("Erro ao dispensar notificação:", error);
      setMessage("Não foi possível dispensar essa notificação.");
    } finally {
      setActionId(null);
    }
  };

  const getPostNotificationText = (notification: NotificationWithActor) => {
    const actorName = notification.actor?.displayName || "Alguém";

    if (notification.type === "like") return `${actorName} curtiu seu post.`;
    if (notification.type === "comment") {
      return `${actorName} comentou no seu post.`;
    }
    if (notification.type === "mention") {
      return `${actorName} marcou você em um post.`;
    }
    return `${actorName} compartilhou seu post.`;
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          label
            ? "relative flex h-12 items-center gap-4 rounded-full px-3 text-[16px] font-normal text-primary/90 transition-colors hover:bg-secondary md:justify-center md:px-0 lg:justify-start lg:px-3"
            : "relative grid h-10 w-10 shrink-0 place-items-center overflow-visible rounded-full border border-borderDark bg-secondary text-mutedText transition-colors hover:border-accent hover:text-accent"
        }
        aria-label={title}
      >
        <FaBell size={label ? 21 : compact ? 18 : 20} />
        {label && <span className="hidden lg:inline">Notificações</span>}
        {pendingCount > 0 && (
          <span className={badgeClassName} aria-hidden="true">
            {pendingCount > 9 ? "9+" : pendingCount}
          </span>
        )}
      </button>

      {open &&
        mounted &&
        createPortal(
        <div
          className={
            compact
              ? "fixed inset-0 z-[9999] overflow-hidden bg-black/35 backdrop-blur-[1px] sm:bg-transparent sm:backdrop-blur-0"
              : "fixed inset-0 z-[9999] flex items-end justify-center overflow-hidden bg-black/70 px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-sm sm:items-center sm:p-6"
          }
          onMouseDown={() => setOpen(false)}
        >
          <section
            className={
              compact
                ? "absolute left-3 right-3 top-[calc(3.5rem+0.5rem)] mx-auto flex max-h-[calc(100svh-5rem)] max-w-[420px] flex-col overflow-hidden rounded-2xl border border-borderDark bg-panel shadow-2xl ring-1 ring-accent/10 sm:left-auto sm:right-4 sm:top-20 sm:w-[420px]"
                : "flex max-h-[calc(100svh-1.5rem)] w-full max-w-[520px] flex-col overflow-hidden rounded-t-2xl border border-borderDark bg-panel shadow-2xl sm:max-h-[86svh] sm:rounded-2xl"
            }
            role="dialog"
            aria-modal="true"
            aria-labelledby="notifications-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="flex shrink-0 items-center justify-between gap-3 border-b border-borderDark px-4 py-3 sm:items-start sm:px-5 sm:py-4">
              <div className="min-w-0">
                <h2
                  id="notifications-title"
                  className="truncate text-base font-semibold text-primary sm:text-lg"
                >
                  Notificações
                </h2>
                <p className="mt-1 hidden text-sm text-mutedText sm:block">
                  Pedidos, convites e conversas que envolvem você.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-mutedText transition-colors hover:bg-secondary hover:text-primary"
                aria-label="Fechar notificações"
              >
                <FaTimes size={16} />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2.5 py-2.5 sm:px-5 sm:py-3">
              {message && (
                <p className="mb-3 rounded-lg border border-borderDark bg-secondary px-3 py-2 text-sm text-mutedText">
                  {message}
                </p>
              )}

              {(loading || invitesLoading || notificationsLoading) && (
                <div className="space-y-3">
                  {[0, 1].map((item) => (
                    <div
                      key={item}
                      className="h-20 animate-pulse rounded-xl bg-secondary"
                    />
                  ))}
                </div>
              )}

              {!loading &&
                !invitesLoading &&
                !notificationsLoading &&
                requests.length === 0 &&
                communityInvites.length === 0 &&
                postNotifications.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-accentSoft text-accent">
                    <FaUserFriends size={22} />
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-primary">
                    Nada pendente por enquanto
                  </h3>
                  <p className="mt-1 max-w-xs text-sm text-mutedText">
                    Quando chegar algo novo, você decide por aqui.
                  </p>
                </div>
              )}

              {!notificationsLoading && postNotifications.length > 0 && (
                <div className="space-y-3">
                  {postNotifications.map((notification) => {
                    const actor = notification.actor;
                    const actorName = actor?.displayName || "Usuário do Gonin";

                    return (
                      <article
                        key={notification.id}
                        className="rounded-xl border border-borderDark bg-background p-2.5 sm:p-3"
                      >
                        <div className="flex min-w-0 gap-3">
                          <Link
                            href={`/profile/${notification.actorId}`}
                            onClick={() => setOpen(false)}
                            className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-secondary sm:h-11 sm:w-11"
                          >
                            <Image
                              src={actor?.photoURL || "/imgs/default_perfil.jpg"}
                              alt={actorName}
                              width={44}
                              height={44}
                              className="h-full w-full object-cover"
                            />
                          </Link>

                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/post/${notification.postId}`}
                              onClick={() => setOpen(false)}
                              className="block break-words text-sm font-semibold text-primary hover:text-accent"
                            >
                              {getPostNotificationText(notification)}
                            </Link>
                            {notification.message && (
                              <p className="mt-1 line-clamp-2 break-words text-sm text-mutedText">
                                {notification.message}
                              </p>
                            )}
                            <button
                              type="button"
                              onClick={() =>
                                handleDismissPostNotification(notification)
                              }
                              disabled={actionId === notification.id}
                              className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-full border border-borderDark px-4 text-sm font-semibold text-mutedText transition-colors hover:border-accent hover:text-accent disabled:cursor-wait disabled:opacity-70 sm:w-auto"
                            >
                              <FaTimes size={12} />
                              Dispensar
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

              {!loading && requests.length > 0 && (
                <div className="mt-3 space-y-3">
                  {requests.map((request) => {
                    const requester = request.requester;
                    const requesterName =
                      requester?.displayName ||
                      "Usuário do Gonin";

                    return (
                      <article
                        key={request.id}
                        className="rounded-xl border border-borderDark bg-background p-2.5 sm:p-3"
                      >
                        <div className="flex min-w-0 gap-3">
                          <Link
                            href={`/profile/${request.requesterId}`}
                            onClick={() => setOpen(false)}
                            className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-secondary sm:h-11 sm:w-11"
                          >
                            <Image
                              src={
                                requester?.photoURL ||
                                "/imgs/default_perfil.jpg"
                              }
                              alt={requesterName}
                              width={44}
                              height={44}
                              className="h-full w-full object-cover"
                            />
                          </Link>

                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/profile/${request.requesterId}`}
                              onClick={() => setOpen(false)}
                              className="block truncate text-sm font-semibold text-primary hover:text-accent"
                            >
                              {requesterName}
                            </Link>
                            <p className="mt-1 text-sm text-mutedText">
                              quer ser seu amigo.
                            </p>

                            <div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                              <button
                                type="button"
                                onClick={() => handleAccept(request)}
                                disabled={actionId === request.id}
                                className="inline-flex h-9 items-center justify-center gap-2 rounded-full bg-accent px-4 text-sm font-semibold text-background transition-colors hover:bg-accent/90 disabled:cursor-wait disabled:opacity-70"
                              >
                                <FaCheck size={12} />
                                Aceitar
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDecline(request)}
                                disabled={actionId === request.id}
                                className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-borderDark px-4 text-sm font-semibold text-mutedText transition-colors hover:border-coral hover:text-coral disabled:cursor-wait disabled:opacity-70"
                              >
                                <FaTimes size={12} />
                                Dispensar
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

              {!invitesLoading && communityInvites.length > 0 && (
                <div className="mt-3 space-y-3">
                  {communityInvites.map((invite) => {
                    const inviterName =
                      invite.inviter?.displayName || "Usuário do Gonin";

                    return (
                      <article
                        key={invite.id}
                        className="rounded-xl border border-borderDark bg-background p-2.5 sm:p-3"
                      >
                        <div className="flex min-w-0 gap-3">
                          <Link
                            href={`/profile/${invite.inviterId}`}
                            onClick={() => setOpen(false)}
                            className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-secondary sm:h-11 sm:w-11"
                          >
                            <Image
                              src={
                                invite.inviter?.photoURL ||
                                "/imgs/default_perfil.jpg"
                              }
                              alt={inviterName}
                              width={44}
                              height={44}
                              className="h-full w-full object-cover"
                            />
                          </Link>

                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/profile/${invite.inviterId}`}
                              onClick={() => setOpen(false)}
                              className="block truncate text-sm font-semibold text-primary hover:text-accent"
                            >
                              {inviterName}
                            </Link>
                            <p className="mt-1 break-words text-sm text-mutedText">
                              convidou você para{" "}
                              <Link
                                href={`/topics/${invite.communityId}`}
                                onClick={() => setOpen(false)}
                                className="font-semibold text-accent hover:underline"
                              >
                                {invite.communityTitle}
                              </Link>
                              .
                            </p>

                            <div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                              <button
                                type="button"
                                onClick={() =>
                                  handleAcceptCommunityInvite(invite)
                                }
                                disabled={actionId === invite.id}
                                className="inline-flex h-9 items-center justify-center gap-2 rounded-full bg-accent px-4 text-sm font-semibold text-background transition-colors hover:bg-accent/90 disabled:cursor-wait disabled:opacity-70"
                              >
                                <FaCheck size={12} />
                                Aceitar
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleDeclineCommunityInvite(invite)
                                }
                                disabled={actionId === invite.id}
                                className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-borderDark px-4 text-sm font-semibold text-mutedText transition-colors hover:border-coral hover:text-coral disabled:cursor-wait disabled:opacity-70"
                              >
                                <FaTimes size={12} />
                                Dispensar
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>,
        document.body
      )}
    </>
  );
};
