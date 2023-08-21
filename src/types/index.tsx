export interface MessagesProps {
    id: string;
    user_id: string;
    user_Name: string;
    user_photo_url: string;
    title: string;
    description: string;
    created_at: string;
}

export interface ForumProps {
    messages: MessagesProps[]
    onDelete: (msgRef: string) => void;
    onUpdate: (msgRef: string, msg: MessagesProps) => void;
}
