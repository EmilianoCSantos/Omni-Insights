import React from 'react';
import FileUploadDropZone from '../components/FileUploadDropZone';
import '../styles/FileUploadPage.css';

function FileUploadPage() {
  return (
    <div className="upload-page">
      <div className="upload-header">
        <h1>Upload Tracking Data</h1>
        <p>Import HAL or TrueBeam CSV files for analysis</p>
      </div>

      <div className="upload-container">
        <FileUploadDropZone />
      </div>

      <div className="upload-info">
        <h3>Supported Formats</h3>
        <ul>
          <li><strong>HAL-filer:</strong> CSV med kolumner för TimeStamp, Lat(mm), Lng(mm), Vrt(mm), Neig.(degree), Dreh.(degree), Rot(degree)</li>
          <li><strong>Filstorlek:</strong> Upp till flera MB per fil</li>
          <li><strong>Anonymitet:</strong> Data processas utan personlig information</li>
        </ul>
      </div>
    </div>
  );
}

export default FileUploadPage;
