import { AppFontFamily, DesignSettings } from '../types/media';

export function getButtonStyleClass(shape: DesignSettings['buttonShape']): string {
  switch (shape) {
    case 'pill':
      return 'rounded-full';
    case 'soft':
      return 'rounded-lg';
    case 'tactile':
      return 'rounded-2xl border-b-4 border-black/25 active:border-b-0 active:translate-y-0.5';
    default:
      return 'rounded-2xl';
  }
}

export function getClockSizePixels(size: DesignSettings['clockSize']): number {
  if (size === 'small') return 245;
  if (size === 'medium') return 285;
  return 330;
}

export function getFontFamilyValue(font: AppFontFamily): string {
  switch (font) {
    case 'fredoka':
      return "'Fredoka', system-ui, sans-serif";
    case 'nunito':
      return "'Nunito', system-ui, sans-serif";
    case 'jakarta':
      return "'Plus Jakarta Sans', system-ui, sans-serif";
    default:
      return "'Outfit', system-ui, sans-serif";
  }
}

export function compressImageFile(file: File, maxWidth = 880): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar'));
    reader.onload = () => {
      const dataUrl = String(reader.result);
      const img = new Image();
      img.onerror = () => resolve(dataUrl);
      img.onload = () => {
        if (img.width <= maxWidth) {
          resolve(dataUrl);
          return;
        }
        const scale = maxWidth / img.width;
        const canvas = document.createElement('canvas');
        canvas.width = maxWidth;
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}
