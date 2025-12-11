import { useState } from 'react';
import { Upload, X, Image as ImageIcon, Link, ChevronDown, ChevronUp, GripVertical, Star } from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface ImageGalleryManagerProps {
  images: string[];
  onChange: (images: string[]) => void;
  onUpload?: (files: FileList) => Promise<string[]>; // Optional upload handler
}

export function ImageGalleryManager({ images, onChange, onUpload }: ImageGalleryManagerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [uploadMode, setUploadMode] = useState<'url' | 'file'>('url');
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);

  // Handle drag & drop file upload
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0 && onUpload) {
      try {
        const uploadedUrls = await onUpload(files);
        onChange([...images, ...uploadedUrls]);
      } catch (error) {
        console.error('Upload failed:', error);
        alert('Failed to upload images. Please try again.');
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // Handle file input
  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && onUpload) {
      try {
        const uploadedUrls = await onUpload(files);
        onChange([...images, ...uploadedUrls]);
      } catch (error) {
        console.error('Upload failed:', error);
        alert('Failed to upload images. Please try again.');
      }
    }
  };

  // Add image via URL
  const handleAddUrl = () => {
    if (newImageUrl.trim()) {
      onChange([...images, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  // Remove image
  const handleRemove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
    if (primaryImageIndex >= images.length - 1) {
      setPrimaryImageIndex(Math.max(0, images.length - 2));
    }
  };

  // Set primary image
  const handleSetPrimary = (index: number) => {
    const reordered = [...images];
    const [primary] = reordered.splice(index, 1);
    reordered.unshift(primary);
    onChange(reordered);
    setPrimaryImageIndex(0);
  };

  // Handle reorder via drag & drop
  const handleReorder = (newOrder: string[]) => {
    onChange(newOrder);
  };

  return (
    <div className="border border-neutral-700 bg-neutral-800 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <ImageIcon className="w-5 h-5 text-neutral-400" />
          <h3 className="font-medium">Image Gallery</h3>
          <span className="text-sm text-neutral-500">({images.length} images)</span>
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-neutral-800 rounded transition-colors"
        >
          {isExpanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Primary Image Preview (Always Visible) */}
      {images.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-neutral-400 mb-2">Primary Image:</p>
          <div className="relative w-full h-48 border border-neutral-700 bg-neutral-800 rounded overflow-hidden bg-neutral-50">
            <ImageWithFallback
              src={images[0]}
              alt="Primary image"
              className="w-full h-full object-contain"
            />
            <div className="absolute top-2 left-2 bg-yellow-400 text-neutral-900 px-2 py-1 rounded text-xs font-medium flex items-center space-x-1">
              <Star className="w-3 h-3 fill-current" />
              <span>Primary</span>
            </div>
          </div>
        </div>
      )}

      {/* Expanded Gallery */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Upload Mode Toggle */}
            <div className="flex space-x-2 mb-4">
              <button
                type="button"
                onClick={() => setUploadMode('url')}
                className={`flex-1 px-4 py-2 rounded transition-colors ${
                  uploadMode === 'url'
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-800 text-white hover:bg-neutral-700'
                }`}
              >
                <Link className="w-4 h-4 inline mr-2" />
                Add via URL
              </button>
              <button
                type="button"
                onClick={() => setUploadMode('file')}
                className={`flex-1 px-4 py-2 rounded transition-colors ${
                  uploadMode === 'file'
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-800 text-white hover:bg-neutral-700'
                }`}
              >
                <Upload className="w-4 h-4 inline mr-2" />
                Upload Files
              </button>
            </div>

            {/* URL Input Mode */}
            {uploadMode === 'url' && (
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddUrl()}
                  className="flex-1 px-3 py-2 border border-neutral-700 bg-neutral-800 rounded focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  placeholder="/images/watches/watch.jpg or https://..."
                />
                <button
                  type="button"
                  onClick={handleAddUrl}
                  className="px-4 py-2 bg-neutral-900 text-white rounded hover:bg-neutral-800 transition-colors"
                >
                  Add
                </button>
              </div>
            )}

            {/* File Upload Mode */}
            {uploadMode === 'file' && (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging
                    ? 'border-neutral-900 bg-neutral-50'
                    : 'border-neutral-300 bg-neutral-900'
                }`}
              >
                <Upload className="w-12 h-12 mx-auto mb-3 text-neutral-400" />
                <p className="text-neutral-400 mb-2">
                  Drag & drop images here, or click to browse
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-block px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded cursor-pointer transition-colors"
                >
                  Choose Files
                </label>
                <p className="text-xs text-neutral-500 mt-2">
                  Supports JPG, PNG, WebP (max 5MB each)
                </p>
              </div>
            )}

            {/* Image Gallery Grid with Drag-to-Reorder */}
            {images.length > 0 && (
              <div>
                <p className="text-sm text-neutral-400 mb-3">
                  Drag images to reorder. First image is the primary display image.
                </p>
                <Reorder.Group
                  axis="y"
                  values={images}
                  onReorder={handleReorder}
                  className="space-y-2"
                >
                  {images.map((img, index) => (
                    <Reorder.Item key={img} value={img}>
                      <motion.div
                        layout
                        className={`flex items-center space-x-3 p-3 border rounded-lg bg-neutral-900 hover:shadow-md transition-shadow ${
                          index === 0 ? 'border-yellow-400 border-2' : 'border-neutral-300'
                        }`}
                      >
                        {/* Drag Handle */}
                        <div className="cursor-grab active:cursor-grabbing">
                          <GripVertical className="w-5 h-5 text-neutral-400" />
                        </div>

                        {/* Thumbnail */}
                        <div className="w-16 h-16 border border-neutral-200 rounded overflow-hidden flex-shrink-0 bg-neutral-50">
                          <ImageWithFallback
                            src={img}
                            alt={`Image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* URL Display */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{img}</p>
                          <p className="text-xs text-neutral-500">
                            {index === 0 ? 'Primary Image' : `Image ${index + 1}`}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          {index !== 0 && (
                            <button
                              type="button"
                              onClick={() => handleSetPrimary(index)}
                              className="p-2 text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                              title="Set as primary"
                            >
                              <Star className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemove(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Remove image"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              </div>
            )}

            {images.length === 0 && (
              <div className="text-center py-8 text-neutral-500">
                <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No images added yet</p>
                <p className="text-sm">Add images using the options above</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
