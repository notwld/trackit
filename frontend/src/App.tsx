import { Outlet, Navigate, useLocation, useOutletContext, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

// Main App component
const App = () => {
  const navigate = useNavigate();
  // Check for a token in localStorage (indicates the user is logged in)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/home');  
    }
  }, []);

  return (
    <div>
      <Outlet />
    </div>
  );
};

const ProtectedRoute = ({ children }) => {
 const token = localStorage.getItem('token');
  const location = useLocation();

  return token ? (
    children
  ) : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
};

export { App, ProtectedRoute };
