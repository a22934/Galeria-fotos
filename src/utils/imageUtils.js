import html2canvas from 'html2canvas';

export function downloadImage(dataUrl, filename = 'image.jpg') {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export async function captureElementToDataUrl(element) {
  if (!element) return null;

  try {
    const canvas = await html2canvas(element, {
      useCORS: true,
      backgroundColor: '#ffffff',
      scale: 2,
    });

    return canvas.toDataURL('image/jpeg', 0.95);
  } catch (err) {
    console.error('Erro a capturar a grelha:', err);
    return null;
  }
}
