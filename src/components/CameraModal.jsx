import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, RotateCcw, Check, X } from 'lucide-react';
import './CameraModal.css';

export default function CameraModal({ onPhotoAccepted, onClose }) {
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [stream, setStream] = useState(null);
  const [isCameraAvailable, setIsCameraAvailable] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // ===============================================
  // Funções de Stream
  // ===============================================
  const startCamera = async () => {
    try {
      // Para qualquer stream antigo
      if (stream) stopCamera();

      setIsCameraAvailable(true);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      });

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error('Erro ao aceder à câmara:', err);
      setIsCameraAvailable(false);
      setStream(null);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
  };

  // ===============================================
  // useEffect para iniciar a câmera quando abrir o modal
  // ===============================================
  useEffect(() => {
    if (!capturedPhoto) {
      startCamera();
    }
    return () => stopCamera();
  }, [capturedPhoto]);

  // ===============================================
  // Upload de arquivo
  // ===============================================
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        stopCamera();
        setCapturedPhoto(e.target.result);
      };
      reader.readAsDataURL(file);
    }
    event.target.value = null; // limpa input
  };

  const triggerFileUpload = () => {
    stopCamera();
    fileInputRef.current.click();
  };

  // ===============================================
  // Captura / Retake / Aceitar
  // ===============================================
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    const photoData = canvas.toDataURL('image/jpeg', 0.95);
    stopCamera();
    setCapturedPhoto(photoData);
  };

  const retakePhoto = async () => {
    setCapturedPhoto(null);
    await startCamera(); // reinicia a câmera
  };

  const acceptPhoto = () => {
    stopCamera();
    onPhotoAccepted(capturedPhoto);
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  const isCameraOpenForCapture = stream && !capturedPhoto;

  // ===============================================
  // Render
  // ===============================================
  return (
    <div className="camera-modal-overlay" onClick={handleClose}>
      <div className="camera-modal" onClick={e => e.stopPropagation()}>
        <h2 className="camera-modal-title">
          {capturedPhoto ? 'Vê a tua foto!' : 'Seleciona ou Tira uma Foto'}
        </h2>

        <div className="camera-preview">
          {isCameraOpenForCapture ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="camera-video"
              muted
            />
          ) : capturedPhoto ? (
            <img src={capturedPhoto} alt="Foto capturada ou carregada" className="camera-image" />
          ) : (
            <div className="camera-placeholder">
              <p>
                {isCameraAvailable
                  ? 'A iniciar câmara...'
                  : 'Não foi possível iniciar a câmara. Verifica as permissões ou usa a opção de Carregar Foto.'}
              </p>
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="camera-canvas" />

        <div className="camera-buttons">
          {!capturedPhoto ? (
            <>
              {isCameraOpenForCapture && (
                <button onClick={capturePhoto} className="camera-btn camera-btn-capture">
                  <Camera size={20} /> Tirar Foto
                </button>
              )}

              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="file-input-hidden"
              />
              <button
                onClick={triggerFileUpload}
                className={`camera-btn camera-btn-upload ${!isCameraOpenForCapture && isCameraAvailable ? 'w-full' : ''}`}
              >
                <Upload size={20} /> Carregar da Galeria
              </button>

              <button onClick={handleClose} className="camera-btn camera-btn-cancel">
                <X size={20} /> Cancelar
              </button>
            </>
          ) : (
            <>
              <button onClick={acceptPhoto} className="camera-btn camera-btn-accept">
                <Check size={20} /> Aceitar e Enviar
              </button>
              <button onClick={retakePhoto} className="camera-btn camera-btn-retake">
                <RotateCcw size={20} /> Tirar/Carregar Novamente
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
