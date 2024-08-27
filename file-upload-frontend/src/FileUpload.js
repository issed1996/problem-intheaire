// src/FileUpload.js

import React, { useState } from 'react';
import axios from 'axios';
import TiffViewer from './components/TiffViewer';

const CHUNK_SIZE = 1024 * 1024; // 1MB

function FileUpload() {
    const [file, setFile] = useState(null);
    const [files, setFiles] = useState([]);
    const [tiffFileUrl, setTiffFileUrl] = useState(null);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const uploadChunks = async () => {
        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

        for (let chunkNumber = 0; chunkNumber < totalChunks; chunkNumber++) {
            const start = chunkNumber * CHUNK_SIZE;
            const end = Math.min(file.size, start + CHUNK_SIZE);
            const chunk = file.slice(start, end);

            const formData = new FormData();
            formData.append('file_name', file.name);
            formData.append('chunk_number', chunkNumber + 1);
            formData.append('total_chunks', totalChunks);
            formData.append('file_size', file.size);
            formData.append('chunk', chunk);

            // Make the POST request to upload the chunk
            await axios.post('http://localhost:8000/api/upload/', formData);
        }

        fetchFiles(); // Fetch the list of uploaded files after upload
    };

    const fetchFiles = async () => {
        const response = await axios.get('http://localhost:8000/api/upload/');
        setFiles(response.data);
    };

    const deleteFile = async (id) => {
        await axios.delete(`http://localhost:8000/api/upload/${id}/`);
        fetchFiles();
    };

    const handleViewFile = (fileUrl) => {
        setTiffFileUrl(fileUrl);
    };

    return (
        <div>
            <h1>File Upload</h1>
            <input type="file" onChange={handleFileChange} />
            <button onClick={uploadChunks}>Upload</button>

            <h2>Uploaded Files</h2>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Size</th>
                        <th>Upload Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {files.map((file) => (
                        <tr key={file.id}>
                            <td>{file.file_name}</td>
                            <td>{file.file_size}</td>
                            <td>{new Date(file.upload_date).toLocaleString()}</td>
                            <td>
                                <button onClick={() => deleteFile(file.id)}>Delete</button>
                                <button onClick={() => handleViewFile(file.file_url)}>View</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {tiffFileUrl && <TiffViewer fileUrl={tiffFileUrl} />}
        </div>
    );
}

export default FileUpload;
