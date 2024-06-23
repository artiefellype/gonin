export interface MessagesProps {
    id: string;
    user_id: string;
    user_Name: string;
    user_photo_url: string;
    title: string;
    description: string;
    created_at: string;
    liked_list: string[];
    likesCount: number;
} // REMOVE

export interface UserProps {
    createdAt: string;
    displayName: string;
    email: string;
    id: string;
    photoURL: string;
    posts: string[];
    uid: string;
}

export interface PostProps {
    id: string;
    userId: string;
    user: UserProps;
    mediaFile: string;
    title: string;
    description: string;
    likeCount: number;
    commentCount: number;
    createdAt: string;
}

export interface PostCommentsProps {
    id: string;
    user_id: string;
    content: string;
}

export interface ForumProps {
    messages: MessagesProps[]
    onDelete: (msgRef: string) => void;
    onUpdate: (msgRef: string, msg: MessagesProps) => void;
    onLike: (value: boolean, data: MessagesProps) =>  void;
} // REMOVE

export interface HomeProps {
    posts: PostProps[]
}

export interface ForumCardProps {
    post: MessagesProps;
    onDelete: ForumProps['onDelete'];
    onUpdate: ForumProps['onUpdate'];
    selectedCard: (value: string) => void;
    showModal: (value: boolean) =>  void;
    onLike: (value: boolean, data: MessagesProps) =>  void;
} // REMOVE

export interface PostCardProps {
    post: PostProps;
    // onDelete: ForumProps['onDelete'];
    // onUpdate: ForumProps['onUpdate'];
    // selectedCard: (value: string) => void;
    // showModal: (value: boolean) =>  void;
    // onLike: (value: boolean, data: MessagesProps) =>  void;
}

