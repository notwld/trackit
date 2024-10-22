import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const EmailVerification = () => {
    const location = useLocation();
    const email = location.state?.email;
    const [otp, setOtp] = useState(new Array(4).fill(''));
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Handle OTP input change
    const handleChange = (element, index) => {
        if (isNaN(element.value)) return;

        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);

        // Focus on the next input field if the user types a number
        if (element.nextSibling && element.value !== '') {
            element.nextSibling.focus();
        }
    };

    // Function to request an OTP for the provided email
    const requestOtp = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://127.0.0.1:5000/get-email-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();
            if (data.success) {
                setMessage('OTP sent to your email.');
            } else {
                setMessage(data.message || 'Failed to generate OTP.');
            }
        } catch (error) {
            setMessage('An error occurred while requesting OTP.');
        } finally {
            setLoading(false);
        }
    };

    // Function to verify the entered OTP
    const verifyOtp = async () => {
        const otpCode = otp.join('');
        setLoading(true);
        try {
            const response = await fetch('http://127.0.0.1:5000/verify-email-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: otpCode }),
            });

            const data = await response.json();
            if (data.success) {
                setMessage('OTP verified successfully!');
                setTimeout(() => navigate('/role_selection'), 1500);
            } else {
                setMessage(data.message || 'Invalid OTP.');
            }
        } catch (error) {
            setMessage('An error occurred while verifying OTP.');
        } finally {
            setLoading(false);
        }
    };

    // Request OTP on component mount (optional)
    React.useEffect(() => {
        if (email) {
            requestOtp();
        }
    }, [email]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-center mb-6">Verify OTP</h2>
                {message && <p className="text-center text-gray-600 mb-4">{message}</p>}
                <div className="flex justify-center space-x-2 mb-6">
                    {otp.map((data, index) => (
                        <input
                            key={index}
                            type="text"
                            maxLength="1"
                            className="w-12 h-12 text-center text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={data}
                            onChange={(e) => handleChange(e.target, index)}
                            onFocus={(e) => e.target.select()}
                        />
                    ))}
                </div>
                <button
                    onClick={verifyOtp}
                    className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors disabled:bg-gray-400"
                    disabled={loading}
                >
                    {loading ? 'Verifying...' : 'Submit OTP'}
                </button>
            </div>
        </div>
    );
};

export default EmailVerification;
