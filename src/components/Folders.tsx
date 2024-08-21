import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc } from "firebase/firestore";
import { auth, db } from "../firebase";

interface Folder {
  id: string;
  name: string;
  description: string;
}

const Folders: React.FC = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDescription, setNewFolderDescription] = useState("");
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const foldersQuery = query(
        collection(db, "folders"),
        where("userId", "==", user.uid)
      );

      const unsubscribe = onSnapshot(foldersQuery, (snapshot) => {
        const folderData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Folder[];
        setFolders(folderData);
      });

      return () => unsubscribe();
    }
  }, []);

  const handleCreateFolder = async () => {
    const user = auth.currentUser;
    if (user && newFolderName.trim() !== "") {
      await addDoc(collection(db, "folders"), {
        userId: user.uid,
        name: newFolderName,
        description: newFolderDescription,
      });
      setNewFolderName("");
      setNewFolderDescription("");
    }
  };

  const handleUpdateFolder = async () => {
    if (editingFolder) {
      await updateDoc(doc(db, "folders", editingFolder.id), {
        name: editingFolder.name,
        description: editingFolder.description,
      });
      setEditingFolder(null);
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  return (
    <div className="folders p-4 bg-gradient-to-b from-sky-200 to-sky-400 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-center text-sky-800">Your Folders</h2>
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md mb-8">
        <h3 className="text-2xl font-semibold mb-6 text-sky-700">Create New Folder</h3>
        <input
          type="text"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          placeholder="New folder name"
          className="w-full p-3 mb-6 border rounded focus:outline-none focus:ring-2 focus:ring-sky-500 text-lg"
        />
        <textarea
          value={newFolderDescription}
          onChange={(e) => setNewFolderDescription(e.target.value)}
          placeholder="Folder description"
          className="w-full p-3 mb-6 border rounded h-32 focus:outline-none focus:ring-2 focus:ring-sky-500 text-lg"
        />
        <button
          onClick={handleCreateFolder}
          className="w-full bg-sky-500 text-white px-6 py-3 rounded hover:bg-sky-600 transition duration-300 text-lg font-semibold"
        >
          Create Folder
        </button>
      </div>
      <div className="max-w-3xl mx-auto space-y-4">
        {folders.map((folder) => (
          <div key={folder.id} className="bg-white p-4 rounded-lg shadow">
            {editingFolder?.id === folder.id ? (
              <>
                <input
                  type="text"
                  value={editingFolder.name}
                  onChange={(e) =>
                    setEditingFolder({ ...editingFolder, name: e.target.value })
                  }
                  className="w-full p-2 mb-2 border rounded focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <textarea
                  value={editingFolder.description}
                  onChange={(e) =>
                    setEditingFolder({ ...editingFolder, description: e.target.value })
                  }
                  className="w-full p-2 mb-2 border rounded h-24 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <button
                  onClick={handleUpdateFolder}
                  className="bg-sky-500 text-white px-4 py-2 rounded hover:bg-sky-600 mr-2"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingFolder(null)}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold mb-2 text-sky-700">{folder.name}</h3>
                <p className="text-sky-600 mb-4" title={folder.description}>
                  {truncateText(folder.description, 100)}
                </p>
                <div className="flex space-x-2">
                  <Link
                    to={`/folders/${folder.id}`}
                    className="bg-sky-500 text-white px-4 py-2 rounded hover:bg-sky-600 transition duration-300"
                  >
                    View Notes
                  </Link>
                  <button
                    onClick={() => setEditingFolder(folder)}
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition duration-300"
                  >
                    Edit
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Folders;