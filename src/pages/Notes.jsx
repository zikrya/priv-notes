import React, { useState, useEffect, useRef } from 'react';
import { Editor, EditorState, convertFromRaw, convertToRaw, AtomicBlockUtils, Entity, ContentState, RichUtils, Modifier } from 'draft-js';
import 'draft-js/dist/Draft.css';
import { db, storage } from '../utils/firebase-config'; // Import your firebase config
import { collection, addDoc, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { getStorage, ref as firebaseRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { generateReferralCode } from '../utils/useReferralCodes';
import { useParams } from 'react-router-dom';
import ImageRender from '../components/ImageRender';
import AudioRender from '../components/AudioRender';
import VideoRender from '../components/VideoRender';
import '../App.css';


const Notes = () => {
    //const imagePlugin = createImagePlugin();
    const [editorState, setEditorState] = useState(EditorState.createEmpty());
    const [referralCode, setReferralCode] = useState('');
    const imageInputRef = useRef(null);
    const audioInputRef = useRef(null);
    const videoInputRef = useRef(null);
    const { referralCode: urlReferralCode } = useParams();
    const editor = useRef(null);

    const focusEditor = () => {
        if (editor.current) {
            editor.current.focus();
            const currentContent = editorState.getCurrentContent();
            const lastBlock = currentContent.getBlockMap().last();

            const key = lastBlock.getKey();
            const length = lastBlock.getLength();

            const selection = SelectionState.createEmpty(key).merge({
                anchorOffset: length,
                focusOffset: length,
            });

            const newEditorState = EditorState.forceSelection(editorState, selection);
            setEditorState(newEditorState);
        }
    };

    const handleFocus = () => {
        focusEditor();
        const editorDOM = editor.current?.editor;
        if (editorDOM) {
            editorDOM.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    useEffect(() => {
        const editorDOM = editor.current?.editor;
        editorDOM.addEventListener('focus', handleFocus);

        // Clean up
        return () => {
            editorDOM.removeEventListener('focus', handleFocus);
        };
    }, []);

    const fontStyles = [
        { label: 'Arial', style: 'Arial' },
        { label: 'Georgia', style: 'Georgia' },
      ];

    const handleKeyCommand = (command) => {
        const newState = RichUtils.handleKeyCommand(editorState, command);
        if (newState) {
          setEditorState(newState);
          return 'handled';
        }
        return 'not-handled';
      };
      const onBoldClick = () => {
        setEditorState(RichUtils.toggleInlineStyle(editorState, 'BOLD'));
      };

      const toggleInlineStyle = (inlineStyle) => {
        setEditorState(RichUtils.toggleInlineStyle(editorState, inlineStyle));
      };

      const toggleBlockType = (blockType) => {
        setEditorState(RichUtils.toggleBlockType(editorState, blockType));
      };

      const applyFontStyle = (editorState, fontStyle) => {
        const selection = editorState.getSelection();
        const nextContentState = Object.keys(fontStyles)
          .reduce((contentState, font) => {
            return Modifier.removeInlineStyle(contentState, selection, font)
          }, editorState.getCurrentContent());

        let nextEditorState = EditorState.push(editorState, nextContentState, 'change-inline-style');

        const currentStyle = editorState.getCurrentInlineStyle();
        if (selection.isCollapsed()) {
          nextEditorState = currentStyle.reduce((state, font) => {
            return RichUtils.toggleInlineStyle(state, font);
          }, nextEditorState);
        }

        if (!currentStyle.has(fontStyle)) {
          nextEditorState = RichUtils.toggleInlineStyle(nextEditorState, fontStyle);
        }

        return nextEditorState;
      };

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

    const handleAudioUpload = async (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('audio/')) {
          const storage = getStorage();
          const storagePath = `audios/${Date.now()}-${file.name}`;
          const audioRef = firebaseRef(storage, storagePath);

          try {
            const uploadResult = await uploadBytes(audioRef, file);
            const audioURL = await getDownloadURL(uploadResult.ref);
            insertAudioInEditor(audioURL);
          } catch (error) {
            console.error('Error uploading audio: ', error);
          }
        }
      };

      const insertAudioInEditor = (audioUrl) => {
        const contentState = editorState.getCurrentContent();
        const contentStateWithEntity = contentState.createEntity(
          'AUDIO',
          'IMMUTABLE',
          { src: audioUrl }
        );
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
        const newEditorState = EditorState.set(
          editorState,
          { currentContent: contentStateWithEntity }
        );
        setEditorState(
          AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, ' ')
        );
      };
      const handleVideoUpload = async (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('video/')) {
          const storage = getStorage();
          const storagePath = `videos/${Date.now()}-${file.name}`;
          const videoRef = firebaseRef(storage, storagePath);

          try {
            const uploadResult = await uploadBytes(videoRef, file);
            const videoURL = await getDownloadURL(uploadResult.ref);
            insertVideoInEditor(videoURL);
          } catch (error) {
            console.error('Error uploading video: ', error);
          }
        }
      };
      const insertVideoInEditor = (videoUrl) => {
        const contentState = editorState.getCurrentContent();
        const contentStateWithEntity = contentState.createEntity(
          'VIDEO',
          'IMMUTABLE',
          { src: videoUrl }
        );
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
        const newEditorState = EditorState.set(
          editorState,
          { currentContent: contentStateWithEntity }
        );
        setEditorState(
          AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, ' ')
        );
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
          const { src } = entity.getData();

          if (type === 'IMAGE') {
            return {
              component: ImageRender,
              editable: false,
              props: {
                src,
              },
            };
          } else if (type === 'AUDIO') {
            return {
              component: AudioRender,
              editable: false,
              props: {
                src,
              },
            };
          } else if (type === 'VIDEO') {
            return {
                component: VideoRender,
                editable: false,
                props: {
                    block,
                    contentState,
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
        <div className="flex justify-center items-center flex-wrap p-4 bg-gray-100">
        <div className="flex flex-grow justify-start items-center">
           <select
            onChange={(e) => {
            const newEditorState = applyFontStyle(editorState, e.target.value);
            setEditorState(newEditorState);
             }}
             className="p-2 rounded bg-white mx-2 text-gray-700 mb-2"
            >
           {fontStyles.map((font) => (
           <option key={font.style} value={font.style}>
            {font.label}
            </option>
             ))}
          </select>

      &nbsp; &nbsp;
        <button className="p-2 rounded bg-white mx-2 mb-2" onClick={onBoldClick}><span><img width="20" height="20" src="https://img.icons8.com/ios-glyphs/30/bold.png" alt="bold"/></span></button>
        &nbsp; &nbsp;
        <button className="p-2 rounded bg-white mx-2 mb-2" onClick={() => toggleBlockType('unordered-list-item')}><span><img width="20" height="20" src="https://img.icons8.com/ios-glyphs/30/overview-pages-3--v2.png" alt="overview-pages-3--v2"/></span></button>
        &nbsp; &nbsp;
            <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageUpload}
                ref={imageInputRef}
            />
            <button className="p-2 rounded bg-white mx-2 mb-2" onClick={() => imageInputRef.current && imageInputRef.current.click()}>
                <span><img width="24" height="24" src="https://img.icons8.com/material-outlined/24/add-image.png" alt="add-image"/></span>
            </button>
            &nbsp; &nbsp;
            <input
              type="file"
              accept="audio/*"
              style={{ display: 'none' }}
              ref={audioInputRef}
              onChange={handleAudioUpload}
            />

            <button className="p-2 rounded bg-white mx-2 mb-2" onClick={() => audioInputRef.current && audioInputRef.current.click()}>
                <span><img width="22" height="22" src="https://img.icons8.com/ios-filled/50/high-volume--v1.png" alt="high-volume--v1"/></span>
            </button>

            &nbsp; &nbsp;
            <input
              type="file"
              accept="video/*"
              style={{ display: 'none' }}
              ref={videoInputRef}
              onChange={handleVideoUpload}
            />

            <button className="p-2 rounded bg-white mx-2 mb-2" onClick={() => videoInputRef.current && videoInputRef.current.click()}>
                <span><img width="22" height="22" src="https://img.icons8.com/ios-filled/50/video.png" alt="video"/></span>
            </button>
            </div>
            <div className="flex justify-end flex-grow-0">
               <button className="p-2 rounded bg-blue-500 text-white mx-2 hover:bg-blue-600" onClick={handleSubmit}>Save Note</button>
               {referralCode && <p className="text-sm mx-2">{referralCode}</p>}
            </div>
            </div>
            <div className="note-container bg-white shadow-md mx-auto my-4 p-6 max-w-screen-md rounded-lg">
               <div className="note-title text-2xl font-semibold text-gray-900 mb-4">
             </div>
             <div onClick={focusEditor} className="DraftEditor-root min-h-[500px] text-base text-gray-800 leading-relaxed">
           <Editor
           ref={editor}
            editorState={editorState}
            onChange={handleEditorChange}
            blockRendererFn={mediaBlockRenderer}
            />
            </div>
          </div>
        </>
    );
};

export default Notes;






