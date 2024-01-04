import React, { useEffect, useRef, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { db } from '../utils/firebase-config';
import { collection, addDoc, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { generateReferralCode } from '../utils/useReferralCodes';
import { useParams } from 'react-router-dom';

const Notes = () => {
    const { referralCode: urlReferralCode } = useParams();
    const [referralCode, setReferralCode] = useState("");
    const [noteDocId, setNoteDocId] = useState(null);
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

        const fetchNote = async () => {
            if (urlReferralCode) {
                const notesQuery = query(collection(db, "notes"), where("referralCode", "==", urlReferralCode));
                const querySnapshot = await getDocs(notesQuery);
                if (!querySnapshot.empty) {
                    const docData = querySnapshot.docs[0].data();
                    quillInstance.current.root.innerHTML = docData.note;
                    setNoteDocId(querySnapshot.docs[0].id);
                    setReferralCode(urlReferralCode);
                } else {
                    console.log("No note found for this referral code.");
                }
            }
        };

        fetchNote();
    }, [urlReferralCode]);

    const handleSubmit = async () => {
        const noteContent = quillInstance.current.root.innerHTML;

        if (urlReferralCode && noteDocId) {
            try {
                const noteRef = doc(db, "notes", noteDocId);
                await updateDoc(noteRef, { note: noteContent });
                console.log("Note updated with ID: ", noteDocId);
            } catch (e) {
                console.error("Error updating document: ", e);
            }
        } else {
            // Save as a new note
            try {
                const generatedCode = generateReferralCode();
                setReferralCode(generatedCode);
                const docRef = await addDoc(collection(db, "notes"), {
                    note: noteContent,
                    referralCode: generatedCode
                });
                setNoteDocId(docRef.id);
                console.log("Document written with ID: ", docRef.id);
            } catch (e) {
                console.error("Error adding document: ", e);
            }
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

