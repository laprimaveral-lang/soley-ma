import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X } from 'lucide-react';
import { getMediaUrl } from '../../services/api';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  onUpload: (files: File[]) => Promise<string[]>;
}

export default function ImageUploader({ images, onChange, onUpload }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setIsUploading(true);
    try {
      const uploadedUrls = await onUpload(acceptedFiles);
      onChange([...images, ...uploadedUrls]);
    } catch (error) {
      console.error("Upload failed", error);
      alert("Erreur lors de l'upload des images.");
    } finally {
      setIsUploading(false);
    }
  }, [images, onChange, onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    }
  });

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-colors cursor-pointer ${
          isDragActive ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-black hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 text-gray-500">
          <UploadCloud size={32} />
        </div>
        <p className="font-bold text-center">
          {isUploading ? 'Upload en cours...' : (
            isDragActive ? "Déposez les images ici..." : "Glissez & déposez vos images ici, ou cliquez pour sélectionner"
          )}
        </p>
        <p className="text-sm text-gray-500 mt-2">JPEG, PNG ou WEBP (max. 5MB)</p>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((img, index) => (
            <div key={index} className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-square">
              <img src={getMediaUrl(img)} alt={`Upload ${index}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
