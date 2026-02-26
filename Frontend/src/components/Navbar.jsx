import { useSelector, useDispatch } from "react-redux";
import { assets, baseURL } from "../assets/assets";
import { Link, useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import axios from "axios";
import { logoutUser } from "../redux/slices/authSlice";
import toast from "react-hot-toast";
import ThemeToggle from "./ThemeToggle";

const NavBar = () => {
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post(`${baseURL}auth/logout`, {}, { withCredentials: true });
      dispatch(logoutUser());
      toast.success("Logout Successfully");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  return (
    <nav className="sticky top-0 z-10 bg-white dark:bg-gray-900 p-3 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img
            src={assets.logo}
            alt="Western Logo"
            className="h-10 w-auto mr-3"
          />
          <h1 className="text-2xl font-bold text-blue-800 dark:text-blue-400 tracking-wide">
            Western Refrigeration Pvt.Ltd
          </h1>
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />

          <div className="w-12 h-12 bg-gray-700 dark:bg-gray-600 rounded-full flex items-center justify-center text-xl font-bold text-white">
            U
          </div>
          <div>
            <div className="text-black dark:text-white font-semibold font-playfair">
              {user.name}
            </div>
            <div
              className={`${
                user.role === "admin"
                  ? "text-red-500 dark:text-red-400"
                  : "text-gray-400 dark:text-gray-500"
              } text-sm`}
            >
              {user.role}
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Logout"
            className="text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
          >
            <FiLogOut size={24} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
