import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('full_name', fullName);
    formData.append('email', email);
    formData.append('password', password);
    if (profilePic) {
      formData.append('profile_pic', profilePic);
    }

    const response = await fetch('http://127.0.0.1:5000/register', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (response.ok) {
      localStorage.setItem('token', data.access_token); // replace with actual token from the response
      if(data.role=='user'||data.role!='seller'||data.role!='buyer'){
        navigate('/role_selection');
        return
      }
      navigate('/home');
    } else {
      setError(data.error || 'Signup failed');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form className="bg-white p-6 rounded shadow-md w-full max-w-sm" onSubmit={handleSignup}>
        <h2 className="text-xl mb-4 text-center">Sign Up</h2>
        <div className="mb-4">
          <label className="block mb-1">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Profile Picture</label>
          <input type="file" onChange={(e) => setProfilePic(e.target.files[0])} />
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button className="w-full bg-green-500 text-white py-2 rounded">Sign Up</button>
      </form>
    </div>
  );
};

export default Signup;
