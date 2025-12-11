import { useState, useEffect } from 'react';
import { Watch } from '../../types/inventory';
import { Plus, Edit, Trash2, Eye, LogOut, Package, TrendingUp, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AddWatchForm } from './AddWatchForm';
import { EditWatchForm } from './EditWatchForm';
import { toast } from 'sonner';

// API configuration - works both locally and in production
const API_BASE_URL = import.meta.env.PROD
  ? '/api'  // Production (Vercel serverless functions)
  : 'http://localhost:3001/api';  // Development (dev-server.js)

interface AdminPanelProps {
  onLogout: () => void;
}

export function AdminPanel({ onLogout }: AdminPanelProps) {
  const [watches, setWatches] = useState<Watch[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingWatch, setEditingWatch] = useState<Watch | null>(null);
  const [selectedWatch, setSelectedWatch] = useState<Watch | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadWatches();
  }, []);

  const loadWatches = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/inventory`);

      if (!response.ok) {
        throw new Error('Failed to load inventory');
      }

      const data = await response.json();
      setWatches(data);
    } catch (error) {
      console.error('Error loading watches:', error);
      toast.error('Failed to load inventory');
      setWatches([]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveWatches = async (updatedWatches: Watch[]) => {
    try {
      setIsSaving(true);
      const response = await fetch(`${API_BASE_URL}/inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedWatches),
      });

      if (!response.ok) {
        throw new Error('Failed to save inventory');
      }

      const result = await response.json();
      setWatches(updatedWatches);
      toast.success(result.message || 'Inventory saved successfully');
    } catch (error) {
      console.error('Error saving watches:', error);
      toast.error('Failed to save inventory');
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddWatch = (watchData: Omit<Watch, 'id' | 'created_at' | 'updated_at'>) => {
    const newWatch: Watch = {
      ...watchData,
      id: `watch-${String(watches.length + 1).padStart(3, '0')}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updatedWatches = [...watches, newWatch];
    saveWatches(updatedWatches);
    setShowAddForm(false);
  };

  const handleEditWatch = (watchData: Omit<Watch, 'id' | 'created_at' | 'updated_at'>) => {
    if (!editingWatch) return;

    const updatedWatch: Watch = {
      ...watchData,
      id: editingWatch.id,
      created_at: editingWatch.created_at,
      updated_at: new Date().toISOString(),
    };

    const updatedWatches = watches.map(w => w.id === editingWatch.id ? updatedWatch : w);
    saveWatches(updatedWatches);
    setEditingWatch(null);
  };

  const handleDeleteWatch = (id: string) => {
    if (confirm('Are you sure you want to delete this watch?')) {
      const updatedWatches = watches.filter(w => w.id !== id);
      saveWatches(updatedWatches);
    }
  };

  const totalValue = watches.reduce((sum, watch) => sum + (watch.price_php || 0), 0);
  const inStockCount = watches.filter(w => w.availability === 'in_stock').length;
  const avgPrice = watches.length > 0 ? totalValue / watches.length : 0;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-neutral-900 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl mb-2 text-white">
                MANILA WATCH<span className="text-[#D4AF37]"> ATELIER</span>
              </h1>
              <p className="text-neutral-400">Admin Dashboard</p>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 px-4 py-2 border border-neutral-700 hover:bg-neutral-800 rounded transition-colors text-white"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-neutral-900 border border-neutral-800 rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400 mb-1">Total Inventory</p>
                <p className="text-3xl text-white">{watches.length}</p>
              </div>
              <div className="bg-blue-900/50 p-3 rounded-full">
                <Package className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-neutral-900 border border-neutral-800 rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400 mb-1">In Stock</p>
                <p className="text-3xl text-white">{inStockCount}</p>
              </div>
              <div className="bg-green-900/50 p-3 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-neutral-900 border border-neutral-800 rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400 mb-1">Total Value</p>
                <p className="text-3xl text-[#D4AF37]">₱{(totalValue / 1000000).toFixed(1)}M</p>
              </div>
              <div className="bg-yellow-900/50 p-3 rounded-full">
                <DollarSign className="w-6 h-6 text-[#D4AF37]" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Add Watch Button */}
        {!showAddForm && !editingWatch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8"
          >
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-neutral-900 text-white hover:bg-neutral-800 rounded-lg shadow-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add New Watch</span>
            </button>
          </motion.div>
        )}

        {/* Add Watch Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              <AddWatchForm
                onSave={handleAddWatch}
                onCancel={() => setShowAddForm(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Watch Form */}
        <AnimatePresence>
          {editingWatch && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              <EditWatchForm
                watch={editingWatch}
                onSave={handleEditWatch}
                onCancel={() => setEditingWatch(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Watches Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-neutral-900 border border-neutral-800 rounded-lg shadow overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-neutral-800">
            <h2 className="text-xl text-white">Inventory ({watches.length})</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-950 border-b border-neutral-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-neutral-400">
                    Watch
                  </th>
                  <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-neutral-400">
                    Reference
                  </th>
                  <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-neutral-400">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-neutral-400">
                    Tier
                  </th>
                  <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-neutral-400">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-neutral-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {watches.map((watch, index) => (
                  <motion.tr
                    key={watch.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-neutral-800 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-black rounded overflow-hidden flex-shrink-0">
                          <img
                            src={watch.images[0]}
                            alt={watch.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                        <div>
                          <p className="text-sm text-white">{watch.name}</p>
                          <p className="text-xs text-neutral-400">{watch.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-neutral-300">{watch.reference}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-neutral-300">₱{(watch.price_php || 0).toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${
                        watch.tier === 'A' ? 'bg-green-100 text-green-800' :
                        watch.tier === 'B' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        Tier {watch.tier}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${
                        watch.availability === 'in_stock' ? 'bg-green-100 text-green-800' :
                        watch.availability === 'incoming' ? 'bg-yellow-100 text-yellow-800' :
                        watch.availability === 'sold' ? 'bg-gray-100 text-gray-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {watch.availability.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedWatch(watch)}
                          className="p-2 hover:bg-neutral-700 text-neutral-400 hover:text-white rounded transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingWatch(watch);
                            setShowAddForm(false);
                          }}
                          className="p-2 hover:bg-blue-900/50 text-blue-400 hover:text-blue-300 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteWatch(watch.id)}
                          className="p-2 hover:bg-red-900/50 text-red-400 hover:text-red-300 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {watches.length === 0 && (
            <div className="text-center py-12 text-neutral-500">
              <Package className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
              <p>No watches in inventory</p>
              <p className="text-sm mt-2">Click "Add New Watch" to get started</p>
            </div>
          )}
        </motion.div>

        {/* Watch Preview Modal */}
        <AnimatePresence>
          {selectedWatch && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedWatch(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 50 }}
                className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl">{selectedWatch.name}</h3>
                    <button
                      onClick={() => setSelectedWatch(null)}
                      className="p-2 hover:bg-neutral-100 rounded-full"
                    >
                      ×
                    </button>
                  </div>
                  
                  <div className="w-full h-64 bg-black rounded-lg mb-4 overflow-hidden">
                    <img
                      src={selectedWatch.images[0]}
                      alt={selectedWatch.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-neutral-600">Brand</p>
                        <p>{selectedWatch.brand}</p>
                      </div>
                      <div>
                        <p className="text-neutral-600">Reference</p>
                        <p>{selectedWatch.reference}</p>
                      </div>
                      <div>
                        <p className="text-neutral-600">Price</p>
                        <p>₱{(selectedWatch.price_php || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-neutral-600">Condition</p>
                        <p className="capitalize">{selectedWatch.condition.replace('_', ' ')}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-neutral-600 mb-1">Description</p>
                      <p className="text-neutral-800">{selectedWatch.description}</p>
                    </div>

                    <div>
                      <p className="text-neutral-600 mb-1">Specifications</p>
                      <ul className="space-y-1 text-neutral-800">
                        <li>Movement: {selectedWatch.specifications.movement}</li>
                        <li>Case: {selectedWatch.specifications.caseMaterial}</li>
                        <li>Diameter: {selectedWatch.specifications.diameter}</li>
                        <li>Water Resistance: {selectedWatch.specifications.waterResistance}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
