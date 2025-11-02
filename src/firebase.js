// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDor57qriJsLKpj96qegOkM0V30dHGq02Q",
    authDomain: "movie-review-platform-c0a26.firebaseapp.com",
    projectId: "movie-review-platform-c0a26",
    storageBucket: "movie-review-platform-c0a26.firebasestorage.app",
    messagingSenderId: "664944207211",
    appId: "1:664944207211:web:6d2e49db7c9dffd75bd82e"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);