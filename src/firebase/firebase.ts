// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBrwvVJmgnc06SxMpKwG6NpxqJUHZrf4jU",
  authDomain: "readning-3cb46.firebaseapp.com",
  projectId: "readning-3cb46",
  storageBucket: "readning-3cb46.firebasestorage.app",
  messagingSenderId: "873200182505",
  appId: "1:873200182505:web:5b597a720a812e63f0fc78",
  measurementId: "G-2E3H8EG4GB",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export { app };

//const analytics = getAnalytics(app);
