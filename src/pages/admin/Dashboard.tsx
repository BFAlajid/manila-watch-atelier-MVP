import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Package, DollarSign, TrendingUp, Users, LogOut, Plus, Edit2, Trash2,
  Eye, Search, Filter, Image as ImageIcon, Save, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import inventoryData from '../../data/inventory.json';

interface Watch {
  id: string;
  slug: string;
  brand: string;
  model: string;
  reference: string;
  name: string;
  price_php: number;
  condition: string;
  box: boolean;
  papers: boolean;
  tier: string;
  availability: string;
  category: string;
  description: string;
  images: string[];
}

export function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [watches, setWatches] = useState<Watch[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBrand, setFilterBrand] = useState('All');
  const [filterTier, setFilterTier] = useState('All');
  const [editingWatch, setEditingWatch] = useState<Watch | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Load watches from inventory
  useEffect(() => {
    setWatches(inventoryData as Watch[]);
  }, []);

  // Calculate stats
  const totalWatches = watches.length;
  const totalValue = watches.reduce((sum, w) => sum + w.price_php, 0);
  const inStockCount = watches.filter(w => w.tier === 'A').length;

  // Filter watches
  const filteredWatches = watches.filter(watch => {
    const matchesSearch = watch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      watch.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      watch.reference.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBrand = filterBrand === 'All' || watch.brand === filterBrand;
    const matchesTier = filterTier === 'All' || watch.tier === filterTier;

    return matchesSearch && matchesBrand && matchesTier;
  });

  const brands = ['All', ...Array.from(new Set(watches.map(w => w.brand)))];
  const tiers = ['All', 'A', 'B', 'C'];

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this watch?')) {
      setWatches(prev => prev.filter(w => w.id !== id));
      // In production: call API to delete
      alert('Watch deleted successfully! (Changes not persisted in demo)');
    }
  };

  const getTierBadge = (tier: string) => {
    const badges = {
      A: { label: 'In Stock', color: 'bg-green-100 text-green-800' },
      B: { label: 'Incoming', color: 'bg-blue-100 text-blue-800' },
      C: { label: 'Sourcing', color: 'bg-yellow-100 text-yellow-800' }
    };
    const badge = badges[tier as keyof typeof badges] || badges.A;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        Tier {tier}: {badge.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Manila Watch Atelier</h1>
              <p className="text-sm text-neutral-600 mt-1">Admin Dashboard</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-neutral-900">{user?.name}</p>
                <p className="text-xs text-neutral-500">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Total Inventory</p>
                <p className="text-3xl font-bold text-neutral-900 mt-2">{totalWatches}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Total Value</p>
                <p className="text-3xl font-bold text-neutral-900 mt-2">
                  ₱{(totalValue / 1000000).toFixed(1)}M
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Ready to Ship</p>
                <p className="text-3xl font-bold text-neutral-900 mt-2">{inStockCount}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex-1 flex gap-4 flex-wrap">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search watches..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                />
              </div>

              {/* Brand Filter */}
              <select
                value={filterBrand}
                onChange={(e) => setFilterBrand(e.target.value)}
                className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              >
                {brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>

              {/* Tier Filter */}
              <select
                value={filterTier}
                onChange={(e) => setFilterTier(e.target.value)}
                className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              >
                {tiers.map(tier => (
                  <option key={tier} value={tier}>{tier === 'All' ? 'All Tiers' : `Tier ${tier}`}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Add Watch
            </button>
          </div>
        </div>

        {/* Watches Table */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Watch
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Brand
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Reference
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Tier
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredWatches.map((watch, index) => (
                  <motion.tr
                    key={watch.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-neutral-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={watch.images[0]}
                          alt={watch.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div>
                          <p className="font-medium text-neutral-900">{watch.name}</p>
                          <p className="text-sm text-neutral-500">{watch.model}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-900">{watch.brand}</td>
                    <td className="px-6 py-4 text-sm text-neutral-600">{watch.reference}</td>
                    <td className="px-6 py-4 text-sm font-medium text-neutral-900">
                      ₱{watch.price_php.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">{getTierBadge(watch.tier)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingWatch(watch)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(watch.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

          {filteredWatches.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-600">No watches found</p>
              <p className="text-sm text-neutral-500 mt-1">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal - Placeholder */}
      {editingWatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-neutral-900">Edit Watch</h2>
              <button
                onClick={() => setEditingWatch(null)}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-neutral-600 mb-4">
              Editing: <strong>{editingWatch.name}</strong>
            </p>
            <p className="text-sm text-neutral-500">
              Full edit functionality coming next...
            </p>
            <button
              onClick={() => setEditingWatch(null)}
              className="mt-6 w-full py-3 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
