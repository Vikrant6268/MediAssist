import React, { useState, useRef } from 'react';
import styles from './UploadPrescription.module.css';

const UploadPrescription = ({ onUpload }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState(null);
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const processFile = (selectedFile) => {
        if (selectedFile && (selectedFile.type.startsWith('image/') || selectedFile.type === 'application/pdf')) {
            setFile(selectedFile);

            const reader = new FileReader();
            reader.onloadend = () => {
                // Return both the base64 data and the mimeType to the parent component
                onUpload({
                    file: selectedFile,
                    name: selectedFile.name,
                    type: selectedFile.type,
                    base64: reader.result.split(',')[1] // Strip the data URL prefix
                });
            };
            reader.readAsDataURL(selectedFile);

        } else {
            alert("Please upload an image or PDF format prescription.");
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            processFile(e.target.files[0]);
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.heading}>Upload Prescription</h2>
            <p className={styles.subheading}>Securely upload your doctor's prescription to get instant insights.</p>

            <div
                className={`${styles.dropzone} ${isDragging ? styles.dragging : ''} ${file ? styles.hasFile : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*,application/pdf"
                    style={{ display: 'none' }}
                />

                {!file ? (
                    <div className={styles.uploadContent}>
                        <div className={styles.iconContainer}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="17 8 12 3 7 8"></polyline>
                                <line x1="12" y1="3" x2="12" y2="15"></line>
                            </svg>
                        </div>
                        <h3>Drag & Drop</h3>
                        <p>or click to browse your files (PDF, JPEG, PNG)</p>
                    </div>
                ) : (
                    <div className={styles.fileSuccess}>
                        <div className={styles.successIcon}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                        </div>
                        <h3>{file.name}</h3>
                        <p>Processing prescription...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UploadPrescription;
