import { getDatabase, ref, get, child, set, remove, update } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { fireApp as app, db } from "@/firebase/firebase";

export class BaseAPI {
  private auth;
  private dbRef;

  constructor() {
    this.auth = getAuth(app);
    this.dbRef = ref(db);
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

  async get(collection: string) {
    try {
      const user = await this.getUser();
      const dataRef = ref(db, collection);
      const snapshot = await get(dataRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        return data;
      } else {
        throw new Error(`No data available for collection: ${collection}`);
      }
    } catch (error) {
      throw error;
    }
  }

  async update(collection: string, key: string, newData: any) {
    try {
      const user = await this.getUser();
      const dataRef = ref(db, collection);
      await update(child(dataRef, key), newData);
    } catch (error) {
      throw error;
    }
  }

  async remove(collection: string, key: string) {
    try {
      const user = await this.getUser();
      const dataRef = ref(db, collection);
      await remove(child(dataRef, key));
    } catch (error) {
      throw error;
    }
  }

  async add(collection: string, newData: any) {
    try {
      const user = await this.getUser();
      const dataRef = ref(db, collection);
      await set(dataRef, newData);
    } catch (error) {
      throw error;
    }
  }
}
