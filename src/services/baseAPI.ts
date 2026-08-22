import { getAuth, onAuthStateChanged, updateProfile } from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  CollectionReference,
  DocumentReference,
  query,
  where,
  DocumentData,
  orderBy,
  startAfter,
  limit,
  QueryDocumentSnapshot,
  addDoc,
  increment,
  arrayUnion,
  arrayRemove,
  deleteField,
} from "firebase/firestore";
import { fireApp, storage } from "@/firebase/firebase";
import {
  CommunityProps,
  CommunityInviteProps,
  FriendshipProps,
  NotificationProps,
  PaginatedPostsProps,
  PostCommentsProps,
  PostCommentWithUserProps,
  PostProps,
  UserProps,
} from "@/types";
import { deleteObject, ref, getStorage } from "firebase/storage";

export class BaseAPI {
  private auth;
  private db;

  constructor() {
    this.auth = getAuth(fireApp);
    this.db = getFirestore(fireApp);
  }

  private async getUser() {
    return new Promise((resolve, reject) => {
      onAuthStateChanged(this.auth, (user) => {
        if (user) {
          resolve(user);
        } else {
          reject("Usuário não autenticado");
        }
      });
    });
  }

  private async getCommunityByIdSafe(
    communityId?: string
  ): Promise<CommunityProps | null> {
    if (!communityId) return null;

    try {
      const communityRef = doc(this.db, "communities", communityId);
      const communitySnap = await getDoc(communityRef);

      if (!communitySnap.exists()) return null;

      return {
        id: communitySnap.id,
        ...communitySnap.data(),
      } as CommunityProps;
    } catch (error) {
      console.error("Error fetching community: ", error);
      return null;
    }
  }

  private normalizeSearchValue(value?: string | null) {
    return (value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  private async hydratePost(
    postData: PostProps,
    includeOriginal: boolean = true
  ): Promise<PostProps> {
    let user: UserProps | undefined;
    let community: CommunityProps | null = null;
    let originalPost: PostProps | null = null;

    if (postData.userId) {
      try {
        user = (await this.getUserById(postData.userId)) as UserProps;
      } catch (error) {
        console.error(`Post with id ${postData.id} has an invalid userId`);
      }
    }

    community = await this.getCommunityByIdSafe(
      postData.communityId || postData.tags?.[0]
    );

    if (includeOriginal && postData.postType === "share" && postData.originalPostId) {
      try {
        const originalRef = doc(this.db, "posts", postData.originalPostId);
        const originalSnap = await getDoc(originalRef);

        if (originalSnap.exists()) {
          originalPost = await this.hydratePost(
            {
              id: originalSnap.id,
              ...originalSnap.data(),
            } as PostProps,
            false
          );
        }
      } catch (error) {
        console.error("Error fetching shared post: ", error);
      }
    }

    return {
      ...postData,
      user,
      community,
      originalPost,
      mediaType:
        postData.mediaType ||
        (postData.mediaFile?.includes("/video/upload/") ? "video" : "image"),
      postType: postData.postType || "original",
      savedCount: postData.savedCount || 0,
      shareCount: postData.shareCount || 0,
    };
  }

  private getFriendshipId(firstUserId: string, secondUserId: string) {
    return [firstUserId, secondUserId].sort().join("_");
  }

  private async canViewCommunity(
    communityId: string | undefined,
    userId: string
  ) {
    if (!communityId) return true;

    const communityRef = doc(this.db, "communities", communityId);
    const communitySnap = await getDoc(communityRef);

    if (!communitySnap.exists()) return true;

    const community = {
      id: communitySnap.id,
      ...communitySnap.data(),
    } as CommunityProps;

    if (community.visibility !== "private") return true;
    if (community.ownerId === userId) return true;

    const memberSnap = await getDoc(doc(communityRef, "members", userId));
    return memberSnap.exists();
  }

  private getPostCommunityIds(postData: PostProps) {
    const communityIds = new Set<string>();

    if (postData.communityId) communityIds.add(postData.communityId);
    postData.tags?.forEach((tag) => {
      if (tag) communityIds.add(tag);
    });

    return Array.from(communityIds);
  }

  private isPostLinkedToCommunity(postData: PostProps, communityId: string) {
    return this.getPostCommunityIds(postData).includes(communityId);
  }

  private async canViewPost(
    postData: PostProps,
    userId: string
  ): Promise<boolean> {
    const communityIds = this.getPostCommunityIds(postData);
    const canViewOwnPostCommunities = await Promise.all(
      communityIds.map((communityId) =>
        this.canViewCommunity(communityId, userId)
      )
    );

    if (canViewOwnPostCommunities.some((canView) => !canView)) return false;

    if (postData.postType === "share" && postData.originalPostId) {
      const originalRef = doc(this.db, "posts", postData.originalPostId);
      const originalSnap = await getDoc(originalRef);

      if (originalSnap.exists()) {
        return this.canViewPost(
          {
            id: originalSnap.id,
            ...originalSnap.data(),
          } as PostProps,
          userId
        );
      }
    }

    return true;
  }

  private async isPrivateCommunity(communityId: string): Promise<boolean> {
    const community = await this.getCommunityByIdSafe(communityId);
    return community?.visibility === "private";
  }

  private async belongsToPrivateCommunity(
    postData: PostProps
  ): Promise<boolean> {
    const communityIds = this.getPostCommunityIds(postData);
    const privateChecks = await Promise.all(
      communityIds.map((communityId) => this.isPrivateCommunity(communityId))
    );

    if (privateChecks.some(Boolean)) return true;

    if (postData.postType === "share" && postData.originalPostId) {
      const originalRef = doc(this.db, "posts", postData.originalPostId);
      const originalSnap = await getDoc(originalRef);

      if (originalSnap.exists()) {
        return this.belongsToPrivateCommunity({
          id: originalSnap.id,
          ...originalSnap.data(),
        } as PostProps);
      }
    }

    return false;
  }

  private async canShowPostOutsideCommunity(postData: PostProps) {
    return !(await this.belongsToPrivateCommunity(postData));
  }

  private getPostCursor(postData: PostProps) {
    return postData.createdAt || null;
  }

  private removeUndefinedFields<T extends Record<string, any>>(data: T): T {
    return Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined)
    ) as T;
  }

  private async updateCommunityPostCount(
    postData: PostProps,
    amount: number
  ) {
    const communityIds = this.getPostCommunityIds(postData);

    await Promise.all(
      communityIds.map(async (communityId) => {
        const communityRef = doc(this.db, "communities", communityId);
        const communitySnap = await getDoc(communityRef);

        if (!communitySnap.exists()) return;
        await updateDoc(communityRef, { postsCount: increment(amount) });
      })
    );
  }

  private async createPostNotification(
    type: NotificationProps["type"],
    postData: PostProps,
    actorId: string,
    message: string = "",
    recipientId: string = postData.userId
  ) {
    if (!postData.id || !recipientId || recipientId === actorId) return;

    const notificationRef = doc(collection(this.db, "notifications"));
    const notification: NotificationProps = {
      id: notificationRef.id,
      recipientId,
      actorId,
      postId: postData.id,
      type,
      status: "active",
      message,
      createdAt: new Date().toISOString(),
    };

    await setDoc(notificationRef, notification);
  }

