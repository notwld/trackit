import React, { useEffect, useState } from 'react';

const PostModal = ({ isOpen, onClose, onPostCreate, postToEdit }) => {
    const [title, setTitle] = useState(postToEdit?.title || '');
    const [description, setDescription] = useState(postToEdit?.description || '');
    const [source, setSource] = useState(postToEdit?.source || '');
    const [destination, setDestination] = useState(postToEdit?.destination || '');
    const [space, setSpace] = useState(postToEdit?.space || '');
    const [date, setDate] = useState(postToEdit?.date || '');
    useEffect(() => {
        setTitle(postToEdit?.title || '');
        setDescription(postToEdit?.description || '');
        setSource(postToEdit?.source || '');
        setDestination(postToEdit?.destination || '');
        setSpace(postToEdit?.space || '');
        setDate(postToEdit?.date || '');
    }, [postToEdit]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const response = await fetch('http://127.0.0.1:5000/posts', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, description, source, destination, space, date }),
        });
        
        if (response.ok) {
            onPostCreate();
            setTitle('');
            setDescription('');
            setSource('');
            setDestination('');
            setSpace('');
            setDate('');
            onClose();
            
        }
    };
    const handleUpdate = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const response = await fetch(`http://127.0.0.1:5000/posts/${postToEdit.id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, description, source, destination, space, date }),
        });

        if (response.ok) {
            onPostCreate();
            setTitle('');
            setDescription('');
            setSource('');
            setDestination('');
            setSpace('');
            setDate('');
            onClose();

        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-4 rounded-md w-96">
                <h2 className="text-xl mb-4">{postToEdit?.id ? 'Edit' : 'Create'} Post</h2>
                <form onSubmit={postToEdit?.id ? handleUpdate : handleSubmit}>
                    <input
                        type="text"
                        placeholder="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full p-2 border rounded mb-2"
                        required
                    />
                    <textarea
                        placeholder="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-2 border rounded mb-2"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Source"
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                        className="w-full p-2 border rounded mb-2"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Destination"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        className="w-full p-2 border rounded mb-2"
                        required
                    />
                    <input
                        type="number"
                        placeholder="Space"
                        value={space}
                        onChange={(e) => setSpace(e.target.value)}
                        className="w-full p-2 border rounded mb-2"
                        required
                    />
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full p-2 border rounded mb-2"
                        required
                    />
                    <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">{postToEdit?.id ? 'Update' : 'Create'}</button>
                    <button type="button" onClick={onClose} className="bg-gray-300 text-black px-4 py-2 rounded ml-2">Cancel</button>
                </form>
            </div>
        </div>
    );
};

export default PostModal;
