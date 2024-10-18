import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const [profileData, setProfileData] = useState(null);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch('http://127.0.0.1:5000/profile', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    setError(errorData.error || 'Failed to fetch profile');
                    if (response.status === 404) {
                        // Redirect if user not found
                        navigate('/login'); // Change this path to your login route
                    }
                    return;
                }

                const data = await response.json();
                setProfileData(data);
                setFullName(data.full_name);
                setEmail(data.email);
                setRole(data.role);
            } catch (err) {
                setError('An error occurred while fetching profile data');
            }
        };

        fetchProfile();
    }, [token, navigate]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        if (password && password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        const formData = new FormData();
        formData.append('full_name', fullName);
        formData.append('password', password);
        formData.append('role', role);

        try {
            const response = await fetch('http://127.0.0.1:5000/profile', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                setMessage('Profile updated successfully!');
                // Optionally update profile data in state
                setProfileData(data);
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to update profile');
            }
        } catch (err) {
            setError('An error occurred while updating your profile');
        }
    };

    const handleDeleteProfile = async () => {
        try {
            const response = await fetch('http://127.0.0.1:5000/profile', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                navigate('/login'); // Change this path to your desired route after deletion
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to delete profile');
            }
        } catch (err) {
            setError('An error occurred while deleting your profile');
        }
    };

    if (error) {
        return <div className="text-red-500 text-center">{error}</div>;
    }

    if (!profileData) {
        return <div className="text-center">Loading...</div>;
    }

    return (
        <div className="h-screen flex justify-center items-center">
            <div className="bg-white p-6 rounded shadow-md w-full max-w-sm">
                <h2 className="text-xl mb-4 text-center">Profile</h2>
                {profileData.profile_pic && (
                    <img
                        src={profileData.profile_pic}
                        alt="Profile"
                        className="w-full h-32 object-cover rounded mb-4"
                    />
                )}
                <form onSubmit={handleUpdateProfile}>
                    <div className="mb-4">
                        <label className="block mb-1">Full Name</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full px-3 py-2 border rounded"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            className="w-full px-3 py-2 border rounded"
                            disabled
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-1">Role</label>
                        <input
                            type="text"
                            value={role}
                            className="w-full px-3 py-2 border rounded"
                            disabled
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-1">New Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border rounded"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-1">Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-3 py-2 border rounded"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                    >
                        Update Profile
                    </button>
                </form>
                <button
                    onClick={handleDeleteProfile}
                    className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 mt-4"
                >
                    Delete Profile
                </button>
                {message && <p className="mt-4 text-center text-green-500">{message}</p>}
            </div>
        </div>
    );
};

export default Profile;
