import React, { useEffect, useRef, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css'; // Import Quill's styles
import { db } from '../utils/firebase-config';
import { collection, addDoc } from 'firebase/firestore';
import { generateReferralCode } from '../utils/useReferralCodes';

const Notes = () => {
    const [referralCode, setReferralCode] = useState("");
    const quillRef = useRef(null);
    const quillInstance = useRef(null); // To store the Quill instance

    useEffect(() => {
        if (quillRef.current) {
            quillInstance.current = new Quill(quillRef.current, {
                theme: 'snow',
                modules: {
                    toolbar: [['bold', 'italic', 'underline'], ['image', 'link']] // Customize as needed
                }
            });
        }
    }, []);

    const handleSubmit = async () => {
        const generatedCode = generateReferralCode();
        setReferralCode(generatedCode);

        const noteContent = quillInstance.current.root.innerHTML; // Get HTML content

        try {
            const docRef = await addDoc(collection(db, "notes"), {
                note: noteContent, // Save the HTML content
                referralCode: generatedCode
            });
            console.log("Document written with ID: ", docRef.id);
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    };

    return (
        <>
            Notes
            <div ref={quillRef} style={{ height: 200 }}></div> {/* Quill editor container */}
            <button onClick={handleSubmit}>Save Note</button>
            {referralCode && <p>Generated Referral Code: {referralCode}</p>}
        </>
    );
};

export default Notes;
