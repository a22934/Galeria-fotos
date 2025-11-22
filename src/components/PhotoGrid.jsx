import React, { useState, useRef } from 'react';
import { RotateCcw, Download } from 'lucide-react';
import CameraModal from './CameraModal';
import { downloadImage, captureGridImage } from '../utils/imageUtils';
import './PhotoGrid.css';

export default function PhotoGrid() {
  const [photos, setPhotos] = useState(Array(15).fill(null));
  const [currentIndex, setCurrentIndex] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const gridRef = useRef(null);

  // Verifica se todas as células têm fotos
  const allPhotosTaken = photos.every(photo => photo !== null);

  // Abre a câmara para a célula selecionada
  const openCamera = (index) => {
    if (photos[index]) return;
    setCurrentIndex(index);
    setIsCameraOpen(true);
  };

  // Manipula a foto aceite pela câmara
  const handlePhotoAccepted = (photoData) => {
    const newPhotos = [...photos];
    newPhotos[currentIndex] = photoData;
    setPhotos(newPhotos);
    setIsCameraOpen(false);

    downloadImage(photoData, `foto_${currentIndex + 1}.jpg`);
  };

  // Fecha a câmara sem tirar foto
  const handleCameraClose = () => {
    setIsCameraOpen(false);
    setCurrentIndex(null);
  };

  // Captura e faz download da grelha completa
  const handleDownloadGrid = async () => {
    const gridImage = await captureGridImage(photos, 5);
    if (gridImage) {
      downloadImage(gridImage, 'galeria_completa.jpg');
    }
  };

  // Reseta a grelha de fotos
  const resetGrid = () => {
    if (window.confirm('Tens a certeza que queres apagar todas as fotos?')) {
      setPhotos(Array(15).fill(null));
    }
  };

  return (
    <div className="page-container">
      
      {/* Estrutura de tabela */}
      <div className="tabular-layout" ref={gridRef}>
        
        {/* Lado Esquerdo: Sidebar */}
        <div className="col-sidebar">
          <img src="/images/sidebar.png" alt="Ccádentro" className="sidebar-image" />
        </div>

        {/* Lado Direito: Banner + Tabela de Fotos */}
        <div className="col-content">
          
          {/* Banner do Topo */}
          <div className="content-header-row">
            <img src="/images/banner.png" alt="Equipa" className="banner-photo" />
          </div>

          {/* Grelha de tabela */}
          <div className="content-grid-row">
            <div className="photo-table">
              {photos.map((photo, index) => (
                <div
                  key={index}
                  className={`table-cell ${!photo ? 'empty' : 'filled'}`}
                  onClick={() => openCamera(index)}
                >
                  {/* Cabeçalho da Célula (Banner 3) */}
                  <div className="cell-header">
                    <img
                      src="/images/banner3.png"
                      alt="Header"
                      className="cell-header-img"
                    />
                  </div>
                  
                  {/* Conteúdo da Célula (Foto ou Placeholder com Animação) */}
                  <div className="cell-content">
                    {photo ? (
                      <img 
                        src={photo} 
                        alt={`Foto ${index + 1}`}
                        className="cell-photo"
                      />
                    ) : (
                      <div className="cell-placeholder">
                        <span className="placeholder-text">É a tua vez!</span>
                        <span className="plus-icon">+</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Botões de Controlo (Rodapé da tabela) */}
            {allPhotosTaken && (
              <div className="table-footer-controls">
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