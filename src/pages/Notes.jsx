import { db } from '../utils/firebase-config';
import { collection, addDoc } from 'firebase/firestore';
import { useState } from 'react';
import { generateReferralCode } from '../utils/useReferralCodes';

const Notes = () => {
    const [note, setNote] = useState("");
    const [referralCode, setReferralCode] = useState("");
    const handleSubmit = async (e) => {
        e.preventDefault();
        const generatedCode = generateReferralCode(); // Generate the referral code
        setReferralCode(generatedCode); // Set the referral code state

        try {
            const docRef = await addDoc(collection(db, "notes"), {
                note: note,
                referralCode: generatedCode // Use the generated code here
            });
            console.log("Document written with ID: ", docRef.id);
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    };

    return (
        <>
            Notes
            <br />
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                />
                <button type="submit">Submit</button>
            </form>
            {referralCode && <p>Generated Referral Code: {referralCode}</p>} {/* Display the code */}
            <canvas id="myCanvas" width="200" height="100" style="border:1px solid #000000;"/>
        </>
    );
};

export default Notes;
