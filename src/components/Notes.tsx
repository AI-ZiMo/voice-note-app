import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { collection, query, where, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { Loader } from "lucide-react";

interface Note {
  id: string;
  title: string;
  content: string;
  isPublic: boolean;
}

const Spinner: React.FC = () => (
  <div className="flex justify-center items-center">
    <Loader className="animate-spin h-5 w-5 mr-3" />
    Loading...
  </div>
);

const Notes: React.FC = () => {
  const { folderId } = useParams<{ folderId: string }>();
  const [notes, setNotes] = useState<Note[]>([]);
  const [folderName, setFolderName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (folderId) {
      setIsLoading(true);
      const notesQuery = query(
        collection(db, "notes"),
        where("folderId", "==", folderId)
      );

      const unsubscribe = onSnapshot(notesQuery, (snapshot) => {
        const noteData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Note[];
        setNotes(noteData);
        setIsLoading(false);
      });

      // Fetch folder name
      const folderRef = doc(db, "folders", folderId);
      onSnapshot(folderRef, (doc) => {
        if (doc.exists()) {
          setFolderName(doc.data()?.name || "");
        }
      });

      return () => unsubscribe();
    }
  }, [folderId]);

  const toggleNoteVisibility = async (note: Note) => {
    await updateDoc(doc(db, "notes", note.id), {
      isPublic: !note.isPublic,
    });
  };

  return (
    <div className="notes p-4 bg-gradient-to-b from-sky-200 to-sky-400 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-center text-sky-800">{folderName} Notes</h2>
      <div className="max-w-4xl mx-auto">
        <Link
          to={`/add-note/${folderId}`}
          className="bg-sky-500 text-white px-4 py-2 rounded hover:bg-sky-600 mb-6 inline-block transition duration-300"
        >
          Add New Note
        </Link>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner />
          </div>
        ) : notes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note) => (
              <div key={note.id} className="bg-white p-4 rounded-lg shadow">
                <Link to={`/note/${note.id}`} className="block">
                  <h3 className="text-xl font-semibold mb-2 text-sky-700">{note.title}</h3>
                  <p className="text-sky-600 mb-4">{note.content.substring(0, 100)}...</p>
                </Link>
                <div className="flex justify-between">
                  <button
                    onClick={() => toggleNoteVisibility(note)}
                    className={`px-3 py-1 rounded ${
                      note.isPublic
                        ? "bg-green-500 text-white hover:bg-green-600"
                        : "bg-gray-300 text-gray-800 hover:bg-gray-400"
                    } transition duration-300`}
                  >
                    {note.isPublic ? "Public" : "Private"}
                  </button>
                  <Link
                    to={`/note/${note.id}`}
                    className="bg-sky-500 text-white px-3 py-1 rounded hover:bg-sky-600 transition duration-300"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-sky-700">No notes in this folder yet. Add your first note!</p>
        )}
      </div>
    </div>
  );
};

export default Notes;