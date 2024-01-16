import React, { useState, useEffect, useRef } from 'react';
import { Editor, EditorState, convertFromRaw, convertToRaw, AtomicBlockUtils, Entity, ContentState } from 'draft-js';
import 'draft-js/dist/Draft.css';
import { db, storage } from '../utils/firebase-config'; // Import your firebase config
import { collection, addDoc, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { getStorage, ref as firebaseRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { generateReferralCode } from '../utils/useReferralCodes';
import { useParams } from 'react-router-dom';
import ImageRender from '../components/ImageRender';
import createImagePlugin from '@draft-js-plugins/image';


const Notes = () => {
    const imagePlugin = createImagePlugin();
    const [editorState, setEditorState] = useState(EditorState.createEmpty());
    const [referralCode, setReferralCode] = useState('');
    const imageInputRef = useRef(null);
    const { referralCode: urlReferralCode } = useParams();

    useEffect(() => {
        if (urlReferralCode) {
            // Fetch the note content from Firestore using the referral code
            const fetchNote = async () => {
                const notesRef = collection(db, "notes");
                const q = query(notesRef, where("referralCode", "==", urlReferralCode));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    const noteData = querySnapshot.docs[0].data();
                    const contentState = convertFromRaw(noteData.note);
                    setEditorState(EditorState.createWithContent(contentState));
                }
            };
            fetchNote();
        }
    }, [urlReferralCode]);

    const handleEditorChange = (newEditorState) => {
        setEditorState(newEditorState);
    };

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const storage = getStorage();
            const storagePath = `images/${Date.now()}-${file.name}`;
            const imageRef = firebaseRef(storage, storagePath);

            try {
                const uploadResult = await uploadBytes(imageRef, file);
                const imageUrl = await getDownloadURL(uploadResult.ref);
                insertImageInEditor(imageUrl);
            } catch (error) {
                console.error('Error uploading image: ', error);
            }
        }
    };

    const insertImageInEditor = (imageUrl) => {
        const contentState = editorState.getCurrentContent();
        const contentStateWithEntity = contentState.createEntity('IMAGE', 'IMMUTABLE', { src: imageUrl });
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
        const newEditorState = EditorState.set(editorState, { currentContent: contentStateWithEntity });
        setEditorState(AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, ' '));
    };

    const mediaBlockRenderer = (block) => {
        if (block.getType() === 'atomic') {
          const contentState = editorState.getCurrentContent();
          const entityKey = block.getEntityAt(0);
          if (!entityKey) {
            return null;
          }
          const entity = contentState.getEntity(entityKey);
          if (!entity) {
            return null;
          }
          const type = entity.getType();
          const src = entity.getData().src;

          if (type === 'IMAGE') {
            return {
              component: ImageRender,
              editable: false,
              props: {
                src,
              },
            };
          }
        }

        return null;
      };


      const handleSubmit = async () => {
        const contentState = editorState.getCurrentContent();
        const rawContent = convertToRaw(contentState);

        if (urlReferralCode) {
            // Update the existing note with the new content
            try {
                const notesRef = collection(db, "notes");
                const q = query(notesRef, where("referralCode", "==", urlReferralCode));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const docRef = querySnapshot.docs[0].ref;
                    await updateDoc(docRef, { note: rawContent });
                    console.log("Note updated with referral code: ", urlReferralCode);
                }
            } catch (e) {
                console.error("Error updating document: ", e);
            }
        } else {
            // Create a new note with a new referral code
            try {
                const newReferralCode = generateReferralCode();
                const docRef = await addDoc(collection(db, "notes"), {
                    note: rawContent,
                    referralCode: newReferralCode
                });
                setReferralCode(newReferralCode); // Only set a new referral code here
                console.log("Document written with ID: ", docRef.id);
            } catch (e) {
                console.error("Error adding document: ", e);
            }
        }
    };


    return (
        <>
            <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageUpload}
                ref={imageInputRef}
            />
            <button onClick={() => imageInputRef.current && imageInputRef.current.click()}>
                Upload Image
            </button>
            <Editor
                editorState={editorState}
                onChange={handleEditorChange}
                blockRendererFn={mediaBlockRenderer}
            />
            <button onClick={handleSubmit}>Save Note</button>
            {referralCode && <p>Your Referral Code: {referralCode}</p>}
        </>
    );
};

export default Notes;






