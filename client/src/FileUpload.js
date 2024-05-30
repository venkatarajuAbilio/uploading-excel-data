import React, { useState } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';

const FileUpload = () => {
    const [file, setFile] = useState(null);

    const onDrop = acceptedFiles => {
        setFile(acceptedFiles[0]);
    };

    const { getRootProps, getInputProps } = useDropzone({ onDrop });

    const handleUpload = async () => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://localhost:5001/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            alert('File uploaded successfully');
        } catch (error) {
            console.error('There was an error uploading the file!', error);
        }
    };

    return (
        <div>
            <div {...getRootProps()} style={{ border: '2px dashed #000', padding: '20px' }}>
                <input {...getInputProps()} />
                <p>Drag 'n' drop some files here, or click to select files</p>
            </div>
            <button onClick={handleUpload}>Upload</button>
        </div>
    );
};

export default FileUpload;
