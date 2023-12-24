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
        <>
            Enter Referral
            <br />
            <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder="Referral Code"
            />
            <button onClick={handleReferralSubmit}>Go to Note</button>
            <br /><br />
            <Link to="/notes">Create Section</Link>
        </>
    );
};

export default Home;
