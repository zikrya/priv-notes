import React, { useState } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { db } from '../utils/firebase-config';
import { collection, addDoc } from 'firebase/firestore';
import { generateReferralCode } from '../utils/useReferralCodes';
import { useParams } from 'react-router-dom';
import FirebaseUploadAdapter from '../utils/FirebaseUploadAdapter';

const Notes = () => {
    const { referralCode: urlReferralCode } = useParams();
    const [content, setContent] = useState('');
    const [referralCode, setReferralCode] = useState("");

    const handleEditorChange = (event, editor) => {
        const data = editor.getData();
        setContent(data);
    };

    const handleSubmit = async () => {
        const generatedCode = generateReferralCode();
        setReferralCode(generatedCode);
        try {
            const docRef = await addDoc(collection(db, "notes"), {
                note: content,
                referralCode: generatedCode
            });
            console.log("Document written with ID: ", docRef.id);
        } catch (e) {
            console.error("Error adding document: ", e);
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
            {referralCode && <p>Generated Referral Code: {referralCode}</p>}
        </>
    );
};

export default Notes;


