import { useUserContext } from "@/context";
import { firestore } from "@/firebase/firebase";
import { FriendshipServices } from "@/services/friendshipServices";
import { UserServices } from "@/services/userServices";
import { FriendshipProps, UserProps } from "@/types";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { FaBell, FaCheck, FaTimes, FaUserFriends } from "react-icons/fa";

type RequestWithUser = FriendshipProps & {
  requester?: UserProps | null;
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
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const pendingCount = requests.length;

  useEffect(() => {
    if (!loggedUserId) {
      setRequests([]);
      setLoading(false);
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
    if (!open) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  const title = useMemo(() => {
    if (pendingCount === 0) return "Notificações";
    if (pendingCount === 1) return "1 pedido de amizade";
    return `${pendingCount} pedidos de amizade`;
  }, [pendingCount]);

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

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          label
            ? "relative flex h-12 items-center gap-4 rounded-full px-3 text-[16px] font-normal text-primary/90 transition-colors hover:bg-secondary md:justify-center md:px-0 lg:justify-start lg:px-3"
            : "relative grid h-10 w-10 shrink-0 place-items-center rounded-full border border-borderDark bg-secondary text-mutedText transition-colors hover:border-accent hover:text-accent"
        }
        aria-label={title}
      >
        <FaBell size={label ? 21 : compact ? 18 : 20} />
        {label && <span className="hidden lg:inline">Notificações</span>}
        {pendingCount > 0 && (
          <span className="absolute right-1 top-1 grid min-h-[18px] min-w-[18px] place-items-center rounded-full bg-accent px-1 text-[10px] font-black leading-none text-background">
            {pendingCount > 9 ? "9+" : pendingCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 px-3 pb-3 pt-12 backdrop-blur-sm sm:items-center sm:p-6"
          onMouseDown={() => setOpen(false)}
        >
          <section
            className="flex max-h-[86svh] w-full max-w-[520px] flex-col overflow-hidden rounded-2xl border border-borderDark bg-panel shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="notifications-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="flex items-start justify-between gap-4 border-b border-borderDark px-4 py-4 sm:px-5">
              <div>
                <h2
                  id="notifications-title"
                  className="text-lg font-semibold text-primary"
                >
                  Notificações
                </h2>
                <p className="mt-1 text-sm text-mutedText">
                  Pedidos de amizade recebidos.
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

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 sm:px-5">
              {message && (
                <p className="mb-3 rounded-lg border border-borderDark bg-secondary px-3 py-2 text-sm text-mutedText">
                  {message}
                </p>
              )}

              {loading && (
                <div className="space-y-3">
                  {[0, 1].map((item) => (
                    <div
                      key={item}
                      className="h-20 animate-pulse rounded-xl bg-secondary"
                    />
                  ))}
                </div>
              )}

              {!loading && requests.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-accentSoft text-accent">
                    <FaUserFriends size={22} />
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-primary">
                    Nada pendente por enquanto
                  </h3>
                  <p className="mt-1 max-w-xs text-sm text-mutedText">
                    Quando alguém pedir amizade, você decide por aqui.
                  </p>
                </div>
              )}

              {!loading && requests.length > 0 && (
                <div className="space-y-3">
                  {requests.map((request) => {
                    const requester = request.requester;
                    const requesterName =
                      requester?.displayName ||
                      "Usuário do Gonin";

                    return (
                      <article
                        key={request.id}
                        className="rounded-xl border border-borderDark bg-background p-3"
                      >
                        <div className="flex gap-3">
                          <Link
                            href={`/profile/${request.requesterId}`}
                            onClick={() => setOpen(false)}
                            className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-secondary"
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

                            <div className="mt-3 flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => handleAccept(request)}
                                disabled={actionId === request.id}
                                className="inline-flex h-9 items-center gap-2 rounded-full bg-accent px-4 text-sm font-semibold text-background transition-colors hover:bg-accent/90 disabled:cursor-wait disabled:opacity-70"
                              >
                                <FaCheck size={12} />
                                Aceitar
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDecline(request)}
                                disabled={actionId === request.id}
                                className="inline-flex h-9 items-center gap-2 rounded-full border border-borderDark px-4 text-sm font-semibold text-mutedText transition-colors hover:border-coral hover:text-coral disabled:cursor-wait disabled:opacity-70"
                              >
                                <FaTimes size={12} />
                                Recusar
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
        </div>
      )}
    </>
  );
};
