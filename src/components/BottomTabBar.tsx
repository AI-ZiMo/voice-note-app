import { Link, useLocation } from "react-router-dom";
import { Home as HomeIcon, User, Folder, PlusSquare } from "lucide-react";

const BottomTabBar: React.FC = () => {
  const location = useLocation();
  return (
    <nav className="bottom-nav bg-sky-600 text-white p-4 flex justify-around items-center fixed bottom-0 left-0 right-0">
      <Link
        to="/"
        className={`text-2xl ${location.pathname === "/" ? "text-sky-200" : ""}`}
      >
        <HomeIcon size={24} />
      </Link>
      <Link
        to="/folders"
        className={`text-2xl ${location.pathname === "/folders" ? "text-sky-200" : ""}`}
      >
        <Folder size={24} />
      </Link>
      <Link
        to="/add-note"
        className={`text-2xl ${location.pathname === "/add-note" ? "text-sky-200" : ""}`}
      >
        <PlusSquare size={24} />
      </Link>
      <Link
        to="/profile"
        className={`text-2xl ${location.pathname === "/profile" ? "text-sky-200" : ""}`}
      >
        <User size={24} />
      </Link>
    </nav>
  );
};

export default BottomTabBar;