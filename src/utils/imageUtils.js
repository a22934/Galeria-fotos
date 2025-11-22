/**
 * Faz download de uma imagem
 * @param {string} dataUrl - URL da imagem em base64
 * @param {string} filename - Nome do ficheiro
 */
export const downloadImage = (dataUrl, filename) => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Cria uma imagem da galeria completa com todas as fotos
 * @param {Array} photos - Array com as fotos em base64
 * @param {number} cols - Número de colunas (padrão: 3)
 * @returns {Promise<string>} - URL da imagem da galeria
 */
export const captureGridImage = async (photos, cols = 3) => {
  const canvas = document.createElement('canvas');
  const photoSize = 300;
  const gap = 15;
  const padding = 25;
  const headerHeight = 40;
  
  const rows = Math.ceil(photos.length / cols);
  const cardWidth = photoSize;
  const cardHeight = photoSize + headerHeight;
  
  const totalWidth = cols * cardWidth + (cols - 1) * gap + padding * 2;
  const totalHeight = rows * cardHeight + (rows - 1) * gap + padding * 2;
  
  canvas.width = totalWidth;
  canvas.height = totalHeight;
  
  const ctx = canvas.getContext('2d');
  
  // Fundo branco
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Carregar e desenhar cada foto
  const loadImage = (src) => {
    return new Promise((resolve, reject) => {
      if (!src) {
        resolve(null);
        return;
      }
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  const images = await Promise.all(photos.map(photo => loadImage(photo)));

  // Desenhar cada foto na grade
  for (let i = 0; i < photos.length; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const x = padding + col * (cardWidth + gap);
    const y = padding + row * (cardHeight + gap);
    
    // Desenhar header laranja/amarelo alternado
    const isOdd = i % 2 === 0;
    const gradient = ctx.createLinearGradient(x, y, x + cardWidth, y);
    if (isOdd) {
      gradient.addColorStop(0, '#ff8c42');
      gradient.addColorStop(1, '#ff6b35');
    } else {
      gradient.addColorStop(0, '#ffd93d');
      gradient.addColorStop(1, '#ffb81c');
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, cardWidth, headerHeight);
    
    // Texto "Cádentro" no header
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Cádentro', x + cardWidth / 2, y + headerHeight / 2 + 5);
    
    // Desenhar borda do card
    ctx.strokeStyle = isOdd ? '#ff8c42' : '#ffd93d';
    ctx.lineWidth = 4;
    ctx.strokeRect(x, y, cardWidth, cardHeight);
    
    // Desenhar a foto
    if (images[i]) {
      ctx.drawImage(images[i], x, y + headerHeight, cardWidth, photoSize);
    } else {
      // Fundo branco para espaços vazios
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x, y + headerHeight, cardWidth, photoSize);
      
      // Texto "É a tua vez!"
      ctx.fillStyle = isOdd ? '#ff6b35' : '#ffb81c';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('É a tua vez!', x + cardWidth / 2, y + headerHeight + photoSize / 2);
    }
  }

  return canvas.toDataURL('image/jpeg', 0.95);
};