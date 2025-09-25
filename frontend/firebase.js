import { initializeApp } from "firebase/app";
import {getAuth} from 'firebase/auth'


const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "vingo-1.firebaseapp.com",
  projectId: "vingo-1",
  storageBucket: "vingo-1.firebasestorage.app",
  messagingSenderId: "242220080445",
  appId: "1:242220080445:web:2c29f196edf3aa65903954"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

export {app, auth};