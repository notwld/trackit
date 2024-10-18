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
    const [filters, setFilters] = useState({
        date: '',
        source: '',
        destination: '',
        space: '',
    });
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
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setUser(data);
                    fetchPosts(data.id); // Fetch posts after setting user
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
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const data = await response.json();
            setPosts(data); // Set posts state with fetched data
        }
    };

    const handlePostCreate = () => {
        fetchPosts(user.id); // Refresh posts after creating a new one
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
        const token = localStorage.getItem('token');
        const response = await fetch(`http://127.0.0.1:5000/posts/${postId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            fetchPosts(user.id); // Refresh posts after deletion
        }
    };

    // Filtered posts based on selected filters
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
        setFilters((prevFilters) => ({
            ...prevFilters,
            [id]: value,
        }));
    };

    return (
        <div>
            <Navbar user={user} onLogout={onLogout} />
            <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100"
                style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <input type="text" placeholder="Search for trips" className="w-1/2 p-2 border rounded-md" />
                {user?.role === "seller" && (
                    <div className="flex flex-col justify-center items-center">
                        <span className="text-gray-500 mt-2">OR</span>
                        <button
                            className="bg-blue-500 text-white px-4 py-2 rounded-md ml-2 mt-3"
                            onClick={() => setModalOpen(true)}
                        >
                            Create Post
                        </button>
                    </div>
                )}
            </div>
            <div className="flex flex-col p-4 bg-white rounded-lg shadow-md mt-4">
                <h1 className="text-3xl font-bold mb-4">Popular Trips</h1>
                <div className="flex justify-center items-center space-x-4">
                    <span className="font-medium">Filter By:</span>
                    <div className="flex items-center space-x-2">
                        <label className="font-medium" htmlFor="date">Date</label>
                        <select id="date" className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" onChange={handleFilterChange}>
                            <option value="" defaultChecked>-</option>
                            {posts.map(post => (
                                <option key={post.id} value={post.date}>{post.date}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center space-x-2">
                        <label className="font-medium" htmlFor="source">Source</label>
                        <select id="source" className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" onChange={handleFilterChange}>
                            <option value="" defaultChecked>-</option>
                            {posts.map(post => (
                                <option key={post.id} value={post.source}>{post.source}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center space-x-2">
                        <label className="font-medium" htmlFor="destination">Destination</label>
                        <select id="destination" className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" onChange={handleFilterChange}>
                            <option value="" defaultChecked>-</option>
                            {posts.map(post => (
                                <option key={post.id} value={post.destination}>{post.destination}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center space-x-2">
                        <label className="font-medium" htmlFor="space">Space</label>
                        <select id="space" className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" onChange={handleFilterChange}>
                            <option value="" defaultChecked>-</option>
                            {posts.map(post => (
                                <option key={post.id} value={post.space}>{post.space} Kg</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
            {filteredPosts.length === 0 && <h1 className="text-2xl font-bold text-center mt-4">No posts found</h1>}
            <div className='grid grid-cols-3 gap-4 p-4 w-100'>

                {
                    filteredPosts.map(post => (
                        <div key={post.id} className="shadow-md w-fullitems-center rounded-xl">
                            <div className="flex my-2 justify-start items-center p-3 bg-gray-300">
                                <img src={post.author_pfp} alt="Trip" className="w-10 h-10 object-fit rounded-full" />
                                <h3 className='ml-2'>{post.author}</h3>
                                
                            </div>
                            <div className="p-4">
                            <h1 className="text-3xl font-bold">{post.title}</h1>
                            <p className="text-lg mt-3 text-gray-500">{post.description}</p>
                            <div className='mt-3 w-100'>
                                <div className="flex justify-between items-center w-100 ">
                                    <div>
                                        <h3>Departure</h3>
                                        <p>{post.source}</p>
                                    </div>
                                    <div>
                                        <h3>Arrival</h3>
                                        <p>{post.destination}</p>
                                    </div>
                                </div>
                                <div className='flex justify-between items-center'>
                                    <h3>Space: {post.space}kg</h3>
                                    <h4>Date: {post.date}</h4>
                                </div>
                                <button className="bg-blue-500 text-white px-4 py-2 rounded-md mt-4">Contact user</button>
                                {user && post?.user_id === user?.id && (
                                    <div className="flex justify-between mt-2">
                                        <button onClick={() => handleEditPost(post.id)} className="text-blue-500">Edit</button>
                                        <button onClick={() => handleDeletePost(post.id)} className="text-red-500">Delete</button>
                                    </div>
                                )}
                            </div>
                            </div>
                        </div>
                    ))}
            </div>

            <PostModal
                isOpen={modalOpen}
                onClose={() => {
                    setPostId(null)
                    setModalOpen(false)
                }}
                onPostCreated={handlePostCreate}
                postToEdit={posts.find(post => post.id === postId)}
            />
        </div>
    );
}
