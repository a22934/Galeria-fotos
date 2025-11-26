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

  const stopCamera = () => {
    if (stream) {
      // Parar todas as tracks ativas no stream
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
  };

  const startCamera = async () => {
    // 1. Parar qualquer stream antigo antes de começar um novo
    if (stream) stopCamera();
    
    // 2. Tentar obter o stream da câmara
    try {
      setIsCameraAvailable(true);
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        // Tentar usar a câmara frontal ('user')
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      });

      setStream(mediaStream);

      // 3. Atribuir srcObject e tentar reproduzir
      if (videoRef.current) {
        // Atribuir o stream ao elemento <video>
        videoRef.current.srcObject = mediaStream;
        
        // Tentar reproduzir e lidar com a Promise para catch de falhas de autoplay
        const playPromise = videoRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error('Falha na reprodução automática da câmara:', error);
          });
        }
      }
    } catch (err) {
      console.error('Erro ao aceder à câmara:', err);
      // Se a câmara falhar, atualiza os estados para mostrar a mensagem de erro
      setIsCameraAvailable(false); 
      setStream(null);
    }
  };

  // ===============================================
  // useEffect para iniciar e limpar
  // ===============================================
  useEffect(() => {
    if (!capturedPhoto) {
      startCamera();
    }
    // Cleanup function: parar a câmara ao fechar o modal ou desmontar
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

  const retakePhoto = () => {
    setCapturedPhoto(null);
    // O useEffect irá chamar startCamera()
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
          {/* Visualização da Câmera (Stream) */}
          {isCameraOpenForCapture ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="camera-video"
              muted 
            />
          ) : capturedPhoto ? (
            /* Visualização da Foto Capturada/Carregada */
            <img src={capturedPhoto} alt="Foto capturada ou carregada" className="camera-image" />
          ) : (
            /* Placeholder/Mensagem de Erro */
            <div className="camera-placeholder">
              <p>
                {isCameraAvailable
                  ? 'A iniciar câmara...'
                  : 'Não foi possível iniciar a câmara. Verifica as permissões ou usa a opção de Carregar Foto.'}
              </p>
            </div>
          )}
        </div>

        {/* Canvas oculto para captura */}
        <canvas ref={canvasRef} className="camera-canvas" /> 

        <div className="camera-buttons">
          {!capturedPhoto ? (
            /* Botões: Tira Foto, Upload, Cancelar */
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
            /* Botões: Aceitar, Retake */
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