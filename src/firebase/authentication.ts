import { addDoc, collection, getDocs, getFirestore, query, where } from "firebase/firestore";
import { fireApp as app } from "./firebase";

import { getAuth, signInWithPopup, signOut, signInWithRedirect, GoogleAuthProvider } from "firebase/auth";

const auth = getAuth(app)

const googleProvider = new GoogleAuthProvider();

const logout = () => {
    signOut(auth);
}

const entrarComGoogle = async () => {
    await signInWithPopup(auth, googleProvider).then((result)=> {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken;
        const user = result.user;
        
    }).catch((err)=> {
        const errorCode = err.code;
        const errorMessage = err.message;
        // The email of the user's account used.
        const email = err.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(err);

        console.log("error message: ",errorMessage)
        console.log("\nerror code: ",errorCode)
        console.log("Cred: ", credential)
    })
}


export { auth, logout, entrarComGoogle }