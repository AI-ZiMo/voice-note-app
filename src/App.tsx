import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { auth } from "./firebase";
import Profile from "./components/Profile";
import Home from "./components/Home";
import SignIn from "./components/SignIn";
import { User as FirebaseUser } from "firebase/auth";
import WelcomeScreen from "./components/WelcomeScreen";
import BottomTabBar from "./components/BottomTabBar";
import Folders from "./components/Folders";
import Notes from "./components/Notes";
import AddNote from "./components/AddNote";
import NoteDetail from "./components/NoteDetail";

const App: React.FC = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <div className="app flex flex-col min-h-screen bg-gradient-to-b from-sky-200 to-sky-400">
        <main className="flex-grow pb-20">
          {user ? (
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/folders" element={<Folders />} />
              <Route path="/folders/:folderId" element={<Notes />} />
              <Route path="/add-note" element={<AddNote />} />
              <Route path="/add-note/:folderId" element={<AddNote />} />
              <Route path="/note/:noteId" element={<NoteDetail />} />
            </Routes>
          ) : (
            <Routes>
              <Route path="/" element={<WelcomeScreen />} />
              <Route path="/signin" element={<SignIn />} />
            </Routes>
          )}
        </main>
        {user && <BottomTabBar />}
      </div>
    </Router>
  );
};

export default App;