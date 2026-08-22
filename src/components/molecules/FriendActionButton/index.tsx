import { useUserContext } from "@/context";
import { FriendshipServices } from "@/services/friendshipServices";
import { FriendshipProps } from "@/types";
import React, { useEffect, useState } from "react";

interface FriendActionButtonProps {
  targetUserId: string;
  compact?: boolean;
  onChanged?: (friendship: FriendshipProps | null) => void;
}

const friendshipCache = new Map<string, FriendshipProps | null>();

const getCacheKey = (firstUserId: string, secondUserId: string) =>
  [firstUserId, secondUserId].sort().join("_");

export const FriendActionButton = ({
  targetUserId,
  compact = false,
  onChanged,
}: FriendActionButtonProps) => {
  const { user } = useUserContext();
  const loggedUserId = user?.user?.uid || "";
  const [friendship, setFriendship] = useState<FriendshipProps | null>(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const isOwnUser = !!loggedUserId && loggedUserId === targetUserId;
  const isFriend = friendship?.status === "accepted";

  useEffect(() => {
    const fetchFriendship = async () => {
      if (!loggedUserId || !targetUserId || isOwnUser) {
        setLoaded(true);
        return;
      }

      const cacheKey = getCacheKey(loggedUserId, targetUserId);
      if (friendshipCache.has(cacheKey)) {
        setFriendship(friendshipCache.get(cacheKey) || null);
        setLoaded(true);
        return;
      }

      try {
        const response = await FriendshipServices.getFriendshipBetween(
          loggedUserId,
          targetUserId
        );
        friendshipCache.set(cacheKey, response);
        setFriendship(response);
      } catch (error: any) {
        console.error(error.message);
      } finally {
        setLoaded(true);
      }
    };

    fetchFriendship();
  }, [isOwnUser, loggedUserId, targetUserId]);

  const updateFriendship = (nextFriendship: FriendshipProps | null) => {
    const cacheKey = getCacheKey(loggedUserId, targetUserId);
    friendshipCache.set(cacheKey, nextFriendship);
    setFriendship(nextFriendship);
    onChanged?.(nextFriendship);
  };

  const handleFriendAction = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();
    if (!loggedUserId || !targetUserId || loading || isOwnUser) return;

    setLoading(true);
    try {
      if (!friendship) {
        const response = await FriendshipServices.sendRequest(
          loggedUserId,
          targetUserId
        );
        updateFriendship(response);
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
        updateFriendship(response);
      }
    } catch (error: any) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!loaded || isOwnUser || isFriend) return null;

  const isIncomingRequest =
    friendship?.status === "pending" && friendship.addresseeId === loggedUserId;
  const isOutgoingRequest =
    friendship?.status === "pending" && friendship.requesterId === loggedUserId;
  const buttonText = loading
    ? "..."
    : isIncomingRequest
      ? "Aceitar"
      : isOutgoingRequest
        ? "Enviado"
        : compact
          ? "Adicionar"
          : "Adicionar amigo";

  return (
    <button
      onClick={handleFriendAction}
      disabled={loading || isOutgoingRequest}
      className={
        compact
          ? "h-8 shrink-0 rounded-full border border-accent/40 bg-accentSoft px-3 text-xs font-semibold text-accent transition-colors hover:border-accent disabled:cursor-not-allowed disabled:opacity-70"
          : "h-10 rounded-lg bg-accent px-4 text-sm font-semibold text-background transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-70"
      }
    >
      {buttonText}
    </button>
  );
};
