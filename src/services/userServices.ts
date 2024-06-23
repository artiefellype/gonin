import { BaseAPI } from "./baseAPI";

export class UserServices {
    static getUserById = async (userId: string): Promise<any> => {
        try {
          const response = await (new BaseAPI()).getUserById(userId);
          return response;
        } catch (error) {
          throw error;
        }
      }
}