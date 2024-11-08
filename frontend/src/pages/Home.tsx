import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PostModal from '../components/PostModal';

export default function Home() {
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const [posts, setPosts] = useState([]);
    const [postId, setPostId] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [showPostMenu, setShowPostMenu] = useState({ enabled: false, postId: null });
    const [filters, setFilters] = useState({ date: '', source: '', destination: '', space: '' });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserInfo = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const response = await fetch('http://127.0.0.1:5000/profile', {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                });

                if (response.ok) {
                    const data = await response.json();
                    setUser(data);
                    localStorage.setItem('user', JSON.stringify(data));
                    fetchPosts(data.id);
                } else {
                    const errorData = await response.json();
                    setError(errorData.error || 'Failed to fetch user info');
                    navigate('/login');
                }
            } catch (err) {
                setError('An error occurred while fetching user info');
            }
        };

        fetchUserInfo();
    }, [navigate]);

    const fetchPosts = async (userId) => {
        const token = localStorage.getItem('token');
        const response = await fetch('http://127.0.0.1:5000/posts', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        });

        if (response.ok) {
            const data = await response.json();
            setPosts(data);
        }
    };

    const handlePostCreate = () => {
        fetchPosts(user.id);
    };

    const onLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setPosts([]);
        navigate('/login');
    };

    const handleEditPost = (postId) => {
        const postToEdit = posts.find(post => post.id === postId);
        if (postToEdit) {
            setPostId(postId);
            setModalOpen(true);
        }
    };

    const handleDeletePost = async (postId) => {
        const choice = window.confirm('Are you sure you want to delete this post?');
        if (!choice) return;
        const token = localStorage.getItem('token');
        const response = await fetch(`http://127.0.0.1:5000/posts/${postId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        });

        if (response.ok) {
            fetchPosts(user.id);
        }
    };

    const filteredPosts = posts.filter(post => {
        return (
            (filters.date ? post.date === filters.date : true) &&
            (filters.source ? post.source === filters.source : true) &&
            (filters.destination ? post.destination === filters.destination : true) &&
            (filters.space ? post.space === filters.space : true)
        );
    });

    const handleFilterChange = (e) => {
        const { id, value } = e.target;
        setFilters(prevFilters => ({ ...prevFilters, [id]: value }));
    };

    const handleContact = async (post) => {
        const choice = window.confirm('Are you sure you want to contact this user?');
        if (!choice) return;

        const token = localStorage.getItem('token');
        const response = await fetch('http://127.0.0.1:5000/contact', {
            method: 'POST',
            headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ initiator_id: user.id, receiver_id: post.user_id }),
        });

        if (response.ok) {
            navigate(`/inbox`);
        } else {
            const errorData = await response.json();
            alert(errorData.error || 'Failed to contact user');
        }
    };
    const visitProfile = (id) => {
        navigate(`/profile/${id}`);
    }

    return (
        <div>
            <Navbar user={user} onLogout={onLogout} />
            <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 relative"
                style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1483375801503-374c5f660610')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <h1 className="text-5xl font-bold text-center text-white p-4 w-full md:w-3/4 lg:w-1/2 mb-3 bg-opacity-70 bg-gray-800 rounded-md">
                    Want to send a package? Don't worry, we got you covered!
                </h1>
                <input type="text" placeholder="Search for trips" className="w-1/2 p-2 border rounded-md shadow-md" />
                {user?.role === "seller" && (
                    <div className="flex flex-col justify-center items-center mt-4">
                        <span className="text-gray-300 mt-2">OR</span>
                        <button
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md shadow-md transition duration-200 mt-3"
                            onClick={() => setModalOpen(true)}
                        >
                            Create Post
                        </button>
                    </div>
                )}
            </div>

            <div className="flex flex-col p-4 bg-white rounded-lg shadow-md mt-4 mx-4 lg:mx-10">
                <h1 className="text-3xl font-bold mb-4 text-gray-700">Popular Trips</h1>
                <div className="flex justify-center items-center space-x-4 mb-4">
                    <span className="font-medium">Filter By:</span>
                    {["date", "source", "destination", "space"].map((filter) => (
                        <div key={filter} className="flex items-center space-x-2">
                            <label className="font-medium" htmlFor={filter}>{filter.charAt(0).toUpperCase() + filter.slice(1)}</label>
                            <select
                                id={filter}
                                className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                onChange={handleFilterChange}
                            >
                                <option value="" defaultChecked>-</option>
                                {posts.map(post => (
                                    <option key={post.id} value={post[filter]}>{post[filter]}</option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>
            </div>

            {filteredPosts.length === 0 && <h1 className="text-2xl font-bold text-center mt-4">No posts found</h1>}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-6 w-full'>
                {filteredPosts.map(post => (
                    <div key={post.id} className="shadow-lg rounded-lg overflow-hidden transition-transform transform hover:scale-105 bg-white">
                        <div className="flex items-center justify-between p-4 bg-gray-200">
                            <div className="flex items-center cursor-pointer" onClick={()=>{
                                visitProfile(post.user_id);
                            }}>
                                <img src={post.author_pfp} alt="Author" className="w-10 h-10 rounded-full ring-2 ring-white object-cover" />
                                <h3 className='ml-4 font-semibold text-gray-800'>{post.author}</h3>
                            </div>
                            <div className="relative">
                                <span className='font-extrabold text-gray-600 cursor-pointer' onClick={() => {
                                    setShowPostMenu({ enabled: !showPostMenu.enabled, postId: post.id });
                                }}>...</span>
                                {showPostMenu.enabled && showPostMenu.postId === post.id && (
                                    <div className="absolute right-0 top-8 bg-white shadow-lg rounded-md py-2 z-10">
                                        <button className="block text-blue-500 px-4 py-1 hover:bg-gray-200 w-full text-left">Report</button>
                                        {user && user.id === post.user_id && (
                                            <>
                                                <button className="block text-red-500 px-4 py-1 hover:bg-gray-200 w-full text-left" onClick={() => handleDeletePost(post.id)}>Delete</button>
                                                <button className="block text-gray-500 px-4 py-1 hover:bg-gray-200 w-full text-left" onClick={() => handleEditPost(post.id)}>Edit</button>
                                            </>
                                        )}
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
                            <button
                                className={`w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded mt-4 ${post.author === user?.full_name ? 'cursor-not-allowed bg-gray-400' : ''}`}
                                onClick={() => handleContact(post)}
                                disabled={post.author === user?.full_name}
                            >
                                {post.author === user?.full_name ? 'Your Post' : 'Contact'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <PostModal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setPostId(null);
                }}
                onPostCreate={handlePostCreate}
                postToEdit={posts.find(post => post.id === postId)}
            />
        </div>
    );
}
