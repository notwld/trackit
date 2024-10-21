// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBxhrOC1Do6GxMypcWfE2tp4xTwtPXrld4",
  authDomain: "trackit-32c43.firebaseapp.com",
  projectId: "trackit-32c43",
  storageBucket: "trackit-32c43.appspot.com",
  messagingSenderId: "804767157780",
  appId: "1:804767157780:web:f749202f5aaac4177ea101",
  measurementId: "G-BJXF2XYBTZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getFirestore(app);

export {app,database};