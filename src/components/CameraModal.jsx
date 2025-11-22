import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, RotateCcw, Check, X } from 'lucide-react';
import './CameraModal.css';

export default function CameraModal({ onPhotoAccepted, onClose }) {
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [stream, setStream] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Efeito para iniciar e limpar a câmara
  useEffect(() => {
    // Só inicia a câmara se não houver foto capturada e o modo câmara estiver ativo
    if (!capturedPhoto) {
        startCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [capturedPhoto]); // Recarrega se capturedPhoto for limpo

  const startCamera = () => {
    // Evita iniciar a câmara se já estiver a correr ou se o utilizador acabou de carregar uma foto
    if (isCameraActive || capturedPhoto) return; 

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
        setIsCameraActive(true);
      })
      .catch(err => {
        console.error("Erro ao aceder à câmara:", err);
        // Em vez de alert(), usamos console.error e não fechamos, permitindo o file upload
        // alert("Não foi possível aceder à câmara. Verifica as permissões."); 
        setIsCameraActive(false);
      });
  };
  
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCameraActive(false);
  };
  
  // ===============================================
  // Lógica de Carregamento de Ficheiros
  // ===============================================

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        stopCamera(); // Parar a câmara se estiver a funcionar
        setCapturedPhoto(e.target.result); // Define a foto carregada
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current.click();
  };

  // ===============================================
  // Lógica de Captura/Ação
  // ===============================================

  const capturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (canvas && video) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      // Desenhar o vídeo para o canvas para obter o frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const photoData = canvas.toDataURL('image/jpeg', 0.95);
      
      stopCamera(); // Parar a câmara após a captura
      setCapturedPhoto(photoData);
    }
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    // startCamera é chamado automaticamente via useEffect
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
          {capturedPhoto ? 'Vê a tua foto!' : 'Seleciona ou Tira uma Foto'}
        </h2>
        
        <div className="camera-preview">
          
          {/* Pré-visualização da câmara (apenas se a câmara estiver ativa e sem foto) */}
          {isCameraActive && !capturedPhoto ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="camera-video"
            />
          ) : capturedPhoto ? (
            /* Imagem capturada ou carregada */
            <img 
              src={capturedPhoto} 
              alt="Foto capturada ou carregada"
              className="camera-image"
            />
          ) : (
            /* Placeholder se a câmara não puder iniciar */
            <div className="camera-placeholder">
                <p>Não foi possível iniciar a câmara. Use a opção de Carregar Foto.</p>
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="camera-canvas" />

        <div className="camera-buttons">
          {!capturedPhoto ? (
            <>
              {/* Botão de Captura (Visível se a câmara estiver ativa) */}
              {isCameraActive && (
                <button
                  onClick={capturePhoto}
                  className="camera-btn camera-btn-capture"
                >
                  <Camera size={20} /> Tirar Foto
                </button>
              )}
              
              {/* Botão de Carregar Foto */}
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                className="file-input-hidden" 
              />
              <button
                onClick={triggerFileUpload}
                className={`camera-btn camera-btn-upload ${!isCameraActive ? 'w-full' : ''}`}
              >
                <Upload size={20} /> Carregar da Galeria
              </button>
              
              <button
                onClick={handleClose}
                className="camera-btn camera-btn-cancel"
              >
                <X size={20} /> Cancelar
              </button>
            </>
          ) : (
            <>
              {/* Botões Após Captura/Carregamento */}
              <button
                onClick={acceptPhoto}
                className="camera-btn camera-btn-accept"
              >
                <Check size={20} /> Aceitar e Enviar
              </button>
              <button
                onClick={retakePhoto}
                className="camera-btn camera-btn-retake"
              >
                <RotateCcw size={20} /> Tirar/Carregar Novamente
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}