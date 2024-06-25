import { getAuth, onAuthStateChanged } from "firebase/auth";
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
} from "firebase/firestore";
import { fireApp, storage } from "@/firebase/firebase";
import { PostProps, UserProps } from "@/types";
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

      const querySnapshot = await getDocs(collectionRef);

      const data: any[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });

      return data;
    } catch (error) {
      throw error;
    }
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
    subCollectionName: any
  ) {
    try {
      const subCollectionRef = collection(
        doc(this.db, collectionName, docId),
        subCollectionName
      );
      const subDocRef = await addDoc(subCollectionRef, {});
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

      if (imageData) {
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

  // Obter subcolecoes
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
      const baseAPI = new BaseAPI();

      for (const doc of querySnapshot.docs) {
        const postData = { id: doc.id, ...doc.data() } as PostProps;

        if (postData.userId) {
          const user = (await baseAPI.getUserById(
            postData.userId
          )) as UserProps;
          posts.push({ ...postData, user });
        } else {
          console.error(`Post with id ${postData.id} does not have a userId`);
          posts.push(postData);
        }
      }

      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

      return { posts, lastVisible };
    } catch (error: any) {
      throw new Error(`Erro ao buscar posts por tag: ${error.message}`);
    }
  }
}
