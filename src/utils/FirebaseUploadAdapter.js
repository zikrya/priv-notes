// Import the necessary Firebase functions
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

class FirebaseUploadAdapter {
    constructor(loader) {
        // Save the file loader instance to an instance property.
        this.loader = loader;
    }

    // Starts the upload process.
    async upload() {
        // Get a file instance from the loader.
        const file = await this.loader.file;

        // Get the Firebase Storage instance.
        const storage = getStorage();

        // Create a storage reference for the new file.
        const imageRef = storageRef(storage, 'images/' + Date.now() + '-' + file.name);

        try {
            // Use the reference to start the upload.
            const snapshot = await uploadBytes(imageRef, file);

            // After a successful upload, get the public download URL.
            const url = await getDownloadURL(snapshot.ref);

            // Return the URL to use as the image source.
            return {
                default: url
            };
        } catch (error) {
            console.error('Error uploading file:', error);
            // Reject the promise and throw an error.
            return Promise.reject(error);
        }
    }

    // Aborts the upload process.
    abort() {
        // Logic to abort the upload process.
        console.log('Upload aborted');
    }
}

export default FirebaseUploadAdapter;
