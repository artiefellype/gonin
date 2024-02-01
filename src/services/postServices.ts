import { MessagesProps } from "@/types"
import { BaseAPI } from "./baseAPI"



export class postsServices {
    static getPosts = (): Promise<MessagesProps[]> =>{
        const response = (new BaseAPI).get('/messages')
        return response
    }


}