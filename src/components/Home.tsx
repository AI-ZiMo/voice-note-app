import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

interface Note {
  id: string;
  title: string;
  content: string;
  userId: string;
  folderId: string;
}

const Home: React.FC = () => {
  const [publicNotes, setPublicNotes] = useState<Note[]>([]);

  useEffect(() => {
    const notesQuery = query(
      collection(db, "notes"),
      where("isPublic", "==", true),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(notesQuery, (snapshot) => {
      const newNotes = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Note[];
      setPublicNotes(newNotes);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="home p-4 bg-gradient-to-b from-sky-200 to-sky-400 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-sky-800">Public Notes Feed</h1>
      <div className="max-w-3xl mx-auto">
        {publicNotes.map((note) => (
          <Link
            key={note.id}
            to={`/note/${note.id}`}
            className="block bg-white shadow-md rounded-lg p-4 mb-4 transform hover:scale-105 transition duration-300"
          >
            <h2 className="text-xl font-semibold mb-2 text-sky-700">{note.title}</h2>
            <p className="text-gray-700">{note.content.substring(0, 100)}...</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Home;