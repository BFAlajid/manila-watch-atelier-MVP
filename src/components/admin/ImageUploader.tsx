import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, X, Image as ImageIcon, Check, AlertCircle } from 'lucide-react';

interface ImageUploaderProps {
  currentImages?: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
}

export function ImageUploader({
  currentImages = [],
  onImagesChange,
  maxImages = 10,
  maxSizeMB = 5
}: ImageUploaderProps) {
  const [images, setImages] = useState<string[]>(currentImages);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string>('');
  const [uploadStatus, setUploadStatus] = useState<{ [key: string]: 'uploading' | 'success' | 'error' }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setError('');
    const newImages: string[] = [];

    // Check total image count
    if (images.length + files.length > maxImages) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError(`${file.name} is not an image file`);
        continue;
      }

      // Validate file size
      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > maxSizeMB) {
        setError(`${file.name} is too large (max ${maxSizeMB}MB)`);
        continue;
      }

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        newImages.push(dataUrl);

        // Simulate upload process
        setUploadStatus(prev => ({ ...prev, [dataUrl]: 'uploading' }));

        // In a real app, upload to server here
        setTimeout(() => {
          setUploadStatus(prev => ({ ...prev, [dataUrl]: 'success' }));

          // Update images array
          const updatedImages = [...images, ...newImages];
          setImages(updatedImages);
          onImagesChange(updatedImages);
        }, 1000);
      };

      reader.readAsDataURL(file);
    }
  }, [images, maxImages, maxSizeMB, onImagesChange]);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    onImagesChange(updatedImages);
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const updatedImages = [...images];
    const [movedImage] = updatedImages.splice(fromIndex, 1);
    updatedImages.splice(toIndex, 0, movedImage);
    setImages(updatedImages);
    onImagesChange(updatedImages);
  };

  return (
    <div className="space-y-4">
      {/* Drag & Drop Zone */}
      <motion.div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all ${
          isDragging
            ? 'border-[#D4AF37] bg-[#D4AF37]/5 scale-105'
            : 'border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
            isDragging ? 'bg-[#D4AF37]' : 'bg-neutral-200'
          }`}>
            <Upload className={`w-8 h-8 ${isDragging ? 'text-white' : 'text-neutral-600'}`} />
          </div>

          <div className="text-center">
            <p className="text-lg font-medium text-neutral-900 mb-1">
              {isDragging ? 'Drop images here' : 'Drag & drop images or click to browse'}
            </p>
            <p className="text-sm text-neutral-500">
              PNG, JPG, WebP up to {maxSizeMB}MB (max {maxImages} images)
            </p>
          </div>
        </div>
      </motion.div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
            <button
              onClick={() => setError('')}
              className="ml-auto p-1 hover:bg-red-100 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Gallery */}
      {images.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-neutral-700">
              Uploaded Images ({images.length}/{maxImages})
            </p>
            <p className="text-xs text-neutral-500">
              Drag to reorder • First image is the cover
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <motion.div
                key={`${image}-${index}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative group"
                draggable
                onDragStart={(e) => e.dataTransfer.setData('text/plain', index.toString())}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                  handleReorder(fromIndex, index);
                }}
              >
                {/* Image Preview */}
                <div className="relative aspect-square rounded-lg overflow-hidden bg-neutral-100 border-2 border-neutral-200 group-hover:border-[#D4AF37] transition-colors">
                  <img
                    src={image}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Cover Badge */}
                  {index === 0 && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-[#D4AF37] text-white text-xs font-medium rounded">
                      Cover
                    </div>
                  )}

                  {/* Upload Status */}
                  {uploadStatus[image] === 'uploading' && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}

                  {uploadStatus[image] === 'success' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 bg-green-500/90 flex items-center justify-center"
                    >
                      <Check className="w-12 h-12 text-white" />
                    </motion.div>
                  )}

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* Drag Handle */}
                  <div className="absolute bottom-2 right-2 p-1.5 bg-neutral-900/80 text-white rounded cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zm3 14a1 1 0 100-2 1 1 0 000 2zm0-4a1 1 0 100-2 1 1 0 000 2zm0-4a1 1 0 100-2 1 1 0 000 2z" />
                    </svg>
                  </div>
                </div>

                {/* Image Index */}
                <p className="text-xs text-neutral-500 mt-2 text-center">#{index + 1}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && (
        <div className="text-center py-8 text-neutral-500">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 text-neutral-400" />
          <p className="text-sm">No images uploaded yet</p>
        </div>
      )}
    </div>
  );
}
