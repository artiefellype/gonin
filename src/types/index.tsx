
export interface UserProps {
    createdAt: string;
    displayName: string;
    email: string;
    id: string;
    photoURL: string;
    posts: string[];
    member: boolean;
    tag: string;
    uid: string;
}

export interface PostProps {
    id: string;
    userId: string;
    user?: UserProps;
    mediaFile: string;
    title: string;
    description: string;
    likeCount: number;
    commentCount: number;
    tags: string[];
    createdAt: string;
}

export interface PostCommentsProps {
    id: string;
    user_id: string;
    content: string;
}


export interface PostCardProps {
    post: PostProps;
    fetch: () => Promise<void>
    onDelete: (id: string) => void;
}

