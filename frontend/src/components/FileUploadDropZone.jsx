import { useState } from 'react';

function FileUploadDropZone({ showFileList = true, hideTitle = false }) {
  // State för filuppladdning
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [fileStats, setFileStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Hantera när fil dras över zon
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  // Hantera när fil lämnar zon
  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  // Hantera när fil droppes
  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    // Hämta filer från drag-event
    const files = e.dataTransfer.files;
    
    // Skicka varje fil till backend
    for (let file of files) {
      await uploadFile(file);
    }
  };

  // Funktion för att skicka fil till backend
  const uploadFile = async (file) => {
    setIsLoading(true);
    setUploadStatus(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:5170/api/fileupload/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      // Debug: logga vad som returneras från backend
      console.log('Backend response:', data);
      console.log('File type from backend:', data.fileType);

      if (response.ok) {
        setUploadStatus('success');
        // Lägg till filnamn och filstorleken från den ursprungliga filen
        const fileData = {
          ...data,  // Allt från backend (fileName, fileSize, message, etc.)
          fileName: file.name,  // Det faktiska filnamnet från React
          fileSize: file.size   // Den faktiska filstorleken från React
        };
        setUploadedFiles(prev => [...prev, fileData]);

        // Hämta filstatistik från backend
        if (data.sessionId) {
          try {
            const statsResponse = await fetch(`http://localhost:5170/api/comparison/file-stats?sessionId=${data.sessionId}`);
            const statsData = await statsResponse.json();
            setFileStats(statsData);
            console.log('File stats:', statsData);
          } catch (err) {
            console.error('Error fetching file stats:', err);
          }
        }

        // Spara SessionId i localStorage för analytics
        if (data.sessionId) {
          const sessions = JSON.parse(localStorage.getItem('sessions') || '[]');
          sessions.unshift({
            id: data.sessionId,
            fileName: file.name,
            fileType: data.fileType,
            uploadDate: new Date().toISOString()
          });
          // Behåll bara de 10 senaste
          localStorage.setItem('sessions', JSON.stringify(sessions.slice(0, 10)));
          
          // Notifiera DataAnalysis om ny upload
          window.dispatchEvent(new Event('fileUploaded'));
        }
      } else {
        setUploadStatus('error');
      }
    } catch (error) {
      setUploadStatus('error');
      console.error('Upload error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      {!hideTitle && <h2>File Upload</h2>}

      {/* Drop-zon */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          border: isDragOver ? '3px solid blue' : '2px dashed gray',
          padding: '40px',
          textAlign: 'center',
          backgroundColor: isDragOver ? '#f0f0f0' : 'white',
          cursor: 'pointer'
        }}
      >
        <p>Drag and drop files here (CSV, OBJ, PCD, DICOM)</p>
      </div>

      {/* Status-meddelanden */}
      {isLoading && <p>Uploading...</p>}
      {uploadStatus === 'success' && <p style={{ color: 'green' }}>Upload successful!</p>}
      {uploadStatus === 'error' && <p style={{ color: 'red' }}>Upload failed!</p>}

      {/* Lista på uppladdade filer */}
      {showFileList && uploadedFiles.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>Uploaded Files:</h3>
          <ul>
            {uploadedFiles.map((file, index) => (
              <li key={index}>
                {file.fileName} ({file.fileSize} bytes)
                {file.fileType === 'Halcyon-fil' && (
                  <div style={{ color: '#007bff', fontWeight: 'bold', fontSize: '14px' }}>
                    System: Halcyon
                  </div>
                )}
                {file.fileType === 'Truebeam-fil' && (
                  <div style={{ color: '#007bff', fontWeight: 'bold', fontSize: '14px' }}>
                    System: TrueBeam
                  </div>
                )}
                {file.fileType === 'AlignRT-fil' && (
                  <div style={{ color: '#007bff', fontWeight: 'bold', fontSize: '14px' }}>
                    System: AlignRT
                  </div>
                )}
                {file.fileType === 'LUNA-fil' && (
                  <div style={{ color: '#007bff', fontWeight: 'bold', fontSize: '14px' }}>
                    System: LUNA
                  </div>
                )}
                {file.message && <div style={{ color: 'red', fontWeight: 'bold' }}> → {file.message}</div>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Filstatistik */}
      {fileStats && (
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', borderRadius: '5px' }}>
          <h3>📊 File Statistics</h3>
          <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#e8f4f8', borderRadius: '4px' }}>
            <strong>File:</strong> {fileStats.fileName}
            {fileStats.fileType && (
              <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                Type: {fileStats.fileType}
              </div>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
            <div>
              <strong>Rows:</strong> {fileStats.rowCount}
            </div>
            <div>
              <strong>Avg X:</strong> {fileStats.avgX?.toFixed(2)} mm
            </div>
            <div>
              <strong>Avg Y:</strong> {fileStats.avgY?.toFixed(2)} mm
            </div>
            <div>
              <strong>Avg Z:</strong> {fileStats.avgZ?.toFixed(2)} mm
            </div>
            <div>
              <strong>Avg Magnitude:</strong> {fileStats.avgMagnitude?.toFixed(2)} mm
            </div>
            <div style={{ backgroundColor: '#fffacd', padding: '10px', borderRadius: '4px' }}>
              <strong>⏱️ Total duration:</strong> 
              {fileStats.totalDuration !== undefined && (
                <>
                  {Math.floor(fileStats.totalDuration / 60)}m {Math.round((fileStats.totalDuration % 60) * 100) / 100}s
                </>
              )}
            </div>
            <div style={{ backgroundColor: '#fffacd', padding: '10px', borderRadius: '4px' }}>
              <strong>✅ Time within threshold:</strong> 
              {fileStats.timeWithinThreshold !== undefined && (
                <>
                  {Math.floor(fileStats.timeWithinThreshold / 60)}m {Math.round((fileStats.timeWithinThreshold % 60) * 100) / 100}s
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FileUploadDropZone;
