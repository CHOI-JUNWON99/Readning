import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export async function getBooksFromFirebase() {
  const snapshot = await getDocs(collection(db, "books"));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as {
    id: string;
    title: string;
    author: string;
    content: string;
    coverUrl: string;
  }[];
}
