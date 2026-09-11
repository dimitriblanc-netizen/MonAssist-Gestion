/**
 * Compresse une image côté client (via HTML5 Canvas) en WebP/JPEG
 * Réduit les fichiers de 5-10 Mo à environ 150-250 Ko pour respecter les quotas gratuits Firebase.
 */
export async function compressImage(file: File, maxWidth = 1600, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    // Si c'est un PDF, on retourne directement le dataUrl ou l'objet
    if (file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Export en WebP (ou JPEG si non supporté)
        const compressedDataUrl = canvas.toDataURL('image/webp', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
}
