import React, { useState, useRef } from 'react';
import { Camera, RotateCcw, Download } from 'lucide-react';
import CameraModal from './CameraModal';
import { downloadImage, captureGridImage } from '../utils/imageUtils';
import './PhotoGrid.css';

export default function PhotoGrid() {
  const [photos, setPhotos] = useState(Array(15).fill(null));
  const [currentIndex, setCurrentIndex] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const gridRef = useRef(null);

  const allPhotosTaken = photos.every(photo => photo !== null);

  const openCamera = (index) => {
    if (photos[index]) return;
    setCurrentIndex(index);
    setIsCameraOpen(true);
  };

  const handlePhotoAccepted = (photoData) => {
    const newPhotos = [...photos];
    newPhotos[currentIndex] = photoData;
    setPhotos(newPhotos);
    setIsCameraOpen(false);

    downloadImage(photoData, `foto_${currentIndex + 1}.jpg`);
  };

  const handleCameraClose = () => {
    setIsCameraOpen(false);
    setCurrentIndex(null);
  };

  const handleDownloadGrid = async () => {
    const gridImage = await captureGridImage(photos, 5);
    if (gridImage) {
      downloadImage(gridImage, 'galeria_completa.jpg');
    }
  };

  const resetGrid = () => {
    if (window.confirm('Tens a certeza que queres apagar todas as fotos?')) {
      setPhotos(Array(15).fill(null));
    }
  };

  return (
    <div className="photo-grid-container">
      {/* Banner de Fotos no Topo */}
      <div className="top-banner">
        <img src="/images/banner.png" alt="Equipa" className="banner-photo" />
      </div>

      <div className="layout-wrapper" ref={gridRef}>
        {/* Lado Esquerdo - Branding */}
        <div className="branding-section">
          <img src="/images/sidebar.png" alt="Ccádentro - Iniciativas em Loja" className="sidebar-image" />
        </div>

        {/* Lado Direito - Grade de Fotos */}
        <div className="photos-section">
          <div className="photo-grid">
            {photos.map((photo, index) => (
              <div
                key={index}
                className={`photo-card ${!photo ? 'empty' : ''}`}
                onClick={() => openCamera(index)}
              >
                <div className="card-header">
                  <img
                    src="/images/banner3.png"
                    alt="Header"
                    className="header-photo"
                  />
                </div>
                
                <div className="card-content">
                  {photo ? (
                    <img 
                      src={photo} 
                      alt={`Foto ${index + 1}`}
                      className="photo-image"
                    />
                  ) : (
                    <div className="photo-placeholder">
                      <p className="placeholder-text">É a tua vez!</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Botões de Controlo */}
          {allPhotosTaken && (
            <div className="control-buttons">
              <button onClick={handleDownloadGrid} className="btn btn-download">
                <Download size={20} />
                Guardar Galeria
              </button>
              <button onClick={resetGrid} className="btn btn-reset">
                <RotateCcw size={20} />
                Reset
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal da Câmara */}
      {isCameraOpen && (
        <CameraModal
          onPhotoAccepted={handlePhotoAccepted}
          onClose={handleCameraClose}
        />
      )}
    </div>
  );
}
