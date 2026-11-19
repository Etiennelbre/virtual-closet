// Makes a photo smaller before sending it: max 1000 px, JPEG.
// Drawing it on a canvas also removes the hidden data (EXIF), like the GPS location.
// Returns the JPEG as base64 text (without the "data:image/jpeg;base64," start).
export function resizePhoto(file, maxSize = 1000) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(img.src);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      resolve(dataUrl.split(',')[1]);
    };
    img.onerror = () => reject(new Error('Could not read this photo'));
    img.src = URL.createObjectURL(file);
  });
}
