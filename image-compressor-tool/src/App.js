import React, { useState, useCallback, useRef } from 'react';
import UploadComponent from './components/UploadComponent';
import CompressionControls from './components/CompressionControls';
import ResultPreview from './components/ResultPreview';
import { compressImageToTargetSize, dataUrlToFile, convertImageFormat, getFormatFromMimeType } from './utils/compression';
import './App.css';

function App() {
  const [originalImage, setOriginalImage] = useState(null);
  const [compressedImage, setCompressedImage] = useState(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState('');
  const [compressionQuality, setCompressionQuality] = useState(0.8);
  const [targetSizeKB, setTargetSizeKB] = useState('');
  const [fileName, setFileName] = useState('');
  const [originalFileName, setOriginalFileName] = useState('');
  const [originalFormat, setOriginalFormat] = useState('');
  const [outputFormat, setOutputFormat] = useState('same');
  const [compressionInfo, setCompressionInfo] = useState(null);
  const fileInputRef = useRef(null);

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

  const validateFile = (file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a JPG, PNG, WEBP, or GIF image file.');
      return false;
    }
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError('File size must be less than 10MB.');
      return false;
    }
    
    return true;
  };

  const handleFile = (file) => {
    setError('');
    if (!validateFile(file)) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalImage(e.target.result);
      setOriginalSize(file.size);
      setCompressedImage(null);
      setCompressedSize(0);
    };
    reader.readAsDataURL(file);
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
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = (file) => {
    setError('');
    setCompressedImage(null);
    setCompressedSize(0);
    setCompressionInfo(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalImage(e.target.result);
      setOriginalSize(file.size);
      
      // Extract file format
      const format = getFormatFromMimeType(file.type);
      setOriginalFormat(format);
      
      // Extract file name without extension
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      setOriginalFileName(nameWithoutExt);
      setFileName(nameWithoutExt);
    };
    reader.readAsDataURL(file);
  };

  const compressImage = async () => {
    if (!originalImage) return;

    setIsCompressing(true);
    setError('');
    setCompressionInfo(null);

    try {
      // Convert data URL to File
      const response = await fetch(originalImage);
      const blob = await response.blob();
      const file = new File([blob], originalFileName + '.jpg', { type: blob.type });

      const targetSize = targetSizeKB ? parseInt(targetSizeKB) : null;
      const result = await compressImageToTargetSize(file, targetSize, compressionQuality);

      setCompressedImage(result.dataUrl);
      setCompressedSize(result.file.size);
      setCompressionInfo(result);

      // Show warning if target size wasn't achieved
      (!result.achievedTarget && targetSize) && setError(
        `Could not achieve exact target size of ${targetSizeKB}KB. Closest result: ${Math.round(result.file.size / 1024)}KB`
      );

    } catch (err) {
      if (err.message.includes('Unable to compress')) {
        setError('Target size is too small. Try a larger target size or reduce quality.');
      } else {
        setError('Failed to compress image. Please try again.');
      }
      console.error('Compression error:', err);
    } finally {
      setIsCompressing(false);
    }
  };

  const downloadImage = async () => {
    if (!compressedImage) return;

    let objectUrl = null;
    try {
      let finalImageDataUrl = compressedImage;
      let finalFormat = outputFormat === 'same' ? originalFormat : outputFormat;
      
      // Convert format if needed
      if (outputFormat !== 'same' && outputFormat !== originalFormat) {
        try {
          finalImageDataUrl = await convertImageFormat(compressedImage, outputFormat);
        } catch (conversionError) {
          console.warn('Format conversion failed, using original format:', conversionError);
          setError(`Format conversion failed. Downloading as ${originalFormat.toUpperCase()}.`);
          finalFormat = originalFormat;
        }
      }
      
      const file = await dataUrlToFile(finalImageDataUrl, fileName, finalFormat);
      objectUrl = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      setError('Failed to download image. Please try again.');
      console.error('Download error:', error);
    } finally {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    }
  };

  const reset = () => {
    setOriginalImage(null);
    setCompressedImage(null);
    setOriginalSize(0);
    setCompressedSize(0);
    setError('');
    setFileName('');
    setOriginalFileName('');
    setOriginalFormat('');
    setOutputFormat('same');
    setTargetSizeKB('');
    setCompressionInfo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-saas relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="floating-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
        <header className="text-center mb-12">
          <h1 className="hero-title mb-4 text-glow">Image Compressor Tool</h1>
          <p className="hero-subtitle max-w-3xl mx-auto">
            Compress your images online for free. Fast, secure, and works entirely in your browser.
          </p>
        </header>

        <main className="glass-card">
          {!originalImage ? (
            <UploadComponent
              onFileSelect={handleFileSelect}
              isDragging={isDragging}
              setIsDragging={setIsDragging}
            />
          ) : (
            <div className="space-y-8">
              <ResultPreview
                originalImage={originalImage}
                compressedImage={compressedImage}
                originalSize={originalSize}
                compressedSize={compressedSize}
                fileName={fileName}
                setFileName={setFileName}
                originalFormat={originalFormat}
                outputFormat={outputFormat}
                onDownload={downloadImage}
                onReset={reset}
              />

              {!compressedImage && (
                <CompressionControls
                  compressionQuality={compressionQuality}
                  setCompressionQuality={setCompressionQuality}
                  targetSizeKB={targetSizeKB}
                  setTargetSizeKB={setTargetSizeKB}
                  outputFormat={outputFormat}
                  setOutputFormat={setOutputFormat}
                  originalFormat={originalFormat}
                  onCompress={compressImage}
                  isCompressing={isCompressing}
                  hasOriginalImage={!!originalImage}
                  hasCompressedImage={!!compressedImage}
                />
              )}
            </div>
          )}

          {error && (
            <div className="mt-6 glass-container p-4 rounded-xl border border-red-500/30">
              <p className="text-red-300 text-sm flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            </div>
          )}
        </main>

        <footer className="text-center mt-12">
          <div className="glass-container inline-block px-8 py-4 rounded-full">
            <p className="text-white/90 text-sm flex items-center">
              <svg className="w-5 h-5 mr-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Your images are processed locally in your browser. No data is sent to any server.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
