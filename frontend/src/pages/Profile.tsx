import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const Profile = () => {
    const {profileId} = useParams();
    const [profileData, setProfileData] = useState(null);
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    const [showPostMenu, setShowPostMenu] = useState({
        enabled: false,
        postId: null
    });

    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:5000/profile/${profileId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    setError(errorData.error || 'Failed to fetch profile');
                    if (response.status === 404) {

                        navigate('/login');
                    }
                    return;
                }

                const data = await response.json();
                setProfileData(data);
                console.log(data);
                setPosts(data.posts);
                setUser(data);
                setFullName(data.full_name);
                setEmail(data.email);
                setRole(data.role);
            } catch (err) {
                setError('An error occurred while fetching profile data');
            }
        };
        // const fetchPosts = async () => {
        //     const token = localStorage.getItem('token');
        //     const response = await fetch(`http://127.0.0.1:5000/posts/user/${profileData?.id}`, {
        //         method: 'GET',
        //         headers: {
        //             'Content-Type': 'application/json',
        //             'Authorization': `Bearer ${token}`,
        //         },
        //     });

        //     if (response.ok) {
        //         const data = await response.json();
        //         console.log(data);
        //         setPosts(data); // Set posts state with fetched data
        //     }
        // };
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
        <div>
             <div className=" m-4">
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => navigate('/home')}>
                    back
                </button>
            </div>
            <div className="h-screen flex justify-center items-start my-20">
           
           <div className="bg-white p-6 rounded shadow-md w-full max-w-sm">
               <h2 className="text-xl mb-4 text-center">Profile</h2>
               {profileData.profile_pic && (
                   <img
                       src={profileData.profile_pic}
                       alt="Profile"
                       className="w-24 h-24 rounded-full mx-auto mb-4"
                   />
               )}
               <form onSubmit={handleUpdateProfile}>
                   <div className="mb-4">
                       <label className="block mb-1">Full Name</label>
                       <input
                           type="text"
                           value={fullName}
                           disabled={profileId == user.id}
                           onChange={(e) => setFullName(e.target.value)}
                           className="w-full px-3 py-2 border rounded"
                       />
                   </div>
                   <div className="mb-4">
                       <label className="block mb-1">Email</label>
                       <input
                           type="email"
                           disabled={user.id !== profileData.id}

                           value={email}
                           className="w-full px-3 py-2 border rounded"
                           disabled={profileId == user.id}
                       />
                   </div>
                   <div className="mb-4">
                       {/* <label className="block mb-1">Role</label>
                       <input
                           type="text"
                           value={role}
                           className="w-full px-3 py-2 border rounded"
                           disabled
                       /> */}
                       <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-3 py-2 border rounded" disabled={profileId == user.id}>
                            <option value="buyer">Buyer</option>
                            <option value="seller">Seller</option>
                        </select>
                   </div>
                  {user.id === profileId && (
                     <>
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
                   <button
                   onClick={handleDeleteProfile}
                   className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 mt-4"
               >
                   Delete Profile
               </button>
                 </>
                  )}
                   
               </form>
               
               {message && <p className="mt-4 text-center text-green-500">{message}</p>}
           </div>
           <div className="ml-5 p-6">
               <h1 className="text-3xl font-bold mb-4">
                   Your Posts
               </h1>
               {posts.length === 0 && <h1 className="text-2xl font-bold text-center mt-4">No posts found</h1>}
               <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-6 w-full'>
                   {
                       posts.map(post => (
                           <div key={post.id} className="shadow-lg rounded-lg overflow-hidden transition-transform transform hover:scale-105 bg-white">
                               <div className="flex items-center justify-between p-4 bg-gray-100">
                                   <div className="flex items-center">
                                       <img src={post.profile_pic} alt="Author" className="w-10 h-10 rounded-full ring-2 ring-white object-cover" />
                                       <h3 className='ml-4 font-semibold'>{post.author}</h3>
                                   </div>
                                   <div className="relative">
                                       <span className='font-extrabold text-gray-500 cursor-pointer' onClick={() => {
                                           setShowPostMenu({
                                               enabled: !showPostMenu.enabled,
                                               postId: post.id
                                           })
                                       }}>...</span>
                                       {showPostMenu.enabled && showPostMenu.postId === post.id && (
                                           <div className="absolute right-0 top-8 bg-white shadow-lg rounded-md py-2 z-10">


                                               <button className="block text-red-500 px-4 py-1 hover:bg-gray-200 w-full text-left" onClick={() => handleDeletePost(post.id)}>Delete</button>
                                               <button className="block text-gray-500 px-4 py-1 hover:bg-gray-200 w-full text-left" onClick={() => handleEditPost(post.id)}>Edit</button>

                                           </div>
                                       )}
                                   </div>
                               </div>
                               <div className="p-6">
                                   <h1 className="text-xl font-bold text-gray-900">{post.title}</h1>
                                   <p className="text-gray-600 mt-2">{post.description}</p>
                                   <div className='mt-4'>
                                       <div className="flex justify-between items-center mb-2">
                                           <div>
                                               <h4 className="font-semibold text-gray-800">Departure:</h4>
                                               <p className="text-gray-500">{post.source}</p>
                                           </div>
                                           <div>
                                               <h4 className="font-semibold text-gray-800">Arrival:</h4>
                                               <p className="text-gray-500">{post.destination}</p>
                                           </div>
                                       </div>
                                       <div className="flex justify-between items-center text-gray-600">
                                           <h4>Space: {post.space}kg</h4>
                                           <h4>Date: {post.date}</h4>
                                       </div>
                                   </div>

                               </div>
                           </div>
                       ))
                   }
               </div>
           </div>
       </div>
        </div>
       
    );
};

export default Profile;
