import React from 'react';
import { SUPPORTED_FORMATS } from '../utils/compression';

const CompressionControls = ({ 
  compressionQuality, 
  setCompressionQuality, 
  targetSizeKB, 
  setTargetSizeKB, 
  outputFormat,
  setOutputFormat,
  originalFormat,
  onCompress, 
  isCompressing,
  hasOriginalImage,
  hasCompressedImage 
}) => {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-white font-semibold mb-3">
          Compression Quality: <span className="text-cyan-400">{Math.round(compressionQuality * 100)}%</span>
        </label>
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.1"
          value={compressionQuality}
          onChange={(e) => setCompressionQuality(parseFloat(e.target.value))}
          className="glass-slider w-full"
        />
        <div className="flex justify-between text-xs text-white/60 mt-2">
          <span>Lower size</span>
          <span>Higher quality</span>
        </div>
      </div>

      <div>
        <label className="block text-white font-semibold mb-3">
          Target Size (KB) <span className="text-white/60 text-sm">- Optional</span>
        </label>
        <input
          type="number"
          min="1"
          max="5000"
          value={targetSizeKB}
          onChange={(e) => setTargetSizeKB(e.target.value)}
          placeholder="e.g., 50, 100, 500"
          className="glass-input w-full"
        />
        <p className="text-xs text-white/60 mt-2">
          Leave empty to use quality setting only
        </p>
      </div>

      <div>
        <label className="block text-white font-semibold mb-3">
          Output Format
        </label>
        <select
          value={outputFormat}
          onChange={(e) => setOutputFormat(e.target.value)}
          className="glass-input w-full cursor-pointer"
        >
          <option value="same" className="bg-gray-800">Same as original ({originalFormat?.toUpperCase()})</option>
          <option value="jpeg" className="bg-gray-800">JPG</option>
          <option value="png" className="bg-gray-800">PNG</option>
          <option value="webp" className="bg-gray-800">WEBP</option>
        </select>
        <p className="text-xs text-white/60 mt-2">
          Convert image to selected format before download
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        {!hasCompressedImage && (
          <button
            onClick={onCompress}
            disabled={isCompressing || !hasOriginalImage}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isCompressing ? (
              <span className="flex items-center">
                <div className="spinner mr-3"></div>
                Compressing...
              </span>
            ) : 'Compress Image'}
          </button>
        )}
      </div>
    </div>
  );
};

export default CompressionControls;
