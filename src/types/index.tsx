export interface UserProps {
  createdAt: string;
  displayName: string;
  email: string;
  id: string;
  photoURL: string;
  posts: string[];
  member: boolean;
  tag: string;
  searchName?: string;
  username?: string;
  searchUsername?: string;
  uid: string;
  bio?: string;
  location?: string;
  profileBanner?: string;
  friendCount?: number;
  savedCount?: number;
  communityId?: string;
  communities?: string[];
}

export interface CommunityProps {
  id: string;
  title: string;
  slug: string;
  description: string;
  avatar?: string;
  banner?: string;
  ownerId: string;
  membersCount: number;
  postsCount: number;
  createdAt: string;
  isSystem?: boolean;
  visibility?: "public" | "private";
}

export interface FriendshipProps {
  id: string;
  requesterId: string;
  addresseeId: string;
  participants: string[];
  status: "pending" | "accepted";
  createdAt: string;
  updatedAt: string;
}

export interface CommunityInviteProps {
  id: string;
  communityId: string;
  communityTitle: string;
  inviterId: string;
  inviteeId: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
  updatedAt: string;
}

export interface NotificationProps {
  id: string;
  recipientId: string;
  actorId: string;
  postId: string;
  type: "like" | "comment" | "share" | "mention";
  status: "active" | "dismissed";
  message?: string;
  createdAt: string;
}

export interface PostProps {
  id: string;
  userId: string;
  user?: UserProps;
  mediaFile: string;
  mediaType?: "image" | "video";
  thumbnailUrl?: string;
  title: string;
  description: string;
  likeCount: number;
  commentCount: number;
  savedCount?: number;
  shareCount?: number;
  tags: string[];
  communityId?: string;
  community?: CommunityProps | null;
  createdAt: string;
  pinned: boolean;
  postType?: "original" | "share";
  originalPostId?: string;
  originalUserId?: string;
  originalPost?: PostProps | null;
  originalUser?: UserProps | null;
  sharedByText?: string;
}

export interface PaginatedPostsProps {
  posts: PostProps[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface PostCommentsProps {
  id: string;
  user_id: string;
  content: string;
  createdAt: string;
}

export interface PostCommentWithUserProps extends PostCommentsProps {
  user?: UserProps | null;
}

export interface SavedPostProps {
  id: string;
  postId: string;
  userId: string;
  createdAt: string;
}
