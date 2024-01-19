import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
    const [referralCode, setReferralCode] = useState('');
    const navigate = useNavigate();

    const handleReferralSubmit = () => {
        // Navigate to the Notes component with the referral code
        navigate(`/notes/${referralCode}`);
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <div className="text-lg font-semibold mb-4">
                Enter Referral
            </div>

            <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder="Referral Code"
                className="p-2 mb-2 rounded border border-gray-300"
            />
            <button
                onClick={handleReferralSubmit}
                className="p-2 mb-4 rounded bg-blue-500 text-white hover:bg-blue-600"
            >
                Go to Note
            </button>

            <Link
                to="/notes"
                className="text-blue-600 hover:text-blue-700 font-medium"
            >
                Create Section
            </Link>
        </div>
    );
};

export default Home;
