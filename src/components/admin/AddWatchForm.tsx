import { useState } from 'react';
import { Watch, WatchCondition, InventoryTier, WatchAvailability } from '../../types/inventory';
import { Plus, X, Upload, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface AddWatchFormProps {
  onSave: (watch: Omit<Watch, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
}

export function AddWatchForm({ onSave, onCancel }: AddWatchFormProps) {
  const [formData, setFormData] = useState({
    slug: '',
    brand: 'Rolex',
    model: '',
    reference: '',
    name: '',
    price_php: '',
    price_usd: '',
    year: '',
    condition: 'excellent' as WatchCondition,
    box: true,
    papers: true,
    tier: 'A' as InventoryTier,
    availability: 'in_stock' as WatchAvailability,
    eta: '',
    category: 'Sport',
    description: '',
    images: [''],
    specifications: {
      movement: '',
      caseMaterial: '',
      diameter: '',
      waterResistance: '',
    },
  });

  const [imagePreview, setImagePreview] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const watchData: Omit<Watch, 'id' | 'created_at' | 'updated_at'> = {
      ...formData,
      price_php: parseInt(formData.price_php) || 0,
      price_usd: formData.price_usd ? parseInt(formData.price_usd) : undefined,
      year: formData.year ? parseInt(formData.year) : undefined,
      images: formData.images.filter(img => img.trim() !== ''),
    };

    onSave(watchData);
  };

  const addImageField = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ''],
    }));
  };

  const removeImageField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const updateImageField = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => (i === index ? value : img)),
    }));
    if (index === 0) setImagePreview(value);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl">Add New Watch</h2>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2">Brand *</label>
            <select
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-neutral-900"
              required
            >
              <option value="Rolex">Rolex</option>
              <option value="Patek Philippe">Patek Philippe</option>
              <option value="Audemars Piguet">Audemars Piguet</option>
              <option value="Vacheron Constantin">Vacheron Constantin</option>
              <option value="A. Lange & Söhne">A. Lange & Söhne</option>
              <option value="Richard Mille">Richard Mille</option>
            </select>
          </div>

          <div>
            <label className="block mb-2">Model *</label>
            <input
              type="text"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-neutral-900"
              placeholder="Submariner"
              required
            />
          </div>

          <div>
            <label className="block mb-2">Reference *</label>
            <input
              type="text"
              value={formData.reference}
              onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-neutral-900"
              placeholder="126610LN"
              required
            />
          </div>

          <div>
            <label className="block mb-2">Display Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-neutral-900"
              placeholder="Submariner Date Ceramic"
              required
            />
          </div>

          <div>
            <label className="block mb-2">Slug (URL) *</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-neutral-900"
              placeholder="rolex-submariner-date-ceramic"
              required
            />
          </div>

          <div>
            <label className="block mb-2">Year</label>
            <input
              type="number"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-neutral-900"
              placeholder="2024"
              min="1900"
              max="2030"
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2">Price (PHP) *</label>
            <input
              type="number"
              value={formData.price_php}
              onChange={(e) => setFormData({ ...formData, price_php: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-neutral-900"
              placeholder="1050000"
              required
              min="0"
            />
          </div>

          <div>
            <label className="block mb-2">Price (USD)</label>
            <input
              type="number"
              value={formData.price_usd}
              onChange={(e) => setFormData({ ...formData, price_usd: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-neutral-900"
              placeholder="18500"
              min="0"
            />
          </div>
        </div>

        {/* Condition & Inventory */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <label className="block mb-2">Condition *</label>
            <select
              value={formData.condition}
              onChange={(e) => setFormData({ ...formData, condition: e.target.value as WatchCondition })}
              className="w-full px-4 py-2 border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-neutral-900"
              required
            >
              <option value="brand_new">Brand New</option>
              <option value="unworn">Unworn</option>
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
            </select>
          </div>

          <div>
            <label className="block mb-2">Tier *</label>
            <select
              value={formData.tier}
              onChange={(e) => setFormData({ ...formData, tier: e.target.value as InventoryTier })}
              className="w-full px-4 py-2 border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-neutral-900"
              required
            >
              <option value="A">A - In Hand</option>
              <option value="B">B - Incoming</option>
              <option value="C">C - On Demand</option>
            </select>
          </div>

          <div>
            <label className="block mb-2">Availability *</label>
            <select
              value={formData.availability}
              onChange={(e) => setFormData({ ...formData, availability: e.target.value as WatchAvailability })}
              className="w-full px-4 py-2 border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-neutral-900"
              required
            >
              <option value="in_stock">In Stock</option>
              <option value="incoming">Incoming</option>
              <option value="sold">Sold</option>
              <option value="reserved">Reserved</option>
            </select>
          </div>

          <div>
            <label className="block mb-2">Category *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-neutral-900"
              required
            >
              <option value="Sport">Sport</option>
              <option value="Luxury">Luxury</option>
              <option value="Dress">Dress</option>
            </select>
          </div>
        </div>

        {/* Accessories */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.box}
              onChange={(e) => setFormData({ ...formData, box: e.target.checked })}
              className="w-5 h-5"
              id="box"
            />
            <label htmlFor="box" className="cursor-pointer">Original Box</label>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.papers}
              onChange={(e) => setFormData({ ...formData, papers: e.target.checked })}
              className="w-5 h-5"
              id="papers"
            />
            <label htmlFor="papers" className="cursor-pointer">Papers</label>
          </div>

          {formData.tier === 'B' && (
            <div>
              <label className="block mb-2">ETA Date</label>
              <input
                type="date"
                value={formData.eta}
                onChange={(e) => setFormData({ ...formData, eta: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block mb-2">Description *</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-neutral-900 min-h-[120px]"
            placeholder="Detailed description highlighting unique features, condition, and collector appeal..."
            required
          />
        </div>

        {/* Specifications */}
        <div className="border border-neutral-300 rounded p-4">
          <h3 className="mb-4">Technical Specifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm">Movement *</label>
              <input
                type="text"
                value={formData.specifications.movement}
                onChange={(e) => setFormData({
                  ...formData,
                  specifications: { ...formData.specifications, movement: e.target.value }
                })}
                className="w-full px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-neutral-900"
                placeholder="Caliber 3235 Automatic"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm">Case Material *</label>
              <input
                type="text"
                value={formData.specifications.caseMaterial}
                onChange={(e) => setFormData({
                  ...formData,
                  specifications: { ...formData.specifications, caseMaterial: e.target.value }
                })}
                className="w-full px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-neutral-900"
                placeholder="Stainless Steel 904L"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm">Diameter *</label>
              <input
                type="text"
                value={formData.specifications.diameter}
                onChange={(e) => setFormData({
                  ...formData,
                  specifications: { ...formData.specifications, diameter: e.target.value }
                })}
                className="w-full px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-neutral-900"
                placeholder="41mm"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm">Water Resistance *</label>
              <input
                type="text"
                value={formData.specifications.waterResistance}
                onChange={(e) => setFormData({
                  ...formData,
                  specifications: { ...formData.specifications, waterResistance: e.target.value }
                })}
                className="w-full px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-neutral-900"
                placeholder="300m"
                required
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="border border-neutral-300 rounded p-4">
          <div className="flex items-center justify-between mb-4">
            <h3>Images</h3>
            <button
              type="button"
              onClick={addImageField}
              className="flex items-center space-x-2 px-3 py-1 bg-neutral-100 hover:bg-neutral-200 rounded transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Image</span>
            </button>
          </div>

          <div className="space-y-3">
            {formData.images.map((img, index) => (
              <div key={index} className="flex items-center space-x-3">
                <input
                  type="text"
                  value={img}
                  onChange={(e) => updateImageField(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  placeholder={index === 0 ? "/watches/image.jpg (Main image)" : "/watches/image.jpg"}
                  required={index === 0}
                />
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removeImageField(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {imagePreview && (
            <div className="mt-4">
              <p className="text-sm text-neutral-600 mb-2">Preview:</p>
              <div className="w-48 h-48 border border-neutral-300 rounded overflow-hidden">
                <ImageWithFallback
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          <p className="text-xs text-neutral-500 mt-3">
            Place images in <code className="bg-neutral-100 px-1 py-0.5 rounded">/public/watches/</code> folder and reference them as <code className="bg-neutral-100 px-1 py-0.5 rounded">/watches/filename.jpg</code>
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4 pt-4 border-t border-neutral-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-neutral-300 hover:bg-neutral-50 rounded transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center space-x-2 px-6 py-2 bg-neutral-900 text-white hover:bg-neutral-800 rounded transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Watch</span>
          </button>
        </div>
      </form>
    </motion.div>
  );
}
