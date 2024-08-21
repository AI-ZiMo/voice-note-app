import React, { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { Link, useNavigate } from "react-router-dom";

interface Folder {
  id: string;
  name: string;
  description: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: any;
}

const Profile: React.FC = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async (currentUser: User) => {
      try {
        // Fetch folders
        const foldersQuery = query(
          collection(db, "folders"),
          where("userId", "==", currentUser.uid)
        );
        const foldersSnapshot = await getDocs(foldersQuery);
        const foldersData = foldersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Folder));
        setFolders(foldersData);

        // Fetch recent notes
        const notesQuery = query(
          collection(db, "notes"),
          where("userId", "==", currentUser.uid),
          orderBy("createdAt", "desc"),
          limit(5)
        );
        const notesSnapshot = await getDocs(notesQuery);
        const notesData = notesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Note));
        setRecentNotes(notesData);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(`Failed to fetch user data: ${(err as Error).message}`);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchUserData(currentUser);
      } else {
        setFolders([]);
        setRecentNotes([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  if (!user) {
    return (
      <div className="profile p-4 bg-sky-100 min-h-screen">
        <h2 className="text-2xl font-bold mb-4 text-center text-sky-800">Profile</h2>
        <p className="text-center text-sky-600">Please sign in to view your profile.</p>
        <Link
          to="/signin"
          className="bg-sky-500 text-white px-4 py-2 rounded mt-4 block w-max mx-auto hover:bg-sky-600 transition duration-300"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="profile p-4 bg-gradient-to-b from-sky-200 to-sky-400 min-h-screen pb-20">
      <h2 className="text-2xl font-bold mb-4 text-center text-sky-800">Your Profile</h2>
      <div className="mx-auto max-w-2xl bg-white p-6 rounded-lg shadow-md">
        <p className="text-sky-700 mb-4">Email: {user.email}</p>
        <button
          onClick={handleSignOut}
          className="bg-red-500 text-white px-4 py-2 rounded mb-6 hover:bg-red-600 transition duration-300"
        >
          Sign Out
        </button>

        <h3 className="text-xl font-semibold mb-4 text-sky-800">Recent Notes</h3>
        <div className="mb-6">
          {loading ? (
            <p>Loading recent notes...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : recentNotes.length > 0 ? (
            recentNotes.map((note) => (
              <div key={note.id} className="bg-sky-50 p-3 rounded-md mb-2">
                <h4 className="font-semibold text-sky-700">{note.title}</h4>
                <p className="text-sky-600 text-sm">{truncateText(note.content, 100)}</p>
                <p className="text-xs text-sky-400">
                  Created: {note.createdAt ? new Date(note.createdAt.seconds * 1000).toLocaleString() : 'Unknown date'}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center">
              <p className="text-sky-600 mb-2">You haven't created any notes yet.</p>
              <Link
                to="/add-note"
                className="bg-sky-500 text-white px-4 py-2 rounded hover:bg-sky-600 transition duration-300"
              >
                Create Your First Note
              </Link>
            </div>
          )}
        </div>

        <h3 className="text-xl font-semibold mb-4 text-sky-800">Your Folders</h3>
        {folders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {folders.map((folder) => (
              <Link
                key={folder.id}
                to={`/folders/${folder.id}`}
                className="bg-sky-100 p-4 rounded-lg shadow-md hover:shadow-lg transition duration-300"
              >
                <h4 className="text-lg font-semibold mb-2 text-sky-700">{folder.name}</h4>
                <p className="text-sky-600" title={folder.description}>
                  {truncateText(folder.description, 50)}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sky-600 mb-2">You haven't created any folders yet.</p>
            <Link
              to="/folders"
              className="bg-sky-500 text-white px-4 py-2 rounded hover:bg-sky-600 transition duration-300"
            >
              Create Your First Folder
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;