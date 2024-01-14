import React, { useEffect, useState } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { db } from '../utils/firebase-config';
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { generateReferralCode } from '../utils/useReferralCodes';
import { useParams } from 'react-router-dom';
import FirebaseUploadAdapter from '../utils/FirebaseUploadAdapter';

const Notes = () => {
    const { referralCode: urlReferralCode } = useParams();
    const [content, setContent] = useState('');
    const [referralCode, setReferralCode] = useState("");
    const [noteDocId, setNoteDocId] = useState(null);

    const handleEditorChange = (event, editor) => {
        const data = editor.getData();
        setContent(data);
    };

    useEffect(() => {
        const fetchNoteContent = async () => {
            if (urlReferralCode) {
                const notesRef = collection(db, "notes");
                const q = query(notesRef, where("referralCode", "==", urlReferralCode));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    const noteData = querySnapshot.docs[0].data();
                    setContent(noteData.note);
                    setNoteDocId(querySnapshot.docs[0].id); // Store the doc ID for updates
                    setReferralCode(urlReferralCode);
                } else {
                    console.log("No note found for this referral code.");
                    // Handle the case where no note is found
                }
            }
        };

        fetchNoteContent();
    }, [urlReferralCode]);

    const handleSubmit = async () => {
        if (urlReferralCode && noteDocId) {
            // Update existing note
            const noteRef = doc(db, "notes", noteDocId);
            try {
                await updateDoc(noteRef, { note: content });
                console.log("Note updated with ID: ", noteDocId);
            } catch (e) {
                console.error("Error updating document: ", e);
            }
        } else {
            // Create new note
            const generatedCode = generateReferralCode();
            setReferralCode(generatedCode);
            try {
                const docRef = await addDoc(collection(db, "notes"), {
                    note: content,
                    referralCode: generatedCode
                });
                setNoteDocId(docRef.id); // Store the new doc ID for potential future updates
                console.log("Document written with ID: ", docRef.id);
            } catch (e) {
                console.error("Error adding document: ", e);
            }
        }
    };

    const useFirebaseUploadAdapter = (editor) => {
        editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
            return new FirebaseUploadAdapter(loader);
        };
    };

    return (
        <>
            <CKEditor
                editor={ClassicEditor}
                data={content}
                onChange={handleEditorChange}
                onReady={editor => {
                    useFirebaseUploadAdapter(editor);
                }}
            />
            <button onClick={handleSubmit}>{urlReferralCode ? 'Update Note' : 'Save Note'}</button>
            {referralCode && <p>Your Referral Code: {referralCode}</p>}
        </>
    );
};

export default Notes;





