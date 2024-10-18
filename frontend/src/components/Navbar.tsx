import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import pfp from '../assets/pfp.png';

const Navbar = ({ user, onLogout }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout(); // Call logout function
    navigate('/login'); // Redirect to login page
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold">trackit</h1>
        <div className="flex items-center">
          {user?.role==undefined&&<button className="bg-blue-500 text-white px-4 py-2 rounded-md mr-4">
            Become a Seller
          </button>}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center text-gray-700 focus:outline-none ring-2 ring-gray-300 rounded-full p-1"
            >
              <img
                src={user?.profile_pic ? user.profile_pic : pfp} 
                alt="User Avatar"
                className="w-8 h-8 rounded-full"
              />
                <span className="ml-2 p-2">Welcome {user?.full_name}!</span>
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg">
                <div className="py-2">
                  <button
                    onClick={() => navigate(`/profile/${user.full_name}`)}
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-100 w-full text-left"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => navigate(`/inbox`)}
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-100 w-full text-left"
                  >
                    Inbox
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-100 w-full text-left"
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
