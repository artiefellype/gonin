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
  FriendshipProps,
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
      await this.getUser();
      const postsCollectionRef = collection(this.db, "posts");
      const postsQuery = query(postsCollectionRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(postsQuery);

      const posts = await Promise.all(
        querySnapshot.docs.map((postDoc) =>
          this.hydratePost({
            id: postDoc.id,
            ...postDoc.data(),
          } as PostProps)
        )
      );

      return posts;
    } catch (error) {
      throw error;
    }
  }

  async getPostWithDetails(postId: string): Promise<PostProps> {
    try {
      await this.getUser();
      const postRef = doc(this.db, "posts", postId);
      const postSnap = await getDoc(postRef);

      if (!postSnap.exists()) {
        throw new Error(`No document found with id: ${postId}`);
      }

      return await this.hydratePost({
        id: postSnap.id,
        ...postSnap.data(),
      } as PostProps);
    } catch (error) {
      throw error;
    }
  }

  async getPostsByUserIds(userIds: string[]): Promise<PostProps[]> {
    try {
      await this.getUser();
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

  async getPostsByUserId(userId: string): Promise<PostProps[]> {
    return this.getPostsByUserIds([userId]);
  }

  async add(collectionName: string, newData: any) {
    try {
      const user = await this.getUser();
      const collectionRef = collection(this.db, collectionName);
      const docRef = doc(collectionRef);
      await setDoc(docRef, newData);
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
      await updateDoc(docRef, newData);
    } catch (error) {
      throw error;
    }
  }

  async updateUser(user: UserProps) {
    try {
      const authenticatedUser = (await this.getUser()) as { uid: string };
      const targetUserId = user.uid || user.id;

      if (authenticatedUser.uid !== targetUserId) {
        throw new Error("Você só pode editar o próprio perfil.");
      }

      const userRef = doc(this.db, "users", targetUserId);
      await updateDoc(userRef, {
        uid: targetUserId,
        displayName: user.displayName,
        searchName: this.normalizeSearchValue(user.displayName),
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

  async remove(collectionName: string, docId: string) {
    try {
      const user = await this.getUser();
      const docRef = doc(this.db, collectionName, docId);

      const docSnapshot = await getDoc(docRef);
      if (!docSnapshot.exists()) {
        throw new Error("Documento não encontrado");
      }

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
      const commentsCollectionRef = collection(postRef, "comments");

      const docRef = await addDoc(commentsCollectionRef, comment);

      await updateDoc(docRef, { id: docRef.id });

      await updateDoc(postRef, {
        commentCount: increment(1),
      });
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
      const sharedPost: PostProps = {
        id: newPostRef.id,
        userId,
        mediaFile: "",
        mediaType: undefined,
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
      };

      await setDoc(newPostRef, sharedPost);
      await this.addSubCollection("posts", newPostRef.id, "comments");
      await this.addSubCollection("posts", newPostRef.id, "likes");
      await updateDoc(originalPostRef, { shareCount: increment(1) });
      await updateDoc(doc(this.db, "users", userId), {
        posts: arrayUnion(newPostRef.id),
      });

      return this.hydratePost(sharedPost);
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
      await this.getUser();
      const communityRef = doc(this.db, "communities", communityId);
      const memberRef = doc(communityRef, "members", userId);
      const memberSnap = await getDoc(memberRef);

      if (memberSnap.exists()) return true;

      await setDoc(memberRef, {
        userId,
        role: "member",
        createdAt: new Date().toISOString(),
      });
      await updateDoc(communityRef, { membersCount: increment(1) });
      await updateDoc(doc(this.db, "users", userId), {
        communities: arrayUnion(communityId),
      });

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

      await deleteDoc(communityRef);
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
      await this.getUser();
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
