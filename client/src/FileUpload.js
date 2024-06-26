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
        if (!file) {
            alert('Please select a file first');
            return;
        }

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
            alert('There was an error uploading the file');
        }
    };

    return (
        <div>
            <div {...getRootProps()} style={{ border: '2px dashed #000', padding: '20px' }}>
                <input {...getInputProps()} />
                <p>Drag 'n' drop some files here, or click to select files</p>
            </div>
            {file && (
                <div style={{ marginTop: '10px' }}>
                    <strong>Selected file:</strong> {file.name}
                </div>
            )}
            <button onClick={handleUpload} style={{ marginTop: '10px' }}>
                Upload
            </button>
        </div>
    );
};

export default FileUpload;
