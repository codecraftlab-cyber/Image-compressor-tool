import React, { useRef, useCallback } from 'react';
import { validateFile, SUPPORTED_FORMATS } from '../utils/compression';

const UploadComponent = ({ onFileSelect, isDragging, setIsDragging }) => {
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    try {
      validateFile(file);
      onFileSelect(file);
    } catch (error) {
      // Let the parent component handle the error
      console.error('File validation failed:', error.message);
      // Pass the error to parent component
      onFileSelect({ error: error.message, file });
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [onFileSelect, setIsDragging]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, [setIsDragging]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, [setIsDragging]);

  return (
    <div className="space-y-6">
      <div
        className={`upload-zone ${isDragging ? 'drag-over' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="space-y-6">
          <div className="upload-icon">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <p className="text-2xl font-bold text-white mb-2">Drop your image here</p>
            <p className="text-white/80">or click to browse</p>
          </div>
          <div className="flex items-center justify-center space-x-3">
            <span className="file-badge badge-jpg">JPG</span>
            <span className="file-badge badge-png">PNG</span>
            <span className="file-badge badge-webp">WEBP</span>
            <span className="text-white/60 text-sm">Max 10MB</span>
          </div>
        </div>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileInput}
        className="hidden"
      />
    </div>
  );
};

export default UploadComponent;
