// src/components/Navbar.jsx
import { useNavigate } from "react-router-dom";
import { getUser, logOut } from "../../utilities/users-service";

export default function Navbar() {
  const navigate = useNavigate();
  const user = getUser(); // your helper that decodes token and returns user object

  function handleLogout() {
    logOut();
    navigate("/login"); // redirect to login page after logout
  }

  return (
    <nav className="flex justify-between items-center px-6 py-3 bg-blue-700 text-white">
      {/* Left: Logout */}
      <button
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-medium"
      >
        Log Out
      </button>

      {/* Right: User Name */}
      {user && (
        <span className="font-semibold text-lg">
          {user.name}
        </span>
      )}
    </nav>
  );
}
