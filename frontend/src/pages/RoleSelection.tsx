import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RoleSelection = () => {
    const [selectedRole, setSelectedRole] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    const handleRoleChange = (role) => {
        setSelectedRole(role);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (selectedRole) {
            try {
                const formData = new FormData();
                formData.append('role', selectedRole); // Append the selected role to FormData
    
                const response = await fetch('http://127.0.0.1:5000/profile', {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                    body: formData // Send the FormData
                });
    
                if (response.ok) {
                    setMessage('Role updated successfully!');
                    // Navigate after a short delay to show the message
                    setTimeout(() => navigate('/home'), 2000);
                } else {
                    const errorData = await response.json();
                    setError(errorData.error || 'Failed to update role');
                }
            } catch (err) {
                setError('An error occurred while updating your role');
            }
        } else {
            setError('Please select a role before submitting.');
        }
    };
    

    return (
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-center mb-4">Select Your Role</h2>
            <form onSubmit={handleSubmit}>
                <div className="flex flex-col mb-4">
                    <label className="flex items-center">
                        <input
                            type="radio"
                            value="buyer"
                            checked={selectedRole === 'buyer'}
                            onChange={() => handleRoleChange('buyer')}
                            className="mr-2"
                        />
                        Buyer
                    </label>
                    <label className="flex items-center">
                        <input
                            type="radio"
                            value="seller"
                            checked={selectedRole === 'seller'}
                            onChange={() => handleRoleChange('seller')}
                            className="mr-2"
                        />
                        Seller
                    </label>
                </div>
                <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
                    Submit
                </button>
            </form>
            {message && <p className="mt-4 text-center text-green-500">{message}</p>}
            {error && <p className="mt-4 text-center text-red-500">{error}</p>}
        </div>
    );
};

export default RoleSelection;
