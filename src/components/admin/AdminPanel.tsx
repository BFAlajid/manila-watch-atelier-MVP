import { useState, useEffect } from 'react';
import { Watch } from '../../types/inventory';
import { Plus, Edit, Trash2, Eye, LogOut, Package, TrendingUp, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AddWatchForm } from './AddWatchForm';
import inventoryData from '../../data/inventory.json';

interface AdminPanelProps {
  onLogout: () => void;
}

export function AdminPanel({ onLogout }: AdminPanelProps) {
  const [watches, setWatches] = useState<Watch[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedWatch, setSelectedWatch] = useState<Watch | null>(null);

  useEffect(() => {
    loadWatches();
  }, []);

  const loadWatches = () => {
    // Load from localStorage first, fallback to JSON
    const localWatches = localStorage.getItem('manila_watches');
    if (localWatches) {
      setWatches(JSON.parse(localWatches));
    } else {
      setWatches(inventoryData as Watch[]);
    }
  };

  const saveWatches = (updatedWatches: Watch[]) => {
    localStorage.setItem('manila_watches', JSON.stringify(updatedWatches));
    setWatches(updatedWatches);
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
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl mb-2">Manila Watch Atelier</h1>
              <p className="text-neutral-600">Admin Dashboard</p>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 px-4 py-2 border border-neutral-300 hover:bg-neutral-50 rounded transition-colors"
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
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Total Inventory</p>
                <p className="text-3xl">{watches.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">In Stock</p>
                <p className="text-3xl">{inStockCount}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Total Value</p>
                <p className="text-3xl">₱{(totalValue / 1000000).toFixed(1)}M</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Add Watch Button */}
        {!showAddForm && (
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

        {/* Watches Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-neutral-200">
            <h2 className="text-xl">Inventory ({watches.length})</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-neutral-600">
                    Watch
                  </th>
                  <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-neutral-600">
                    Reference
                  </th>
                  <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-neutral-600">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-neutral-600">
                    Tier
                  </th>
                  <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-neutral-600">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs uppercase tracking-wider text-neutral-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {watches.map((watch, index) => (
                  <motion.tr
                    key={watch.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-neutral-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-neutral-100 rounded overflow-hidden flex-shrink-0">
                          <img
                            src={watch.images[0]}
                            alt={watch.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=100&h=100&fit=crop';
                            }}
                          />
                        </div>
                        <div>
                          <p className="text-sm">{watch.name}</p>
                          <p className="text-xs text-neutral-500">{watch.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-neutral-600">{watch.reference}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm">₱{(watch.price_php || 0).toLocaleString()}</span>
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
                          className="p-2 hover:bg-neutral-100 rounded transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteWatch(watch.id)}
                          className="p-2 hover:bg-red-50 text-red-600 rounded transition-colors"
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
                  
                  <img
                    src={selectedWatch.images[0]}
                    alt={selectedWatch.name}
                    className="w-full h-64 object-cover rounded-lg mb-4"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&h=600&fit=crop';
                    }}
                  />

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
