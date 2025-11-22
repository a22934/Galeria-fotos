import { supabase } from '../supabaseClient';

// ID Fixo para o documento (vamos usar uma única linha na tabela para a grelha)
const GALLERY_ID = 'main_gallery'; 
const TABLE_NAME = 'gallery_data';

// ============================================
// FUNÇÕES DE PERSISTÊNCIA (SUPABASE DATABASE)
// ============================================

/**
 * Carrega a estrutura da grelha (array de URLs) do Supabase Database.
 * @returns {Promise<Array|null>} - O array de URLs ou null em caso de falha.
 */
export const loadGalleryState = async () => {
    try {
        const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('photos')
            .eq('id', GALLERY_ID)
            .single();

        if (error && error.code !== 'PGRST116') { // Ignora 'No rows found'
            throw error;
        }

        if (data && data.photos) {
            return data.photos;
        }
        
        return null;

    } catch (error) {
        console.error('Erro ao carregar estado da galeria do Supabase Database:', error.message);
        return null;
    }
};

/**
 * Salva a estrutura atual da grelha (array de URLs) no Supabase Database.
 * @param {Array<string|null>} photos - O array atualizado de 15 URLs.
 * @returns {Promise<boolean>} - True se for bem-sucedido.
 */
export const saveGalleryState = async (photos) => {
    try {
        // O .upsert faz INSERT se não existir o ID, ou UPDATE se existir.
        const { error } = await supabase
            .from(TABLE_NAME)
            .upsert({ 
                id: GALLERY_ID, 
                photos: photos, 
                updated_at: new Date().toISOString() 
            }, { 
                onConflict: 'id' 
            });

        if (error) {
            throw error;
        }
        
        return true;

    } catch (error) {
        console.error('Erro ao salvar estado da galeria no Supabase Database:', error.message);
        return false;
    }
};

// ============================================
// FUNÇÕES DE STORAGE (INALTERADO)
// ============================================

/**
 * Converte um Data URL (Base64) para um objeto Blob.
 * @param {string} dataUrl - URL da imagem em base64
 * @returns {Blob} - O objeto Blob
 */
const dataURLtoBlob = (dataUrl) => {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

/**
 * Faz o upload de uma imagem Base64 para o Supabase Storage.
 * @param {string} photoData - URL da imagem em base64 (Data URL)
 * @param {string} fileName - Nome base do ficheiro (ex: foto_1.jpg)
 * @returns {Promise<string|null>} - URL pública da imagem ou null em caso de erro
 */
export const uploadPhoto = async (photoData, fileName) => {
  if (!photoData) return null;

  const imageBlob = dataURLtoBlob(photoData);
  // ⚠️ IMPORTANTE: Mude 'photos' para o nome do seu bucket no Supabase Storage
  const bucket = 'Galeria-continente'; 
  // Cria um caminho de ficheiro único
  const uniqueFileName = `${new Date().getTime()}_${fileName}`;
  const filePath = `gallery-uploads/${uniqueFileName}`; 

  try {
    // 1. Faz o upload do Blob
    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, imageBlob, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // 2. Obtém o URL público
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
      
    if (!publicUrlData.publicUrl) {
      console.error('Erro ao obter o URL público da foto.');
    }
      
    return publicUrlData.publicUrl;

  } catch (error) {
    console.error('Erro no upload para o Supabase Storage:', error.message);
    return null;
  }
};