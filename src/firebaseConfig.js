import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "task7p-7922a.firebaseapp.com",
  projectId: "task7p-7922a",
  storageBucket: "task7p-7922a.firebasestorage.app",
  messagingSenderId: "78601038131",
  appId: "1:78601038131:web:0ccfe511337767657d7646"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
