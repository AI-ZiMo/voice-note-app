import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { addDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase";

interface Folder {
  id: string;
  name: string;
}

const AddNote: React.FC = () => {
  const { folderId } = useParams<{ folderId?: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState(folderId || "");

  useEffect(() => {
    const fetchFolders = async () => {
      const user = auth.currentUser;
      if (user) {
        const foldersQuery = query(
          collection(db, "folders"),
          where("userId", "==", user.uid)
        );
        const querySnapshot = await getDocs(foldersQuery);
        const folderData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
        }));
        setFolders(folderData);

        if (!folderId && folderData.length > 0) {
          setSelectedFolderId(folderData[0].id);
        }
      }
    };

    fetchFolders();
  }, [folderId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (user && selectedFolderId) {
      try {
        await addDoc(collection(db, "notes"), {
          userId: user.uid,
          folderId: selectedFolderId,
          title,
          content,
          isPublic,
          createdAt: new Date(),
        });
        navigate(`/folders/${selectedFolderId}`);
      } catch (error) {
        console.error("Error adding note:", error);
      }
    }
  };

  return (
    <div className="add-note p-4 bg-gradient-to-b from-sky-200 to-sky-400 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-center text-sky-800">Add New Note</h2>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <select
          value={selectedFolderId}
          onChange={(e) => setSelectedFolderId(e.target.value)}
          className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-sky-500"
          required
        >
          <option value="">Select a folder</option>
          {folders.map((folder) => (
            <option key={folder.id} value={folder.id}>
              {folder.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title"
          className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-sky-500"
          required
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Note content"
          className="w-full p-2 mb-4 border rounded h-32 focus:outline-none focus:ring-2 focus:ring-sky-500"
          required
        />
        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            id="isPublic"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="isPublic" className="text-sky-800">Make this note public</label>
        </div>
        <button
          type="submit"
          className="w-full bg-sky-500 text-white px-4 py-2 rounded hover:bg-sky-600 transition duration-300"
        >
          Add Note
        </button>
      </form>
    </div>
  );
};

export default AddNote;