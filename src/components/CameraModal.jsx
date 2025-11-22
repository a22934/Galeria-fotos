import React, { useState, useRef, useEffect } from 'react';
import './CameraModal.css';

export default function CameraModal({ onPhotoAccepted, onClose }) {
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [stream, setStream] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const media = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }
      });

      setStream(media);
      videoRef.current.srcObject = media;
    } catch (err) {
      alert("Não é possível aceder à câmara.");
      onClose();
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    const img = canvas.toDataURL('image/jpeg', 0.95);
    setCapturedPhoto(img);
  };

  const acceptPhoto = () => {
    stopCamera();
    onPhotoAccepted(capturedPhoto);
  };

  return (
    <div className="camera-modal-overlay" onClick={onClose}>
      <div className="camera-modal" onClick={(e) => e.stopPropagation()}>
        {!capturedPhoto ? (
          <>
            <video ref={videoRef} autoPlay playsInline className="camera-video" />
            <button onClick={capturePhoto} className="camera-btn">📸 Tirar</button>
          </>
        ) : (
          <>
            <img src={capturedPhoto} className="camera-image" alt="" />
            <button onClick={acceptPhoto} className="camera-btn">Aceitar</button>
            <button onClick={() => setCapturedPhoto(null)} className="camera-btn">Refazer</button>
          </>
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
}
