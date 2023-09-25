import { fireApp as app } from "./firebase";

import { getAuth, signInWithPopup, signOut, signInWithRedirect, GoogleAuthProvider } from "firebase/auth";

const auth = getAuth(app)

const googleProvider = new GoogleAuthProvider();

const logout = () => {
    signOut(auth);
}

const entrarComGoogle = async () => {
    await signInWithRedirect(auth, googleProvider).then((result)=> {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken;
        
    }).catch((err)=> {
        const errorCode = err.code;
        const errorMessage = err.message;
        // The email of the user's account used.
        const email = err.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(err);

    })
}


export { auth, logout, entrarComGoogle }