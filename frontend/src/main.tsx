import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import {App,ProtectedRoute} from './App';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import './index.css';
import RoleSelection from './pages/RoleSelection';
import Profile from './pages/Profile';
import Inbox from './pages/Inbox';
import EmailVerification from './pages/EmailVerify';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "login",
        element: <Login />, 
      },
      {
        path: "signup",
        element: <Signup />,  
      },
      {
        path: "otp",
        element: <EmailVerification />,  
      },
      {
        path: "role_selection",
        element: (
          <ProtectedRoute>
            <RoleSelection />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile/:name",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "inbox",
        element: (
          <ProtectedRoute>
            <Inbox />
          </ProtectedRoute>
        ),
      },
      {
        path: "inbox/:user_id/:contact_id",
        element: (
          <ProtectedRoute>
            <Inbox />
          </ProtectedRoute>
        ),
      },
      {
        path: "home",
        element: (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
    <RouterProvider router={router} />
);
