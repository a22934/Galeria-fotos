import React, { useState, useRef, useEffect } from 'react';
import './CameraModal.css';

export default function CameraModal({ onPhotoAccepted, onClose }) {
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [stream, setStream] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    startCamera();
    
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = () => {
    navigator.mediaDevices.getUserMedia({ 
      video: { 
        facingMode: 'user',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      } 
    })
      .then(mediaStream => {
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      })
      .catch(err => {
        console.error("Erro ao aceder à câmara:", err);
        alert("Não foi possível aceder à câmara. Verifica as permissões.");
        onClose();
      });
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const capturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (canvas && video) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      const photoData = canvas.toDataURL('image/jpeg', 0.95);
      setCapturedPhoto(photoData);
    }
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
  };

  const acceptPhoto = () => {
    stopCamera();
    onPhotoAccepted(capturedPhoto);
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <div className="camera-modal-overlay" onClick={handleClose}>
      <div className="camera-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="camera-modal-title">
          {capturedPhoto ? 'Vê a tua foto!' : 'Sorri para a câmara!'}
        </h2>
        
        <div className="camera-preview">
          {!capturedPhoto ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="camera-video"
            />
          ) : (
            <img 
              src={capturedPhoto} 
              alt="Foto capturada"
              className="camera-image"
            />
          )}
        </div>

        <canvas ref={canvasRef} className="camera-canvas" />

        <div className="camera-buttons">
          {!capturedPhoto ? (
            <>
              <button
                onClick={capturePhoto}
                className="camera-btn camera-btn-capture"
              >
                📸 Tirar Foto
              </button>
              <button
                onClick={handleClose}
                className="camera-btn camera-btn-cancel"
              >
                Cancelar
              </button>
            </>
          ) : (
            <>
              <button
                onClick={acceptPhoto}
                className="camera-btn camera-btn-accept"
              >
                ✓ Aceitar
              </button>
              <button
                onClick={retakePhoto}
                className="camera-btn camera-btn-retake"
              >
                🔄 Tirar Novamente
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}