import { FriendshipProps, UserProps } from "@/types";
import { BaseAPI } from "./baseAPI";

export class FriendshipServices {
  static sendRequest = async (
    requesterId: string,
    addresseeId: string
  ): Promise<FriendshipProps> => {
    try {
      return await new BaseAPI().sendFriendRequest(requesterId, addresseeId);
    } catch (error) {
      throw error;
    }
  };

  static acceptRequest = async (
    friendshipId: string,
    userId: string
  ): Promise<FriendshipProps | null> => {
    try {
      return await new BaseAPI().respondFriendRequest(
        friendshipId,
        userId,
        true
      );
    } catch (error) {
      throw error;
    }
  };

  static declineRequest = async (
    friendshipId: string,
    userId: string
  ): Promise<FriendshipProps | null> => {
    try {
      return await new BaseAPI().respondFriendRequest(
        friendshipId,
        userId,
        false
      );
    } catch (error) {
      throw error;
    }
  };

  static removeFriend = async (
    firstUserId: string,
    secondUserId: string
  ): Promise<void> => {
    try {
      await new BaseAPI().removeFriend(firstUserId, secondUserId);
    } catch (error) {
      throw error;
    }
  };

  static getFriendshipBetween = async (
    firstUserId: string,
    secondUserId: string
  ): Promise<FriendshipProps | null> => {
    try {
      return await new BaseAPI().getFriendshipBetween(firstUserId, secondUserId);
    } catch (error) {
      throw error;
    }
  };

  static getFriendIds = async (userId: string): Promise<string[]> => {
    try {
      return await new BaseAPI().getFriendIds(userId);
    } catch (error) {
      throw error;
    }
  };

  static getFriends = async (userId: string): Promise<UserProps[]> => {
    try {
      return await new BaseAPI().getFriends(userId);
    } catch (error) {
      throw error;
    }
  };

  static getPendingRequests = async (
    userId: string
  ): Promise<FriendshipProps[]> => {
    try {
      return await new BaseAPI().getPendingFriendRequests(userId);
    } catch (error) {
      throw error;
    }
  };
}
