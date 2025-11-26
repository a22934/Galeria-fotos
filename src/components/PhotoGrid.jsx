import React, { useState, useRef, useEffect } from 'react';
import { RotateCcw, Download } from 'lucide-react';
import CameraModal from './CameraModal';
import { downloadImage, captureElementToDataUrl } from '../utils/imageUtils'; 
// A função subscribeToGalleryUpdates foi adicionada aqui
import { 
    uploadPhoto, 
    loadGalleryState, 
    saveGalleryState,
    subscribeToGalleryUpdates 
} from '../utils/supabaseStorage';
import './PhotoGrid.css';

// Tamanho fixo da grelha
const GRID_SIZE = 15;

// O componente UploadStatusMessage foi removido

export default function PhotoGrid() {
  const [photos, setPhotos] = useState(Array(GRID_SIZE).fill(null)); 
  const [currentIndex, setCurrentIndex] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  // O estado uploadStatus foi removido
  const [isLoading, setIsLoading] = useState(true); 
  
  const gridRef = useRef(null); 

  // =========================================================
  // LÓGICA DE PERSISTÊNCIA E REALTIME (Supabase Database)
  // =========================================================
  
  useEffect(() => {
    // 1. FUNÇÃO PARA CARREGAR O ESTADO INICIAL
    const loadState = async () => {
      setIsLoading(true);
      const savedPhotos = await loadGalleryState(); //
      
      if (savedPhotos && Array.isArray(savedPhotos) && savedPhotos.length === GRID_SIZE) {
        setPhotos(savedPhotos); //
      } else {
        // Se não houver dados ou estiverem incompletos, inicializa vazio //
        setPhotos(Array(GRID_SIZE).fill(null)); 
      }
      setIsLoading(false);
    };
    loadState(); //

    // 2. FUNÇÃO DE CALLBACK PARA O REALTIME
    const handleRealtimeUpdate = (newPhotosArray) => {
        console.log("Realtime Update Recebido! A atualizar grelha...");
        // Atualiza o estado local com o novo array de fotos vindo do Supabase
        setPhotos(newPhotosArray);
    };
    
    // 3. INICIAR A SUBSCRIÇÃO REALTIME
    // Passamos a função de callback para que ela seja chamada quando o Supabase notificar
    const subscription = subscribeToGalleryUpdates(handleRealtimeUpdate);
    
    // 4. LIMPEZA
    // Retorna uma função que remove a subscrição quando o componente é desmontado
    return () => {
        if (subscription && subscription.unsubscribe) {
            // O unsubscribe() é o método correto do Supabase para limpar o canal
            subscription.unsubscribe();
        }
    };
    
  }, []); // [] garante que a subscrição é feita apenas uma vez

  // 2. Salvar sempre que 'photos' muda (após upload ou reset) //
  useEffect(() => {
    // Evita salvar durante o carregamento inicial //
    if (isLoading) return; 

    // Garante que o array está no tamanho correto antes de salvar //
    if (photos.length === GRID_SIZE) {
      saveGalleryState(photos).then(success => { //
        if (!success) {
           console.error("Erro ao salvar estado no Supabase DB.");
        }
      });
    }
  }, [photos, isLoading]); //


  // =========================================================
  // FUNÇÕES DA GALERIA
  // =========================================================
  
  // A função hideStatusMessage foi removida //
  
  const allPhotosTaken = photos.every(photo => photo !== null); //

  const openCamera = (index) => {
    if (photos[index]) return; //
    setCurrentIndex(index); //
    setIsCameraOpen(true); //
  };

  const handlePhotoAccepted = async (photoData) => { 
    setIsCameraOpen(false); //
    // Mensagem de info removida
    
    const fileName = `foto_${currentIndex + 1}.jpg`; //
    const publicUrl = await uploadPhoto(photoData, fileName); //
    
    if (publicUrl) {
      const newPhotos = [...photos]; //
      newPhotos[currentIndex] = publicUrl; //
      
      // NOTA: A alteração no DB (saveGalleryState) é feita pelo segundo useEffect,
      // que será disparado por este setPhotos. O Realtime fará o resto.
      setPhotos(newPhotos); //
      
    } else {
      console.error('Falha no upload para o Supabase Storage. Verifique a consola.'); //
    } 
    
    setCurrentIndex(null); //
  };

  const handleCameraClose = () => {
    setIsCameraOpen(false); //
    setCurrentIndex(null); //
  };

  const handleDownloadGrid = async () => {
    // Mensagem de info removida
    const gridImage = await captureElementToDataUrl(gridRef.current); //
    
    if (gridImage) {
      downloadImage(gridImage, 'galeria_completa.jpg'); //
    } else {
      console.error('Erro a criar a imagem da galeria.'); //
    }
  };

  const resetGrid = async () => {
    if (!window.confirm('Tens a certeza que queres apagar todas as fotos? Uma cópia da grelha atual será guardada no Supabase Storage.')) {
        return;
    }

    // Mensagem de info removida
    const screenshotData = await captureElementToDataUrl(gridRef.current); //
    let publicUrl = null;

    if (screenshotData) {
        // Mensagem de info removida
        const fileName = `reset_backup_${new Date().toISOString()}.jpg`; //
        publicUrl = await uploadPhoto(screenshotData, fileName); //
    }

    if (publicUrl) {
        console.log('Backup da grelha enviado com sucesso para o Supabase Storage!'); //
    } else {
        console.error('Falha ao guardar o backup da grelha. A limpar o ecrã de qualquer forma.'); //
    }
    
    // Limpa o estado local e dispara o useEffect de save no DB (guardando um array de nulls) //
    setPhotos(Array(GRID_SIZE).fill(null)); //
  };
  
  if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-2xl font-semibold text-gray-700">A Carregar Galeria...</h1>
        </div>
    );
  }

  return (
    <div className="page-container">
      
      {/* Mensagem de Estado - O componente foi removido aqui */}

      {/* Estrutura de tabela - Referenciada por gridRef para captura */}
      <div className="tabular-layout" ref={gridRef}>
        
        {/* Lado Esquerdo: Sidebar */}
       <div className="col-sidebar">
  <img src="/images/sidebar.png" alt="Cádentro" className="sidebar-image" />
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
                      // A foto é carregada a partir do URL público do Supabase
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