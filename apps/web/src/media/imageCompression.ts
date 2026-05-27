export type CompressImageOptions = {
  maxDimension?: number;
  maxBytes?: number;
  type?: 'image/webp' | 'image/jpeg';
  quality?: number;
};

export async function compressImage(file: File, options: CompressImageOptions = {}): Promise<Blob> {
  const maxDimension = options.maxDimension ?? 1600;
  const maxBytes = options.maxBytes ?? 1.5 * 1024 * 1024;
  const outputType = options.type ?? (file.type === 'image/jpeg' ? 'image/jpeg' : 'image/webp');

  if (!file.type.startsWith('image/')) return file;
  if (typeof createImageBitmap !== 'function') return file;

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) return file;
  context.drawImage(bitmap, 0, 0, width, height);

  let quality = options.quality ?? 0.82;
  let blob = await canvasToBlob(canvas, outputType, quality);
  while (blob.size > maxBytes && quality > 0.45) {
    quality -= 0.1;
    blob = await canvasToBlob(canvas, outputType, quality);
  }
  return blob;
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob ?? new Blob()), type, quality);
  });
}
