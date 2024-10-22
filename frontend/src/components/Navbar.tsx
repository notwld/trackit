import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import pfp from '../assets/pfp.png';

const Navbar = ({ user, onLogout }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-600 cursor-pointer" onClick={() => navigate('/')}>
          trackit
        </h1>

        <div className="flex items-center space-x-6">
          {!user?.role && (
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-200 ease-in-out">
              Become a Seller
            </button>
          )}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center text-gray-700 focus:outline-none ring-2 ring-gray-300 rounded-full p-1 transition duration-200 ease-in-out hover:ring-blue-400"
            >
              <img
                src={user?.profile_pic ? user.profile_pic : pfp}
                alt="User Avatar"
                className="w-10 h-10 rounded-full"
              />
              <span className="ml-2 text-gray-700 font-medium hidden sm:inline-block">
                Welcome {user?.full_name}!
              </span>
            </button>

            {dropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg transition-opacity duration-200 ease-out"
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <div className="py-2">
                  <button
                    onClick={() => navigate(`/profile/${user.id}`)}
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-100 w-full text-left transition duration-150"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => navigate(`/inbox`)}
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-100 w-full text-left transition duration-150"
                  >
                    Inbox
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-100 w-full text-left transition duration-150"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
