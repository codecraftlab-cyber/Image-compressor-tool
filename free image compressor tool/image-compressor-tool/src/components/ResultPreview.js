import React from 'react';
import { getFormatFromMimeType, SUPPORTED_FORMATS } from '../utils/compression';

const ResultPreview = ({ 
  originalImage, 
  compressedImage, 
  originalSize, 
  compressedSize, 
  fileName, 
  setFileName, 
  originalFormat,
  outputFormat,
  onDownload, 
  onReset 
}) => {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const calculateCompressionPercentage = () => {
    if (originalSize === 0) return 0;
    return ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
  };

  const getFileExtension = () => {
    if (!originalImage) return '';
    
    // If output format is 'same', use original format
    if (outputFormat === 'same') {
      return '.' + (originalFormat || 'jpg');
    }
    
    // Use selected output format
    return '.' + outputFormat;
  };

  const handleFileNameChange = (e) => {
    // Remove file extension if user tries to add it
    let name = e.target.value;
    name = name.replace(/\.(jpg|jpeg|png|webp)$/i, '');
    setFileName(name);
  };

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white flex items-center">
            <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
            Original Image
          </h3>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl"></div>
            <img
              src={originalImage}
              alt="Original"
              className="relative w-full h-48 object-contain bg-white/10 backdrop-blur-sm rounded-xl border border-white/20"
            />
            <div className="absolute bottom-3 left-3 glass-container px-3 py-1 rounded-full">
              <span className="text-white text-xs font-medium">{formatFileSize(originalSize)}</span>
            </div>
          </div>
        </div>

        {compressedImage && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              Compressed Image
            </h3>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-cyan-500/20 rounded-xl"></div>
              <img
                src={compressedImage}
                alt="Compressed"
                className="relative w-full h-48 object-contain bg-white/10 backdrop-blur-sm rounded-xl border border-white/20"
              />
              <div className="absolute bottom-3 left-3 glass-container px-3 py-1 rounded-full">
                <span className="text-white text-xs font-medium">{formatFileSize(compressedSize)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {compressedImage && (
        <>
          <div className="glass-container p-6 rounded-2xl border border-green-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-bold text-lg flex items-center">
                  <svg className="w-6 h-6 mr-2 text-green-400 success-check" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Compression Successful!
                </p>
                <p className="text-white/80 text-sm mt-1">
                  Reduced size by {calculateCompressionPercentage()}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-green-400">{calculateCompressionPercentage()}%</p>
                <p className="text-xs text-white/60">size reduction</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-white font-semibold mb-3">
                File Name (without extension)
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={fileName}
                  onChange={handleFileNameChange}
                  placeholder="Enter file name"
                  className="flex-1 glass-input"
                />
                <div className="glass-container px-4 py-2 rounded-xl border border-white/20">
                  <span className="text-cyan-400 font-medium">{getFileExtension()}</span>
                </div>
              </div>
              <p className="text-xs text-white/60 mt-2">
                File will be saved as: <span className="text-cyan-400">{fileName}{getFileExtension()}</span>
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={onDownload}
                className="btn-primary"
              >
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Compressed Image
                </span>
              </button>
              
              <button
                onClick={onReset}
                className="btn-secondary"
              >
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Upload New Image
                </span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ResultPreview;
