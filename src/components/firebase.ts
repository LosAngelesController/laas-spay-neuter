import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBvTMKWlJFrjYs9PbO0ptTnuHPd_wjdc8M",
  authDomain: "internal-data-ecc84.firebaseapp.com",
  projectId: "internal-data-ecc84",
  storageBucket: "internal-data-ecc84.appspot.com",
  messagingSenderId: "889772252930",
  appId: "1:889772252930:web:d88d1c8d32b291582dec1b",
  measurementId: "G-KDJX3C5EXX",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth();

export const signOutOfApp = async () => {
  signOut(auth)
    .then(() => {
      // Sign-out successful.
    })
    .catch((error: any) => {
      // An error happened.
    });
};

export const getPhotoUrlOfUser = () => {
  return new Promise((resolve, reject) => {
    const user = auth.currentUser;
    if (user !== null) {
      // The user object has basic properties such as display name, email, etc.
      const displayName = user.displayName;
      const email = user.email;
      const photoURL = user.photoURL;
      const emailVerified = user.emailVerified;

      // The user's ID, unique to the Firebase project. Do NOT use
      // this value to authenticate with your backend server, if
      // you have one. Use User.getToken() instead.
      const uid = user.uid;
      resolve(photoURL);
    } else {
      resolve("/rickroll.jpeg");
    }
  });
};

const googleProvider = new GoogleAuthProvider();
export const signInWithGoogle = async () => {
  try {
    signInWithPopup(auth, googleProvider)
      .then((result: any) => {
        if (result) {
          // This gives you a Google Access Token. You can use it to access the Google API.
          const credential = GoogleAuthProvider.credentialFromResult(result);
          if (credential) {
            const token = credential.accessToken;
            // The signed-in user info.
            const user = result.user;
            // ...
          }
        }
      })
      .catch((error: any) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
      });
  } catch (err) {
    console.error(err);
    // alert(err.message);
  }
};