  private extractMentionSearchNames(postData: PostProps) {
    const mentionRegex = /(^|[^\wÀ-ÿ])@([A-Za-zÀ-ÿ0-9._-]{2,48})/g;
    const searchableText = [
      postData.title,
      postData.description,
      postData.sharedByText,
    ]
      .filter(Boolean)
      .join(" ");
    const mentions = new Set<string>();
    let match: RegExpExecArray | null;

    while ((match = mentionRegex.exec(searchableText)) !== null) {
      const searchName = this.normalizeSearchValue(match[2]);
      if (searchName) mentions.add(searchName);
    }

    return Array.from(mentions);
  }

  private async findUsersBySearchNames(
    searchNames: string[]
  ): Promise<UserProps[]> {
    if (searchNames.length === 0) return [];

    const uniqueSearchNames = Array.from(new Set(searchNames));
    const chunks = [];

    for (let index = 0; index < uniqueSearchNames.length; index += 10) {
      chunks.push(uniqueSearchNames.slice(index, index + 10));
    }

    const snapshots = await Promise.all(
      chunks.map((chunk) => {
        const usersQuery = query(
          collection(this.db, "users"),
          where("searchName", "in", chunk)
        );
        return getDocs(usersQuery);
      })
    );
    const usersMap = new Map<string, UserProps>();

    snapshots.forEach((snapshot) => {
      snapshot.docs.forEach((userDoc) => {
        const userData = {
          id: userDoc.id,
          ...userDoc.data(),
        } as UserProps;
        const userId = userData.uid || userData.id;

        if (userId) usersMap.set(userId, userData);
      });
    });

    return Array.from(usersMap.values());
  }

  private getMentionNotificationMessage(postData: PostProps) {
    const message = [postData.title, postData.description, postData.sharedByText]
      .filter(Boolean)
      .join(" ")
      .trim();

    return message.length > 180 ? `${message.slice(0, 177)}...` : message;
  }

  private async createMentionNotifications(
    postData: PostProps,
    actorId: string
  ) {
    const mentionSearchNames = this.extractMentionSearchNames(postData);
    if (mentionSearchNames.length === 0) return;

    const mentionedUsers = await this.findUsersBySearchNames(
      mentionSearchNames
    );
    const message = this.getMentionNotificationMessage(postData);

    await Promise.all(
      mentionedUsers.map(async (mentionedUser) => {
        const recipientId = mentionedUser.uid || mentionedUser.id;

        if (!recipientId || recipientId === actorId) return;

        const canView = await this.canViewPost(postData, recipientId).catch(
          () => false
        );

        if (!canView) return;

        await this.createPostNotification(
          "mention",
          postData,
          actorId,
          message,
          recipientId
        );
      })
    );
  }

  private async canPostInCommunity(communityId: string, userId: string) {
    const communityRef = doc(this.db, "communities", communityId);
    const communitySnap = await getDoc(communityRef);

    if (!communitySnap.exists()) {
      throw new Error("Comunidade não encontrada.");
    }

    const community = {
      id: communitySnap.id,
      ...communitySnap.data(),
    } as CommunityProps;

    if (community.ownerId === userId) return true;

    const memberSnap = await getDoc(doc(communityRef, "members", userId));
    return memberSnap.exists();
  }

