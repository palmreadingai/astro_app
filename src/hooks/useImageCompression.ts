import { useState, useCallback } from 'react';

interface CompressedImageResult {
  originalFile: File;
  compressedFile: File;
  base64: string;
  preview: string;
}

export const useImageCompression = () => {
  const [isCompressing, setIsCompressing] = useState(false);

  const compressImage = useCallback(async (file: File, maxWidth = 800, quality = 0.8): Promise<CompressedImageResult> => {
    setIsCompressing(true);

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        const { width, height } = img;
        const aspectRatio = width / height;
        
        let newWidth = width;
        let newHeight = height;
        
        if (width > maxWidth) {
          newWidth = maxWidth;
          newHeight = maxWidth / aspectRatio;
        }

        // Set canvas dimensions
        canvas.width = newWidth;
        canvas.height = newHeight;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, newWidth, newHeight);
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }

            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });

            // Convert to base64
            const reader = new FileReader();
            reader.onload = () => {
              const base64 = reader.result as string;
              const preview = URL.createObjectURL(blob);
              
              resolve({
                originalFile: file,
                compressedFile,
                base64,
                preview,
              });
              
              setIsCompressing(false);
            };
            reader.onerror = () => {
              reject(new Error('Failed to convert to base64'));
              setIsCompressing(false);
            };
            reader.readAsDataURL(blob);
          },
          file.type,
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
        setIsCompressing(false);
      };

      img.src = URL.createObjectURL(file);
    });
  }, []);

  return { compressImage, isCompressing };
};