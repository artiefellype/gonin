import { getAuth, onAuthStateChanged } from 'firebase/auth';
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
  DocumentReference
} from 'firebase/firestore';
import { fireApp } from '@/firebase/firebase';

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
          reject('Usuário não autenticado');
        }
      });
    });
  }

  async get(collectionName: string, subcollectionName?: string) {
    try {
      const user = await this.getUser();
      let collectionRef: CollectionReference | DocumentReference = collection(this.db, collectionName);

      if (subcollectionName) {
        collectionRef = doc(this.db, collectionName).withConverter({
          toFirestore: (data) => data,
          fromFirestore: (snapshot) => ({ id: snapshot.id, ...snapshot.data() })
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
      await deleteDoc(docRef);
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
  async getSubcollection(collectionName: string, docId: string, subcollectionName: string) {
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
      const docRef = doc(this.db, 'users', userId);
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
}
