import { PostProps } from "@/types";
import { BaseAPI } from "./baseAPI";
import { DocumentData } from "firebase/firestore";

export class postsServices {
    static getPosts = async (): Promise<any[]> => {
        try {
          const baseAPI = new BaseAPI();
          const posts = await baseAPI.get('posts');
    
          const postsWithUserDetails = await Promise.all(
            posts.map(async (post) => {
              // Verifique se post.userId está definido antes de usá-lo
              if (post.userId) {
                const user = await baseAPI.getUserById(post.userId);
                return { ...post, user };
              } else {
                console.error(`Post with id ${post.id} does not have a userId`);
                return post;
              }
            })
          );
    
          return postsWithUserDetails;
        } catch (error) {
          throw error;
        }
      }

  static getSubcollection = async (postId: string, subcollectionName: string): Promise<any[]> => {
    try {
      const response = await (new BaseAPI()).getSubcollection('posts', postId, subcollectionName);
      return response as any[];
    } catch (error) {
      throw error;
    }
  }

  static getPostTagQuantity = async (tag: string): Promise<number> => {
    try {
      const response = await (new BaseAPI()).countPostsByTag(tag);
      return response as number;
    } catch (err) {
      throw err
    }
  }

  static getPostsByTag = async (tag: string, lastDoc: DocumentData | null, pageSize: number = 10): Promise<any> => {
    try {
      const response = await (new BaseAPI()).getPostsByTag(tag, lastDoc, pageSize )
      return response as any
    } catch (error) {
      throw error
    }
  }

}
