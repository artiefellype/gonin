import { UserProps } from "@/types";
import { BaseAPI } from "./baseAPI";

export class UserServices {
  static getUserById = async (userId: string): Promise<UserProps> => {
    try {
      const response = await new BaseAPI().getUserById(userId);
      return response as UserProps;
    } catch (error) {
      throw error;
    }
  };

  static updateUser = async ( newData: UserProps): Promise<void> => {
    try {
      await new BaseAPI().updateUser(newData);
    } catch (error) {
      throw error
    }
  }

  static searchUsers = async (
    searchTerm: string,
    currentUserId?: string
  ): Promise<UserProps[]> => {
    try {
      return await new BaseAPI().searchUsers(searchTerm, currentUserId);
    } catch (error) {
      throw error;
    }
  };

  static checkUserNameAvailability = async (
    userName: string,
    currentUserId?: string
  ): Promise<boolean> => {
    try {
      return await new BaseAPI().isUserNameAvailable(userName, currentUserId);
    } catch (error) {
      throw error;
    }
  };
}
