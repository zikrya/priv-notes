import React, { useEffect, useRef, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { db } from '../utils/firebase-config';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { generateReferralCode } from '../utils/useReferralCodes';
import { useParams } from 'react-router-dom';

const Notes = () => {
    const { referralCode: urlReferralCode } = useParams(); // Get referral code from URL
    const [referralCode, setReferralCode] = useState("");
    const quillRef = useRef(null);
    const quillInstance = useRef(null);

    useEffect(() => {
        if (quillRef.current) {
            quillInstance.current = new Quill(quillRef.current, {
                theme: 'snow',
                modules: {
                    toolbar: [['bold', 'italic', 'underline'], ['image', 'link']]
                }
            });
        }

        if (urlReferralCode) {
            // Fetch the note from Firebase if there's a referral code
            const fetchNote = async () => {
                const q = query(collection(db, "notes"), where("referralCode", "==", urlReferralCode));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    const docData = querySnapshot.docs[0].data();
                    quillInstance.current.root.innerHTML = docData.note; // Set the fetched note content
                } else {
                    console.log("No note found for this referral code.");
                }
            };

            fetchNote();
        }
    }, [urlReferralCode]); // Dependency on the URL referral code

    const handleSubmit = async () => {
        // Generate a new referral code only if creating a new note
        const generatedCode = urlReferralCode ? urlReferralCode : generateReferralCode();
        setReferralCode(generatedCode);

        const noteContent = quillInstance.current.root.innerHTML;

        try {
            const docRef = await addDoc(collection(db, "notes"), {
                note: noteContent,
                referralCode: generatedCode
            });
            console.log("Document written with ID: ", docRef.id);
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    };

    return (
        <>
            <div ref={quillRef} style={{ height: 200 }}></div>
            <button onClick={handleSubmit}>{urlReferralCode ? 'Update Note' : 'Save Note'}</button>
            {referralCode && <p>Generated Referral Code: {referralCode}</p>}
        </>
    );
};

export default Notes;

