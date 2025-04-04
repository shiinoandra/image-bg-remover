import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCloudUploadAlt, 
  faUpload, 
  faImage, 
  faMagic, 
  faSpinner, 
  faCheckCircle, 
  faDownload,
  faCut,
  faBorderStyle,
  faCloudDownloadAlt
} from '@fortawesome/free-solid-svg-icons';

const BGRemoverPro = () => {
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [borderColor, setBorderColor] = useState('#000000');
  const [borderThickness, setBorderThickness] = useState(5);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef(null);
  const processedImageRef = useRef(null);
  
  const handleDragEnter = (e) => {
    preventDefaults(e);
    setIsDragging(true);
  };
  
  const handleDragLeave = (e) => {
    preventDefaults(e);
    setIsDragging(false);
  };
  
  const handleDragOver = (e) => {
    preventDefaults(e);
  };
  
  const handleDrop = (e) => {
    preventDefaults(e);
    setIsDragging(false);
    const files = e.dataTransfer.files;
    handleFiles(files);
  };
  
  const preventDefaults = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleFileSelect = (e) => {
    handleFiles(e.target.files);
  };
  
  const handleFiles = (files) => {
    if (files.length === 0) return;
    
    const file = files[0];
    
    // Check if file is an image
    if (!file.type.match('image.*')) {
      alert('Please upload an image file (JPG, PNG, WEBP)');
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit');
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
      setOriginalImage(e.target.result);
      processImage(e.target.result);
    };
    
    reader.readAsDataURL(file);
  };
  
  const processImage = (imageData) => {
    setIsProcessing(true);
    
    // In a real app, this would send to your backend for processing
    // Here we just simulate with a timeout
    setTimeout(() => {
      // For demo purposes, we'll just use the same image
      // In reality, you would have your background removal logic here
      setProcessedImage(imageData);
      setIsProcessing(false);
    }, 2000);
  };
  
  const handleBorderColorChange = (e) => {
    setBorderColor(e.target.value);
  };
  
  const handleHexColorChange = (e) => {
    if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
      setBorderColor(e.target.value);
    }
  };
  
  const handleThicknessChange = (e) => {
    setBorderThickness(e.target.value);
  };
  
  const applyBorder = () => {
    if (!processedImage) return;
    
    setIsProcessing(true);
    
    // In a real app, this would send to your backend for processing
    // Here we just simulate with a timeout
    setTimeout(() => {
      if (processedImageRef.current) {
        processedImageRef.current.style.border = `${borderThickness}px solid ${borderColor}`;
      }
      setIsProcessing(false);
    }, 1000);
  };
  
  const downloadImage = () => {
    if (!processedImage) return;
    
    // Create a temporary link to download the image
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = 'processed-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="app-wrapper">
      <div className="container">
        {/* Main Content */}
        <div className="main-content">
          {/* Upload Section */}
          <div className="upload-section">
            <div 
              className={`dropzone ${isDragging ? 'active' : ''}`}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
            >
              <div className="dropzone-content">
                <FontAwesomeIcon icon={faCloudUploadAlt} className="upload-icon" />
                <p className="dropzone-text">Drag & drop your image here</p>
                <p className="dropzone-or">or</p>
                <label htmlFor="file-upload" className="select-button">
                  <FontAwesomeIcon icon={faUpload} className="button-icon" /> Select Image
                </label>
                <input 
                  id="file-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden-input"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                />
              </div>
            </div>
            <p className="file-info">Supports JPG, PNG, WEBP (Max 5MB)</p>
          </div>

          {/* Image Preview and Processing */}
          <div className="image-preview-container">
            {/* Original Image */}
            <div className="image-preview-box">
              <h3 className="preview-title">Original Image</h3>
              <div className="image-container">
                {originalImage ? (
                  <img 
                    src={originalImage} 
                    alt="Original image" 
                    className="preview-image"
                  />
                ) : (
                  <div className="placeholder">
                    <FontAwesomeIcon icon={faImage} className="placeholder-icon" />
                    <p>No image selected</p>
                  </div>
                )}
              </div>
            </div>

            {/* Processed Image */}
            <div className="image-preview-box">
              <h3 className="preview-title">Processed Image</h3>
              <div className="image-container">
                {processedImage ? (
                  <img 
                    src={processedImage} 
                    alt="Processed image" 
                    className="preview-image"
                    ref={processedImageRef}
                  />
                ) : (
                  <div className="placeholder">
                    <FontAwesomeIcon icon={faMagic} className="placeholder-icon" />
                    <p>Processed image will appear here</p>
                  </div>
                )}
                {isProcessing && (
                  <div className="processing-loader">
                    <div className="loader-content">
                      <FontAwesomeIcon icon={faSpinner} className="spinner" />
                      <p>Processing your image...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Border Customization */}
          {processedImage && (
            <div className="border-controls">
              <h2 className="section-title">Border Customization</h2>
              
              <div className="controls-grid">
                {/* Border Color */}
                <div className="control-group">
                  <label className="control-label">Border Color</label>
                  <div className="color-control">
                    <input 
                      type="color" 
                      value={borderColor}
                      onChange={handleBorderColorChange}
                      className="color-picker"
                    />
                    <input 
                      type="text" 
                      value={borderColor}
                      onChange={handleHexColorChange}
                      className="color-text"
                    />
                  </div>
                </div>
                
                {/* Border Thickness */}
                <div className="control-group">
                  <label className="control-label">Border Thickness: {borderThickness}px</label>
                  <input 
                    type="range" 
                    min="1" 
                    max="20" 
                    value={borderThickness}
                    onChange={handleThicknessChange}
                    className="range-slider"
                  />
                </div>
                
                {/* Apply Button */}
                <div className="apply-button-container">
                  <button onClick={applyBorder} className="apply-button">
                    <FontAwesomeIcon icon={faCheckCircle} className="button-icon" /> Apply Border
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Download Button */}
          <div className="download-container">
            {processedImage && (
              <button onClick={downloadImage} className="download-button">
                <FontAwesomeIcon icon={faDownload} className="button-icon" /> Download Processed Image
              </button>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="features-section">
          <h2 className="features-title">Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <FontAwesomeIcon icon={faCut} />
              </div>
              <h3 className="feature-title">Instant Background Removal</h3>
              <p className="feature-description">Automatically remove backgrounds from your images with AI-powered technology.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <FontAwesomeIcon icon={faBorderStyle} />
              </div>
              <h3 className="feature-title">Custom Borders</h3>
              <p className="feature-description">Add beautiful borders with customizable colors and thickness to make your images stand out.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <FontAwesomeIcon icon={faCloudDownloadAlt} />
              </div>
              <h3 className="feature-title">Easy Download</h3>
              <p className="feature-description">Download your processed images in high quality with transparent backgrounds.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BGRemoverPro;