  async get(collectionName: string, subcollectionName?: string) {
    try {
      const user = await this.getUser();
      let collectionRef: CollectionReference | DocumentReference = collection(
        this.db,
        collectionName
      );

      if (subcollectionName) {
        collectionRef = doc(this.db, collectionName).withConverter({
          toFirestore: (data) => data,
          fromFirestore: (snapshot) => ({
            id: snapshot.id,
            ...snapshot.data(),
          }),
        });
        collectionRef = collection(collectionRef, subcollectionName);
      }

      const q = query(collectionRef, orderBy('createdAt', 'desc'));

      const querySnapshot = await getDocs(q);

      const data: any[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });

      return data;
    } catch (error) {
      throw error;
    }
  }

  async getPostsWithDetails(): Promise<PostProps[]> {
    try {
      const authenticatedUser = (await this.getUser()) as { uid: string };
      const postsCollectionRef = collection(this.db, "posts");
      const postsQuery = query(postsCollectionRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(postsQuery);
      const visiblePosts = (
        await Promise.all(
          querySnapshot.docs.map(async (postDoc) => {
            const postData = {
              id: postDoc.id,
              ...postDoc.data(),
            } as PostProps;

            const canShow = await this.canViewPost(
              postData,
              authenticatedUser.uid
            );
            return canShow ? postData : null;
          })
        )
      ).filter(Boolean) as PostProps[];

      const posts = await Promise.all(
        visiblePosts.map((postData) => this.hydratePost(postData))
      );

      return posts;
    } catch (error) {
      throw error;
    }
  }

  async getPostsWithDetailsPage(
    cursor: string | null = null,
    pageSize: number = 10
  ): Promise<PaginatedPostsProps> {
    try {
      const authenticatedUser = (await this.getUser()) as { uid: string };
      const postsCollectionRef = collection(this.db, "posts");
      const queryLimit = pageSize + 1;
      const postsQuery = cursor
        ? query(
            postsCollectionRef,
            where("createdAt", "<", cursor),
            orderBy("createdAt", "desc"),
            limit(queryLimit)
          )
        : query(
            postsCollectionRef,
            orderBy("createdAt", "desc"),
            limit(queryLimit)
          );
      const querySnapshot = await getDocs(postsQuery);
      const pageDocs = querySnapshot.docs.slice(0, pageSize);
      const visiblePosts = (
        await Promise.all(
          pageDocs.map(async (postDoc) => {
            const postData = {
              id: postDoc.id,
              ...postDoc.data(),
            } as PostProps;

            const canShow = await this.canViewPost(
              postData,
              authenticatedUser.uid
            );
            return canShow ? postData : null;
          })
        )
      ).filter(Boolean) as PostProps[];

      const posts = await Promise.all(
        visiblePosts.map((postData) => this.hydratePost(postData))
      );
      const lastRawPost = pageDocs[pageDocs.length - 1];
      const lastRawData = lastRawPost
        ? ({
            id: lastRawPost.id,
            ...lastRawPost.data(),
          } as PostProps)
        : null;

      return {
        posts,
        nextCursor: lastRawData ? this.getPostCursor(lastRawData) : null,
        hasMore: querySnapshot.docs.length > pageSize,
      };
    } catch (error) {
      throw error;
    }
  }

  async getPostWithDetails(postId: string): Promise<PostProps> {
    try {
      const authenticatedUser = (await this.getUser()) as { uid: string };
      const postRef = doc(this.db, "posts", postId);
      const postSnap = await getDoc(postRef);

      if (!postSnap.exists()) {
        throw new Error(`No document found with id: ${postId}`);
      }

      const postData = {
        id: postSnap.id,
        ...postSnap.data(),
      } as PostProps;
      const canView = await this.canViewPost(postData, authenticatedUser.uid);

      if (!canView) {
        throw new Error("Você precisa participar da comunidade para ver este post.");
      }

      return await this.hydratePost(postData);
    } catch (error) {
      throw error;
    }
  }

  async getPostsByUserIds(userIds: string[]): Promise<PostProps[]> {
    try {
      const authenticatedUser = (await this.getUser()) as { uid: string };
      if (userIds.length === 0) return [];

      const uniqueIds = Array.from(new Set(userIds));
      const chunks = [];

      for (let i = 0; i < uniqueIds.length; i += 10) {
        chunks.push(uniqueIds.slice(i, i + 10));
      }

      const postSnapshots = await Promise.all(
        chunks.map((chunk) => {
          const postsCollectionRef = collection(this.db, "posts");
          const postsQuery = query(
            postsCollectionRef,
            where("userId", "in", chunk)
          );
          return getDocs(postsQuery);
        })
      );

      const postsMap = new Map<string, PostProps>();

      postSnapshots.forEach((snapshot) => {
        snapshot.docs.forEach((postDoc) => {
          postsMap.set(postDoc.id, {
            id: postDoc.id,
            ...postDoc.data(),
          } as PostProps);
        });
      });
      const visiblePosts = (
        await Promise.all(
          Array.from(postsMap.values()).map(async (postData) => {
            const canShow = await this.canViewPost(
              postData,
              authenticatedUser.uid
            );
            return canShow ? postData : null;
          })
        )
      ).filter(Boolean) as PostProps[];

      const posts = await Promise.all(
        visiblePosts.map((post) => this.hydratePost(post))
      );

      return posts.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      throw error;
    }
  }

  async getPostsByUserIdsPage(
    userIds: string[],
    cursor: string | null = null,
    pageSize: number = 10
  ): Promise<PaginatedPostsProps> {
    try {
      const authenticatedUser = (await this.getUser()) as { uid: string };
      if (userIds.length === 0) {
        return { posts: [], nextCursor: null, hasMore: false };
      }

      const uniqueIds = Array.from(new Set(userIds));
      const chunks = [];

      for (let i = 0; i < uniqueIds.length; i += 10) {
        chunks.push(uniqueIds.slice(i, i + 10));
      }

      const postSnapshots = await Promise.all(
        chunks.map((chunk) => {
          const postsCollectionRef = collection(this.db, "posts");
          const queryLimit = pageSize + 1;
          const postsQuery = cursor
            ? query(
                postsCollectionRef,
                where("userId", "in", chunk),
                where("createdAt", "<", cursor),
                orderBy("createdAt", "desc"),
                limit(queryLimit)
              )
            : query(
                postsCollectionRef,
                where("userId", "in", chunk),
                orderBy("createdAt", "desc"),
                limit(queryLimit)
              );
          return getDocs(postsQuery);
        })
      );

      const postsMap = new Map<string, PostProps>();

      postSnapshots.forEach((snapshot) => {
        snapshot.docs.forEach((postDoc) => {
          postsMap.set(postDoc.id, {
            id: postDoc.id,
            ...postDoc.data(),
          } as PostProps);
        });
      });

      const visiblePosts = (
        await Promise.all(
          Array.from(postsMap.values()).map(async (postData) => {
            const canShow = await this.canViewPost(
              postData,
              authenticatedUser.uid
            );
            return canShow ? postData : null;
          })
        )
      )
        .filter(Boolean)
        .sort(
          (a, b) =>
            new Date((b as PostProps).createdAt).getTime() -
            new Date((a as PostProps).createdAt).getTime()
        ) as PostProps[];
      const pagePosts = visiblePosts.slice(0, pageSize);
      const posts = await Promise.all(
        pagePosts.map((post) => this.hydratePost(post))
      );
      const lastPost = pagePosts[pagePosts.length - 1];

      return {
        posts,
        nextCursor: lastPost ? this.getPostCursor(lastPost) : null,
        hasMore:
          visiblePosts.length > pageSize ||
          postSnapshots.some((snapshot) => snapshot.docs.length > pageSize),
      };
    } catch (error) {
      throw error;
    }
  }

  async getPostsByUserId(userId: string): Promise<PostProps[]> {
    return this.getPostsByUserIds([userId]);
  }

  async add(collectionName: string, newData: any) {
    try {
      const user = (await this.getUser()) as { uid: string };
      if (collectionName === "posts") {
        const postData = newData as PostProps;
        const communityId = postData.communityId || postData.tags?.[0];

        if (communityId) {
          const canPost = await this.canPostInCommunity(communityId, user.uid);
          if (!canPost) {
            throw new Error(
              "Você precisa participar da comunidade para postar."
            );
          }
        }
      }

      const collectionRef = collection(this.db, collectionName);
      const docRef = doc(collectionRef);
      const documentData =
        collectionName === "posts"
          ? { ...newData, id: docRef.id }
          : newData;

      await setDoc(docRef, this.removeUndefinedFields(documentData));

      if (collectionName === "posts") {
        const postData = documentData as PostProps;

        await this.updateCommunityPostCount(postData, 1);
        await this.createMentionNotifications(postData, user.uid);
      }

      return docRef.id;
    } catch (error) {
      throw error;
    }
  }

  async addSubCollection(
    collectionName: any,
    docId: any,
    subCollectionName: any,
    content?: any
  ) {
    try {
      const subCollectionRef = collection(
        doc(this.db, collectionName, docId),
        subCollectionName
      );
      const subDocRef = await addDoc(subCollectionRef, content ? content : {});
      return subDocRef;
    } catch (error) {
      throw error;
    }
  }

  async update(collectionName: string, docId: string, newData: any) {
    try {
      const user = await this.getUser();
      const docRef = doc(this.db, collectionName, docId);
      await updateDoc(docRef, this.removeUndefinedFields(newData));
    } catch (error) {
      throw error;
    }
  }

  async updateUser(user: UserProps) {
    try {
      const authenticatedUser = (await this.getUser()) as { uid: string };
      const targetUserId = user.uid || user.id;
      const normalizedDisplayName = this.normalizeSearchValue(
        user.displayName
      );

      if (authenticatedUser.uid !== targetUserId) {
        throw new Error("Você só pode editar o próprio perfil.");
      }

      if (!normalizedDisplayName) {
        throw new Error("Informe um nome de usuário.");
      }

      const userRef = doc(this.db, "users", targetUserId);
      const currentUserSnapshot = await getDoc(userRef);
      const currentUserData = currentUserSnapshot.data() as
        | UserProps
        | undefined;
      const currentSearchName = this.normalizeSearchValue(
        currentUserData?.searchName || currentUserData?.displayName
      );

      if (
        normalizedDisplayName !== currentSearchName &&
        !(await this.isUserNameAvailable(user.displayName, targetUserId))
      ) {
        throw new Error("Nome de usuário já está em uso.");
      }

      await updateDoc(userRef, {
        uid: targetUserId,
        displayName: user.displayName,
        searchName: normalizedDisplayName,
        tag: user.tag,
        member: user.member,
        photoURL: user.photoURL,
        posts: user.posts,
        bio: user.bio || "",
        location: user.location || "",
        profileBanner: user.profileBanner || "",
        friendCount: user.friendCount || 0,
        savedCount: user.savedCount || 0,
        communityId: user.communityId || "",
        communities: user.communities || [],
      });

      if (this.auth.currentUser) {
        await updateProfile(this.auth.currentUser, {
          displayName: user.displayName || null,
          photoURL: user.photoURL || null,
        });
      }
    } catch (error) {
      throw error;
    }
  }

  async isUserNameAvailable(
    userName: string,
    currentUserId?: string
  ): Promise<boolean> {
    try {
      await this.getUser();
      const normalizedName = this.normalizeSearchValue(userName);

      if (!normalizedName) return false;

      const usersQuery = query(
        collection(this.db, "users"),
        where("searchName", "==", normalizedName)
      );
      const usersSnapshot = await getDocs(usersQuery);

      return usersSnapshot.docs.every((userDoc) => {
        const userData = userDoc.data();
        const foundUserId = userData.uid || userDoc.id;

        return Boolean(currentUserId && foundUserId === currentUserId);
      });
    } catch (error) {
      throw error;
    }
  }

  async remove(collectionName: string, docId: string) {
    try {
      const user = await this.getUser();
      const docRef = doc(this.db, collectionName, docId);

      const docSnapshot = await getDoc(docRef);
      if (!docSnapshot.exists()) {
        throw new Error("Documento não encontrado");
      }

      const removedData = {
        id: docSnapshot.id,
        ...docSnapshot.data(),
      } as PostProps;
      const imageData = docSnapshot.data().mediaFile;

      await this.removeSubCollection(docRef, "comments");
      await this.removeSubCollection(docRef, "likes");

      if (
        imageData &&
        (imageData.startsWith("gs://") ||
          imageData.includes("firebasestorage.googleapis.com"))
      ) {
        const storageRef = getStorage();
        const imageStorageRef = ref(storageRef, imageData);
        await deleteObject(imageStorageRef);
      }

      await deleteDoc(docRef);

      if (collectionName === "posts") {
        await this.updateCommunityPostCount(removedData, -1);
      }
    } catch (error) {
      throw error;
    }
  }

  async removeSubCollection(
    docRef: DocumentReference,
    subCollectionName: string
  ) {
    try {
      const subCollectionRef = collection(docRef, subCollectionName);
      const snapshot = await getDocs(subCollectionRef);
      snapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });
    } catch (error) {
      throw error;
    }
  }

  async getDocById(collectionName: string, docId: string) {
    try {
      const user = await this.getUser();
      const docRef = doc(this.db, collectionName, docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        throw new Error(`No document found with id: ${docId}`);
      }
    } catch (error) {
      throw error;
    }
  }

  async addCommentToPost(postId: string, comment: PostCommentsProps) {
    try {
      const postRef = doc(this.db, "posts", postId);
      const postSnap = await getDoc(postRef);
      const commentsCollectionRef = collection(postRef, "comments");

      const docRef = await addDoc(commentsCollectionRef, comment);

      await updateDoc(docRef, { id: docRef.id });

      await updateDoc(postRef, {
        commentCount: increment(1),
      });

      if (postSnap.exists()) {
        await this.createPostNotification(
          "comment",
          {
            id: postSnap.id,
            ...postSnap.data(),
          } as PostProps,
          comment.user_id,
          comment.content
        );
      }
    } catch (error) {
      console.error("Error adding comment: ", error);
    }
  }

  async getCommentsForPost(
    postId: string
  ): Promise<PostCommentWithUserProps[]> {
    try {
      const postRef = doc(this.db, "posts", postId);
      const commentsCollectionRef = collection(postRef, "comments");
      const commentsQuery = query(commentsCollectionRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(commentsQuery);
  
      const comments: PostCommentsProps[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as PostCommentsProps[];
  
      const commentsWithUser: PostCommentWithUserProps[] = await Promise.all(
        comments.map(async (comment) => {
          const userRef = doc(this.db, "users", comment.user_id);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const user = userDoc.data() as UserProps;
            return { ...comment, user };
          }
          return comment as PostCommentWithUserProps;
        })
      );
  
      return commentsWithUser;
    } catch (error) {
      console.error("Error fetching comments: ", error);
      return [];
    }
  }

  async getSubcollection(
    collectionName: string,
    docId: string,
    subcollectionName: string
  ) {
    try {
      const user = await this.getUser();
      const docRef = doc(this.db, collectionName, docId);
      const subcollectionRef = collection(docRef, subcollectionName);
      const querySnapshot = await getDocs(subcollectionRef);

      const data: any[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });

      return data;
    } catch (error) {
      throw error;
    }
  }

  async getUserById(userId: string) {
    try {
      const user = await this.getUser();
      const docRef = doc(this.db, "users", userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        throw new Error(`No user found with id: ${userId}`);
      }
    } catch (error) {
      throw error;
    }
  }

  async searchUsers(
    searchTerm: string,
    currentUserId?: string
  ): Promise<UserProps[]> {
    try {
      await this.getUser();
      const normalizedTerm = this.normalizeSearchValue(searchTerm);

      if (normalizedTerm.length < 2) return [];

      const usersSnapshot = await getDocs(collection(this.db, "users"));
      const users = usersSnapshot.docs.map((userDoc) => ({
        id: userDoc.id,
        ...userDoc.data(),
      })) as UserProps[];

      return users
        .filter((foundUser) => {
          const userId = foundUser.uid || foundUser.id;
          if (currentUserId && userId === currentUserId) return false;

          const searchableText = [
            foundUser.searchName,
            foundUser.displayName,
            foundUser.tag,
          ]
            .map((value) => this.normalizeSearchValue(value))
            .join(" ");

          return searchableText.includes(normalizedTerm);
        })
        .sort((a, b) => {
          const aName = this.normalizeSearchValue(a.displayName);
          const bName = this.normalizeSearchValue(b.displayName);
          const aStarts = aName.startsWith(normalizedTerm);
          const bStarts = bName.startsWith(normalizedTerm);

          if (aStarts !== bStarts) return aStarts ? -1 : 1;
          return aName.localeCompare(bName);
        })
        .slice(0, 10);
    } catch (error) {
      throw error;
    }
  }

  async countPostsByTag(tag: string) {
    try {
      const postsRef = collection(this.db, "posts");
      const q = query(postsRef, where("tags", "array-contains", tag));
      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
    } catch (error) {
      throw error;
    }
  }

  async countPostsByCommunity(communityId: string): Promise<number> {
    try {
      await this.getUser();
      const postsRef = collection(this.db, "posts");
      const byCommunityQuery = query(
        postsRef,
        where("communityId", "==", communityId)
      );
      const byTagQuery = query(
        postsRef,
        where("tags", "array-contains", communityId)
      );
      const [communitySnapshot, tagSnapshot] = await Promise.all([
        getDocs(byCommunityQuery),
        getDocs(byTagQuery),
      ]);
      const postIds = new Set<string>();

      communitySnapshot.docs.forEach((postDoc) => postIds.add(postDoc.id));
      tagSnapshot.docs.forEach((postDoc) => postIds.add(postDoc.id));

      return postIds.size;
    } catch (error) {
      throw error;
    }
  }

  async getActiveCommunitiesByRecentPosts(
    maxCommunities: number = 3,
    scanLimit: number = 100
  ): Promise<CommunityProps[]> {
    try {
      await this.getUser();
      const postsRef = collection(this.db, "posts");
      const postsQuery = query(
        postsRef,
        orderBy("createdAt", "desc"),
        limit(scanLimit)
      );
      const postsSnapshot = await getDocs(postsQuery);
      const recentCommunityIds = new Map<string, string>();

      postsSnapshot.docs.forEach((postDoc) => {
        const postData = {
          id: postDoc.id,
          ...postDoc.data(),
        } as PostProps;

        this.getPostCommunityIds(postData).forEach((communityId) => {
          if (!recentCommunityIds.has(communityId)) {
            recentCommunityIds.set(communityId, postData.createdAt);
          }
        });
      });

      const communities = await Promise.all(
        Array.from(recentCommunityIds.entries()).map(
          async ([communityId, latestPostAt]) => {
            const community = await this.getCommunityByIdSafe(communityId);
            if (!community) return null;

            let postsCount = community.postsCount || 0;
            try {
              postsCount = await this.countPostsByCommunity(communityId);
            } catch (error) {
              console.error("Error counting community posts: ", error);
            }

            return {
              ...community,
              postsCount,
              latestPostAt,
            } as CommunityProps & { latestPostAt: string };
          }
        )
      );
      const activeCommunities = communities.filter(
        (community): community is CommunityProps & { latestPostAt: string } =>
          Boolean(community)
      );

      return activeCommunities
        .sort(
          (a, b) =>
            new Date(b.latestPostAt).getTime() -
            new Date(a.latestPostAt).getTime()
        )
        .slice(0, maxCommunities)
        .map(({ latestPostAt, ...community }) => community) as CommunityProps[];
    } catch (error) {
      throw error;
    }
  }

  async getPostsByTag(
    tag: string,
    lastDoc: DocumentData | null = null,
    pageSize: number
  ) {
    try {
      const postsCollectionRef = collection(this.db, "posts");
      let q;

      if (lastDoc) {
        q = query(
          postsCollectionRef,
          where("tags", "array-contains", tag),
          orderBy("createdAt"),
          startAfter(lastDoc),
          limit(pageSize)
        );
      } else {
        q = query(
          postsCollectionRef,
          where("tags", "array-contains", tag),
          orderBy("createdAt"),
          limit(pageSize)
        );
      }

      const querySnapshot = await getDocs(q);
      const posts: PostProps[] = [];

      for (const doc of querySnapshot.docs) {
        const postData = { id: doc.id, ...doc.data() } as PostProps;
        posts.push(await this.hydratePost(postData));
      }

      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

      return { posts, lastVisible };
    } catch (error: any) {
      throw new Error(`Erro ao buscar posts por tag: ${error.message}`);
    }
  }

  async likePost(docId: string, userId: string) {
    try {
      const postRef = doc(this.db, "posts", docId);

      const likesCollectionRef = collection(postRef, "likes");

      const q = query(likesCollectionRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        querySnapshot.forEach(async (docSnapshot) => {
          await deleteDoc(docSnapshot.ref);
        });
        await updateDoc(postRef, {
          likeCount: increment(-1),
        });
      } else {
        await addDoc(likesCollectionRef, {
          userId: userId,
        });
        await updateDoc(postRef, {
          likeCount: increment(1),
        });
        const postSnap = await getDoc(postRef);
        if (postSnap.exists()) {
          await this.createPostNotification(
            "like",
            {
              id: postSnap.id,
              ...postSnap.data(),
            } as PostProps,
            userId
          );
        }
      }
    } catch (error) {
      throw error;
    }
  }

  async checkIfUserLiked(postId: string, userId: string): Promise<boolean> {
    try {
      const postRef = doc(this.db, "posts", postId);
      const likesCollectionRef = collection(postRef, "likes");

      const q = query(likesCollectionRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);

      return !querySnapshot.empty;
    } catch (error) {
      throw error;
    }
  }

  async toggleSavedPost(postId: string, userId: string): Promise<boolean> {
    try {
      await this.getUser();
      const savedRef = doc(this.db, "users", userId, "savedPosts", postId);
      const postRef = doc(this.db, "posts", postId);
      const userRef = doc(this.db, "users", userId);
      const savedSnap = await getDoc(savedRef);

      if (savedSnap.exists()) {
        await deleteDoc(savedRef);
        await updateDoc(postRef, { savedCount: increment(-1) });
        await updateDoc(userRef, { savedCount: increment(-1) });
        return false;
      }

      await setDoc(savedRef, {
        id: postId,
        postId,
        userId,
        createdAt: new Date().toISOString(),
      });
      await updateDoc(postRef, { savedCount: increment(1) });
      await updateDoc(userRef, { savedCount: increment(1) });
      return true;
    } catch (error) {
      throw error;
    }
  }

  async checkIfUserSavedPost(
    postId: string,
    userId: string
  ): Promise<boolean> {
    try {
      await this.getUser();
      const savedRef = doc(this.db, "users", userId, "savedPosts", postId);
      const savedSnap = await getDoc(savedRef);
      return savedSnap.exists();
    } catch (error) {
      throw error;
    }
  }

  async getSavedPostsByUser(userId: string): Promise<PostProps[]> {
    try {
      await this.getUser();
      const savedCollectionRef = collection(
        this.db,
        "users",
        userId,
        "savedPosts"
      );
      const savedQuery = query(
        savedCollectionRef,
        orderBy("createdAt", "desc")
      );
      const savedSnapshot = await getDocs(savedQuery);
      const posts: PostProps[] = [];

      for (const savedDoc of savedSnapshot.docs) {
        const postId = savedDoc.data().postId as string;
        const postRef = doc(this.db, "posts", postId);
        const postSnap = await getDoc(postRef);

        if (postSnap.exists()) {
          posts.push(
            await this.hydratePost({
              id: postSnap.id,
              ...postSnap.data(),
            } as PostProps)
          );
        }
      }

      return posts;
    } catch (error) {
      throw error;
    }
  }

  async sharePost(
    originalPostId: string,
    userId: string,
    description: string = ""
  ): Promise<PostProps> {
    try {
      await this.getUser();
      const originalPostRef = doc(this.db, "posts", originalPostId);
      const originalPostSnap = await getDoc(originalPostRef);

      if (!originalPostSnap.exists()) {
        throw new Error("Post original não encontrado.");
      }

      const originalPost = {
        id: originalPostSnap.id,
        ...originalPostSnap.data(),
      } as PostProps;
      const postsCollectionRef = collection(this.db, "posts");
      const newPostRef = doc(postsCollectionRef);
      const createdAt = new Date().toISOString();
      const sharedPost: PostProps = this.removeUndefinedFields({
        id: newPostRef.id,
        userId,
        mediaFile: "",
        title: "",
        description,
        likeCount: 0,
        commentCount: 0,
        savedCount: 0,
        shareCount: 0,
        tags: originalPost.tags || [],
        communityId: originalPost.communityId || originalPost.tags?.[0],
        createdAt,
        pinned: false,
        postType: "share",
        originalPostId,
        originalUserId: originalPost.userId,
      } as PostProps);

      await setDoc(newPostRef, sharedPost);
      await this.addSubCollection("posts", newPostRef.id, "comments");
      await this.addSubCollection("posts", newPostRef.id, "likes");
      await this.updateCommunityPostCount(sharedPost, 1);
      await updateDoc(originalPostRef, { shareCount: increment(1) });
      await this.createMentionNotifications(sharedPost, userId);
      await this.createPostNotification(
        "share",
        originalPost,
        userId,
        description
      );
      await updateDoc(doc(this.db, "users", userId), {
        posts: arrayUnion(newPostRef.id),
      });

      return this.hydratePost(sharedPost);
    } catch (error) {
      throw error;
    }
  }

  async dismissNotification(
    notificationId: string,
    userId: string
  ): Promise<void> {
    try {
      const authenticatedUser = (await this.getUser()) as { uid: string };
      if (authenticatedUser.uid !== userId) {
        throw new Error("Você só pode dispensar suas notificações.");
      }

      const notificationRef = doc(this.db, "notifications", notificationId);
      const notificationSnap = await getDoc(notificationRef);

      if (!notificationSnap.exists()) return;

      const notification = {
        id: notificationSnap.id,
        ...notificationSnap.data(),
      } as NotificationProps;

      if (notification.recipientId !== userId) {
        throw new Error("Você só pode dispensar suas notificações.");
      }

      await updateDoc(notificationRef, { status: "dismissed" });
    } catch (error) {
      throw error;
    }
  }

  async getCommunities(): Promise<CommunityProps[]> {
    try {
      await this.getUser();
      const communitiesRef = collection(this.db, "communities");
      const communitiesQuery = query(communitiesRef, orderBy("createdAt", "desc"));
      const communitiesSnapshot = await getDocs(communitiesQuery);

      return communitiesSnapshot.docs.map((communityDoc) => ({
        id: communityDoc.id,
        ...communityDoc.data(),
      })) as CommunityProps[];
    } catch (error) {
      throw error;
    }
  }

  async getCommunityBySlug(slug: string): Promise<CommunityProps | null> {
    try {
      await this.getUser();
      const communityRef = doc(this.db, "communities", slug);
      const communitySnap = await getDoc(communityRef);

      if (!communitySnap.exists()) return null;

      return {
        id: communitySnap.id,
        ...communitySnap.data(),
      } as CommunityProps;
    } catch (error) {
      throw error;
    }
  }

  async createCommunity(
    community: Omit<CommunityProps, "id" | "membersCount" | "postsCount">
  ): Promise<CommunityProps> {
    try {
      await this.getUser();
      const userRef = doc(this.db, "users", community.ownerId);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data() as UserProps | undefined;

      if (userData?.communityId) {
        throw new Error("Cada usuário pode criar apenas uma comunidade.");
      }

      const communityRef = doc(this.db, "communities", community.slug);
      const communitySnap = await getDoc(communityRef);

      if (communitySnap.exists()) {
        throw new Error("Já existe uma comunidade com esse nome.");
      }

      const newCommunity: CommunityProps = {
        ...community,
        id: community.slug,
        membersCount: 1,
        postsCount: 0,
      };

      await setDoc(communityRef, newCommunity);
      await setDoc(doc(communityRef, "members", community.ownerId), {
        userId: community.ownerId,
        role: "owner",
        createdAt: new Date().toISOString(),
      });
      await updateDoc(userRef, {
        communityId: community.slug,
        communities: arrayUnion(community.slug),
      });

      return newCommunity;
    } catch (error) {
      throw error;
    }
  }

  async ensureCommunity(community: CommunityProps): Promise<CommunityProps> {
    try {
      await this.getUser();
      const communityRef = doc(this.db, "communities", community.slug);
      const communitySnap = await getDoc(communityRef);

      if (communitySnap.exists()) {
        return {
          id: communitySnap.id,
          ...communitySnap.data(),
        } as CommunityProps;
      }

      await setDoc(communityRef, community);
      return community;
    } catch (error) {
      throw error;
    }
  }

  async joinCommunity(communityId: string, userId: string): Promise<boolean> {
    try {
      const authenticatedUser = (await this.getUser()) as { uid: string };
      if (authenticatedUser.uid !== userId) {
        throw new Error("Você só pode entrar usando a própria conta.");
      }

      const communityRef = doc(this.db, "communities", communityId);
      const communitySnap = await getDoc(communityRef);

      if (!communitySnap.exists()) {
        throw new Error("Comunidade não encontrada.");
      }

      const community = {
        id: communitySnap.id,
        ...communitySnap.data(),
      } as CommunityProps;
      const memberRef = doc(communityRef, "members", userId);
      const memberSnap = await getDoc(memberRef);

      if (memberSnap.exists()) return true;

      const inviteId = `${communityId}_${userId}`;
      const inviteRef = doc(this.db, "communityInvites", inviteId);
      const inviteSnap = await getDoc(inviteRef);

      if (community.visibility === "private") {
        const invite = inviteSnap.exists()
          ? ({
              id: inviteSnap.id,
              ...inviteSnap.data(),
            } as CommunityInviteProps)
          : null;

        if (!invite || invite.status !== "pending") {
          throw new Error("Esta comunidade é privada e exige convite.");
        }
      }

      await setDoc(memberRef, {
        userId,
        role: "member",
        createdAt: new Date().toISOString(),
      });
      await updateDoc(communityRef, { membersCount: increment(1) });
      await updateDoc(doc(this.db, "users", userId), {
        communities: arrayUnion(communityId),
      });
      if (inviteSnap.exists()) {
        await updateDoc(inviteRef, {
          status: "accepted",
          updatedAt: new Date().toISOString(),
        });
      }

      return true;
    } catch (error) {
      throw error;
    }
  }

  async leaveCommunity(communityId: string, userId: string): Promise<boolean> {
    try {
      await this.getUser();
      const communityRef = doc(this.db, "communities", communityId);
      const communitySnap = await getDoc(communityRef);
      const communityData = communitySnap.data() as CommunityProps | undefined;

      if (communityData?.ownerId === userId) {
        throw new Error("O criador não pode sair da própria comunidade.");
      }

      const memberRef = doc(communityRef, "members", userId);
      const memberSnap = await getDoc(memberRef);

      if (!memberSnap.exists()) return false;

      await deleteDoc(memberRef);
      await updateDoc(communityRef, { membersCount: increment(-1) });
      await updateDoc(doc(this.db, "users", userId), {
        communities: arrayRemove(communityId),
      });

      return false;
    } catch (error) {
      throw error;
    }
  }

  async deleteCommunity(communityId: string, userId: string): Promise<void> {
    try {
      const authenticatedUser = (await this.getUser()) as { uid: string };
      if (authenticatedUser.uid !== userId) {
        throw new Error("Você só pode apagar comunidades que pertencem a você.");
      }

      const communityRef = doc(this.db, "communities", communityId);
      const communitySnap = await getDoc(communityRef);

      if (!communitySnap.exists()) {
        throw new Error("Comunidade não encontrada.");
      }

      const community = {
        id: communitySnap.id,
        ...communitySnap.data(),
      } as CommunityProps;

      if (community.isSystem || community.ownerId === "system") {
        throw new Error("Comunidades do sistema não podem ser apagadas.");
      }

      if (community.ownerId !== userId) {
        throw new Error("Apenas o dono pode apagar esta comunidade.");
      }

      const membersRef = collection(communityRef, "members");
      const membersSnapshot = await getDocs(membersRef);

      await Promise.all(
        membersSnapshot.docs.map(async (memberDoc) => {
          const memberUserId = memberDoc.id;
          await deleteDoc(memberDoc.ref);
          await updateDoc(doc(this.db, "users", memberUserId), {
            communities: arrayRemove(communityId),
            ...(memberUserId === userId ? { communityId: "" } : {}),
          });
        })
      );

      const postsCollectionRef = collection(this.db, "posts");
      const byCommunityQuery = query(
        postsCollectionRef,
        where("communityId", "==", communityId)
      );
      const byTagQuery = query(
        postsCollectionRef,
        where("tags", "array-contains", communityId)
      );
      const [communityPostsSnapshot, taggedPostsSnapshot] = await Promise.all([
        getDocs(byCommunityQuery),
        getDocs(byTagQuery),
      ]);
      const postRefs = new Map<string, DocumentReference>();

      communityPostsSnapshot.docs.forEach((postDoc) => {
        postRefs.set(postDoc.id, postDoc.ref);
      });
      taggedPostsSnapshot.docs.forEach((postDoc) => {
        postRefs.set(postDoc.id, postDoc.ref);
      });

      await Promise.all(
        Array.from(postRefs.values()).map((postRef) =>
          updateDoc(postRef, {
            communityId: deleteField(),
            tags: arrayRemove(communityId),
          })
        )
      );

      const invitesQuery = query(
        collection(this.db, "communityInvites"),
        where("communityId", "==", communityId)
      );
      const invitesSnapshot = await getDocs(invitesQuery);
      await Promise.all(
        invitesSnapshot.docs.map((inviteDoc) => deleteDoc(inviteDoc.ref))
      );

      await deleteDoc(communityRef);
    } catch (error) {
      throw error;
    }
  }

  async inviteToCommunity(
    communityId: string,
    inviterId: string,
    inviteeId: string
  ): Promise<CommunityInviteProps> {
    try {
      const authenticatedUser = (await this.getUser()) as { uid: string };
      if (authenticatedUser.uid !== inviterId) {
        throw new Error("Você só pode enviar convites usando a própria conta.");
      }

      if (inviterId === inviteeId) {
        throw new Error("Você já participa dessa comunidade.");
      }

      const communityRef = doc(this.db, "communities", communityId);
      const communitySnap = await getDoc(communityRef);

      if (!communitySnap.exists()) {
        throw new Error("Comunidade não encontrada.");
      }

      const community = {
        id: communitySnap.id,
        ...communitySnap.data(),
      } as CommunityProps;

      const inviterMemberSnap = await getDoc(
        doc(communityRef, "members", inviterId)
      );
      const canInvite =
        community.ownerId === inviterId || inviterMemberSnap.exists();

      if (!canInvite) {
        throw new Error("Apenas membros podem convidar para esta comunidade.");
      }

      const inviteeMemberSnap = await getDoc(
        doc(communityRef, "members", inviteeId)
      );
      if (inviteeMemberSnap.exists()) {
        throw new Error("Esse usuário já está na comunidade.");
      }

      const inviteId = `${communityId}_${inviteeId}`;
      const inviteRef = doc(this.db, "communityInvites", inviteId);
      const inviteSnap = await getDoc(inviteRef);

      if (inviteSnap.exists()) {
        const existingInvite = {
          id: inviteSnap.id,
          ...inviteSnap.data(),
        } as CommunityInviteProps;

        if (existingInvite.status === "pending") return existingInvite;
      }

      const invite: CommunityInviteProps = {
        id: inviteId,
        communityId,
        communityTitle: community.title,
        inviterId,
        inviteeId,
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(inviteRef, invite);
      return invite;
    } catch (error) {
      throw error;
    }
  }

  async getPendingCommunityInvites(
    userId: string
  ): Promise<CommunityInviteProps[]> {
    try {
      await this.getUser();
      const invitesRef = collection(this.db, "communityInvites");
      const invitesQuery = query(
        invitesRef,
        where("inviteeId", "==", userId),
        where("status", "==", "pending")
      );
      const invitesSnapshot = await getDocs(invitesQuery);

      return invitesSnapshot.docs.map((inviteDoc) => ({
        id: inviteDoc.id,
        ...inviteDoc.data(),
      })) as CommunityInviteProps[];
    } catch (error) {
      throw error;
    }
  }

  async declineCommunityInvite(inviteId: string, userId: string): Promise<void> {
    try {
      await this.getUser();
      const inviteRef = doc(this.db, "communityInvites", inviteId);
      const inviteSnap = await getDoc(inviteRef);

      if (!inviteSnap.exists()) return;

      const invite = {
        id: inviteSnap.id,
        ...inviteSnap.data(),
      } as CommunityInviteProps;

      if (invite.inviteeId !== userId) {
        throw new Error("Apenas quem recebeu o convite pode recusá-lo.");
      }

      await updateDoc(inviteRef, {
        status: "declined",
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      throw error;
    }
  }

  async checkCommunityMembership(
    communityId: string,
    userId: string
  ): Promise<boolean> {
    try {
      await this.getUser();
      const memberRef = doc(
        this.db,
        "communities",
        communityId,
        "members",
        userId
      );
      const memberSnap = await getDoc(memberRef);
      return memberSnap.exists();
    } catch (error) {
      throw error;
    }
  }

  async getPostsByCommunity(communityId: string): Promise<PostProps[]> {
    try {
      const authenticatedUser = (await this.getUser()) as { uid: string };
      const canViewCommunity = await this.canViewCommunity(
        communityId,
        authenticatedUser.uid
      );

      if (!canViewCommunity) {
        throw new Error("Você precisa de convite para ver esta comunidade.");
      }

      const postsCollectionRef = collection(this.db, "posts");
      const byCommunityQuery = query(
        postsCollectionRef,
        where("communityId", "==", communityId)
      );
      const byTagQuery = query(
        postsCollectionRef,
        where("tags", "array-contains", communityId)
      );
      const [communitySnapshot, tagSnapshot] = await Promise.all([
        getDocs(byCommunityQuery),
        getDocs(byTagQuery),
      ]);
      const postsMap = new Map<string, PostProps>();

      communitySnapshot.docs.forEach((postDoc) => {
        postsMap.set(postDoc.id, {
          id: postDoc.id,
          ...postDoc.data(),
        } as PostProps);
      });

      tagSnapshot.docs.forEach((postDoc) => {
        postsMap.set(postDoc.id, {
          id: postDoc.id,
          ...postDoc.data(),
        } as PostProps);
      });

      const posts = await Promise.all(
        Array.from(postsMap.values()).map((post) => this.hydratePost(post))
      );

      return posts.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      throw error;
    }
  }

  async getPostsByCommunityPage(
    communityId: string,
    cursor: string | null = null,
    pageSize: number = 10
  ): Promise<PaginatedPostsProps> {
    try {
      const authenticatedUser = (await this.getUser()) as { uid: string };
      const canViewCommunity = await this.canViewCommunity(
        communityId,
        authenticatedUser.uid
      );

      if (!canViewCommunity) {
        throw new Error("Você precisa de convite para ver esta comunidade.");
      }

      const postsCollectionRef = collection(this.db, "posts");
      const queryLimit = Math.max(pageSize * 4, 24);
      const postsMap = new Map<string, PostProps>();
      let scanCursor = cursor;
      let lastScannedCursor: string | null = null;
      let hasMoreScannablePosts = false;

      while (postsMap.size < pageSize) {
        const postsQuery = scanCursor
          ? query(
              postsCollectionRef,
              where("createdAt", "<", scanCursor),
              orderBy("createdAt", "desc"),
              limit(queryLimit)
            )
          : query(
              postsCollectionRef,
              orderBy("createdAt", "desc"),
              limit(queryLimit)
            );
        const postsSnapshot = await getDocs(postsQuery);

        if (postsSnapshot.empty) {
          hasMoreScannablePosts = false;
          break;
        }

        postsSnapshot.docs.forEach((postDoc) => {
          const postData = {
            id: postDoc.id,
            ...postDoc.data(),
          } as PostProps;

          if (this.isPostLinkedToCommunity(postData, communityId)) {
            postsMap.set(postDoc.id, postData);
          }
        });

        const lastScannedPost =
          postsSnapshot.docs[postsSnapshot.docs.length - 1];
        const lastScannedPostData = {
          id: lastScannedPost.id,
          ...lastScannedPost.data(),
        } as PostProps;
        lastScannedCursor = this.getPostCursor(lastScannedPostData);
        hasMoreScannablePosts = postsSnapshot.docs.length === queryLimit;

        if (!lastScannedCursor || !hasMoreScannablePosts) break;
        scanCursor = lastScannedCursor;
      }

      const pagePosts = Array.from(postsMap.values())
        .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, pageSize);
      const posts = await Promise.all(
        pagePosts.map((post) => this.hydratePost(post))
      );
      const lastPost = pagePosts[pagePosts.length - 1];
      const nextCursor =
        pagePosts.length >= pageSize && lastPost
          ? this.getPostCursor(lastPost)
          : lastScannedCursor;

      return {
        posts,
        nextCursor,
        hasMore: hasMoreScannablePosts && !!nextCursor,
      };
    } catch (error) {
      throw error;
    }
  }

  async sendFriendRequest(
    requesterId: string,
    addresseeId: string
  ): Promise<FriendshipProps> {
    try {
      await this.getUser();

      if (requesterId === addresseeId) {
        throw new Error("Você não pode adicionar a si mesmo.");
      }

      const friendshipId = this.getFriendshipId(requesterId, addresseeId);
      const friendshipRef = doc(this.db, "friendships", friendshipId);
      const friendshipSnap = await getDoc(friendshipRef);

      if (friendshipSnap.exists()) {
        return {
          id: friendshipSnap.id,
          ...friendshipSnap.data(),
        } as FriendshipProps;
      }

      const friendship: FriendshipProps = {
        id: friendshipId,
        requesterId,
        addresseeId,
        participants: [requesterId, addresseeId],
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(friendshipRef, friendship);

      return friendship;
    } catch (error) {
      throw error;
    }
  }

  async respondFriendRequest(
    friendshipId: string,
    userId: string,
    accept: boolean
  ): Promise<FriendshipProps | null> {
    try {
      await this.getUser();
      const friendshipRef = doc(this.db, "friendships", friendshipId);
      const friendshipSnap = await getDoc(friendshipRef);

      if (!friendshipSnap.exists()) return null;

      const friendship = {
        id: friendshipSnap.id,
        ...friendshipSnap.data(),
      } as FriendshipProps;

      if (friendship.addresseeId !== userId) {
        throw new Error("Apenas quem recebeu o convite pode responder.");
      }

      if (friendship.status !== "pending") {
        return friendship;
      }

      if (!accept) {
        await deleteDoc(friendshipRef);
        return null;
      }

      await updateDoc(friendshipRef, {
        status: "accepted",
        updatedAt: new Date().toISOString(),
      });
      await setDoc(
        doc(this.db, "users", friendship.requesterId, "friends", friendship.addresseeId),
        {
          userId: friendship.addresseeId,
          friendshipId,
          createdAt: new Date().toISOString(),
        }
      );
      await setDoc(
        doc(this.db, "users", friendship.addresseeId, "friends", friendship.requesterId),
        {
          userId: friendship.requesterId,
          friendshipId,
          createdAt: new Date().toISOString(),
        }
      );
      await updateDoc(doc(this.db, "users", friendship.requesterId), {
        friendCount: increment(1),
      });
      await updateDoc(doc(this.db, "users", friendship.addresseeId), {
        friendCount: increment(1),
      });

      return {
        ...friendship,
        status: "accepted",
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      throw error;
    }
  }

  async removeFriend(firstUserId: string, secondUserId: string): Promise<void> {
    try {
      await this.getUser();
      const friendshipId = this.getFriendshipId(firstUserId, secondUserId);
      const friendshipRef = doc(this.db, "friendships", friendshipId);

      await deleteDoc(friendshipRef);
      await deleteDoc(doc(this.db, "users", firstUserId, "friends", secondUserId));
      await deleteDoc(doc(this.db, "users", secondUserId, "friends", firstUserId));
      await updateDoc(doc(this.db, "users", firstUserId), {
        friendCount: increment(-1),
      });
      await updateDoc(doc(this.db, "users", secondUserId), {
        friendCount: increment(-1),
      });
    } catch (error) {
      throw error;
    }
  }

  async getFriendshipBetween(
    firstUserId: string,
    secondUserId: string
  ): Promise<FriendshipProps | null> {
    try {
      await this.getUser();
      const friendshipRef = doc(
        this.db,
        "friendships",
        this.getFriendshipId(firstUserId, secondUserId)
      );
      const friendshipSnap = await getDoc(friendshipRef);

      if (!friendshipSnap.exists()) return null;

      return {
        id: friendshipSnap.id,
        ...friendshipSnap.data(),
      } as FriendshipProps;
    } catch (error) {
      throw error;
    }
  }

  async getFriendIds(userId: string): Promise<string[]> {
    try {
      await this.getUser();
      const friendsRef = collection(this.db, "users", userId, "friends");
      const friendsSnapshot = await getDocs(friendsRef);

      return friendsSnapshot.docs.map((friendDoc) => friendDoc.id);
    } catch (error) {
      throw error;
    }
  }

  async getFriends(userId: string): Promise<UserProps[]> {
    try {
      const friendIds = await this.getFriendIds(userId);
      const friends: UserProps[] = [];

      for (const friendId of friendIds) {
        friends.push((await this.getUserById(friendId)) as UserProps);
      }

      return friends;
    } catch (error) {
      throw error;
    }
  }

  async getPendingFriendRequests(userId: string): Promise<FriendshipProps[]> {
    try {
      await this.getUser();
      const friendshipsRef = collection(this.db, "friendships");
      const requestsQuery = query(
        friendshipsRef,
        where("addresseeId", "==", userId),
        where("status", "==", "pending")
      );
      const requestsSnapshot = await getDocs(requestsQuery);

      return requestsSnapshot.docs.map((requestDoc) => ({
        id: requestDoc.id,
        ...requestDoc.data(),
      })) as FriendshipProps[];
    } catch (error) {
      throw error;
    }
  }
}
