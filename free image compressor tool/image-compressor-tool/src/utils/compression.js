import imageCompression from 'browser-image-compression';

// Supported formats
export const SUPPORTED_FORMATS = {
  INPUT: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  OUTPUT: ['jpeg', 'png', 'webp'],
  MIME_TYPES: {
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif'
  }
};

export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2).toLowerCase();
};

export const getFormatFromMimeType = (mimeType) => {
  const formatMap = {
    'image/jpeg': 'jpeg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif'
  };
  return formatMap[mimeType] || 'jpeg';
};

export const compressImageToTargetSize = async (file, targetSizeKB, quality = 0.8) => {
  const targetSizeBytes = targetSizeKB * 1024;
  let currentQuality = quality;
  let bestResult = null;
  let iterations = 0;
  const maxIterations = 10;
  const tolerance = targetSizeBytes * 0.1; // 10% tolerance

  // If no target size specified, use regular compression
  if (!targetSizeKB || targetSizeKB <= 0) {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      quality: quality,
      fileType: file.type,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      return {
        file: compressedFile,
        dataUrl: await fileToDataUrl(compressedFile),
        achievedTarget: true,
        iterations: 1,
      };
    } catch (error) {
      throw new Error('Failed to compress image');
    }
  }

  // Iterative compression to reach target size
  while (iterations < maxIterations) {
    iterations++;
    
    const options = {
      maxSizeMB: targetSizeKB / 1024, // Convert KB to MB
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      quality: currentQuality,
      fileType: file.type,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      const fileSize = compressedFile.size;

      // Check if we're close enough to target size
      if (Math.abs(fileSize - targetSizeBytes) <= tolerance) {
        return {
          file: compressedFile,
          dataUrl: await fileToDataUrl(compressedFile),
          achievedTarget: true,
          iterations: iterations,
        };
      }

      // If this is the best result so far, save it
      if (!bestResult || Math.abs(fileSize - targetSizeBytes) < Math.abs(bestResult.file.size - targetSizeBytes)) {
        bestResult = {
          file: compressedFile,
          dataUrl: await fileToDataUrl(compressedFile),
          achievedTarget: false,
          iterations: iterations,
        };
      }

      // Adjust quality for next iteration
      if (fileSize > targetSizeBytes) {
        // File is too big, reduce quality more aggressively
        currentQuality = Math.max(0.1, currentQuality - 0.15);
      } else {
        // File is too small, increase quality
        currentQuality = Math.min(1.0, currentQuality + 0.1);
      }

    } catch (error) {
      // If compression fails, try with lower quality
      currentQuality = Math.max(0.1, currentQuality - 0.2);
      continue;
    }
  }

  // Return best result if exact target couldn't be achieved
  if (bestResult) {
    return {
      ...bestResult,
      achievedTarget: false,
      targetSizeKB: targetSizeKB,
      actualSizeKB: Math.round(bestResult.file.size / 1024),
    };
  }

  throw new Error('Unable to compress image to desired size');
};

export const convertImageFormat = async (dataUrl, outputFormat) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw image to canvas
      ctx.drawImage(img, 0, 0);
      
      // Convert to desired format
      let mimeType = SUPPORTED_FORMATS.MIME_TYPES[outputFormat];
      let quality = 1.0;
      
      // Adjust quality for lossy formats
      if (outputFormat === 'jpeg' || outputFormat === 'webp') {
        quality = 0.9;
      }
      
      try {
        const convertedDataUrl = canvas.toDataURL(mimeType, quality);
        resolve(convertedDataUrl);
      } catch (error) {
        reject(new Error(`Failed to convert to ${outputFormat}: ${error.message}`));
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image for conversion'));
    img.src = dataUrl;
  });
};

export const fileToDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const dataUrlToFile = async (dataUrl, fileName, format = 'jpeg') => {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const mimeType = SUPPORTED_FORMATS.MIME_TYPES[format];
  return new File([blob], fileName, { type: mimeType });
};

export const validateFile = (file) => {
  if (!SUPPORTED_FORMATS.INPUT.includes(file.type)) {
    throw new Error(`Unsupported file format. Supported formats: JPG, PNG, WEBP, GIF`);
  }
  
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error('File size must be less than 10MB.');
  }
  
  return true;
};
