import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Package, DollarSign, TrendingUp, MessageSquare, LogOut, Plus, Edit2, Trash2,
  Eye, Search, Filter, ChevronDown, ChevronUp, Mail, Phone, Clock,
  X, RefreshCw, AlertCircle, Upload, Image as ImageIcon, Save, Loader2,
  BarChart3, Download, CheckSquare, Square, GripVertical, FileText, Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// ---------------------------------------------------------------------------
// API config
// ---------------------------------------------------------------------------
const API_BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('admin_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Watch {
  id: string;
  slug: string;
  brand: string;
  model: string;
  reference: string;
  name: string;
  pricePHP: number;
  price_php: number;
  tier: string;
  condition: string;
  images: string[];
  status: string;
  viewCount: number;
  inquiryCount: number;
  availability: string;
  boxPapers: string;
  category?: string;
  description?: string;
  box?: boolean;
  papers?: boolean;
}

interface WatchFormData {
  brand: string;
  model: string;
  name: string;
  reference: string;
  price_php: string;
  condition: string;
  category: string;
  tier: string;
  box: boolean;
  papers: boolean;
  description: string;
}

const emptyFormData: WatchFormData = {
  brand: 'Rolex',
  model: '',
  name: '',
  reference: '',
  price_php: '',
  condition: 'Brand New',
  category: 'Sport',
  tier: 'A',
  box: true,
  papers: true,
  description: '',
};

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: string; // NEW, CONTACTED, FOLLOW_UP, CLOSED
  createdAt: string;
  lastContactedAt?: string;
  watch: {
    id: string;
    slug: string;
    brand: string;
    model: string;
    reference: string;
    pricePHP: number;
    images: string[];
  } | null;
}

type ActiveTab = 'watches' | 'inquiries' | 'analytics';
type InquiryFilter = 'ALL' | 'NEW' | 'CONTACTED' | 'FOLLOW_UP' | 'CLOSED';

// ---------------------------------------------------------------------------
// CSV Export helpers
// ---------------------------------------------------------------------------
function downloadCSV(filename: string, csvContent: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCSV(value: string | number | null | undefined): string {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function exportWatchesCSV(watches: Watch[]) {
  const headers = ['Brand', 'Model', 'Name', 'Reference', 'Price (PHP)', 'Condition', 'Status'];
  const rows = watches.map((w) => [
    escapeCSV(w.brand),
    escapeCSV(w.model),
    escapeCSV(w.name),
    escapeCSV(w.reference),
    escapeCSV(w.pricePHP ?? w.price_php ?? 0),
    escapeCSV(w.condition),
    escapeCSV(w.status),
  ].join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  downloadCSV(`watches-export-${new Date().toISOString().slice(0, 10)}.csv`, csv);
}

function exportInquiriesCSV(inquiries: Inquiry[]) {
  const headers = ['Name', 'Email', 'Phone', 'Message', 'Watch', 'Date', 'Status'];
  const rows = inquiries.map((inq) => [
    escapeCSV(inq.name),
    escapeCSV(inq.email),
    escapeCSV(inq.phone),
    escapeCSV(inq.message),
    escapeCSV(inq.watch ? `${inq.watch.brand} ${inq.watch.model}` : 'General'),
    escapeCSV(new Date(inq.createdAt).toLocaleDateString('en-PH')),
    escapeCSV(inq.status),
  ].join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  downloadCSV(`inquiries-export-${new Date().toISOString().slice(0, 10)}.csv`, csv);
}

// ---------------------------------------------------------------------------
// Analytics helpers
// ---------------------------------------------------------------------------
interface ViewData {
  slug: string;
  timestamp: string;
}

function getStoredViews(): ViewData[] {
  try {
    const raw = localStorage.getItem('manila-watch-views');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getTopViewedWatches(watches: Watch[], views: ViewData[], limit = 8): { name: string; brand: string; count: number }[] {
  // Count views per slug
  const slugCounts: Record<string, number> = {};
  views.forEach((v) => {
    slugCounts[v.slug] = (slugCounts[v.slug] || 0) + 1;
  });

  // Also use viewCount from watches data as fallback
  const combined: { name: string; brand: string; count: number }[] = watches.map((w) => ({
    name: w.name || `${w.brand} ${w.model}`,
    brand: w.brand,
    count: (slugCounts[w.slug] || 0) + (w.viewCount || 0),
  }));

  combined.sort((a, b) => b.count - a.count);
  return combined.slice(0, limit);
}

function getInquiriesByDay(inquiries: Inquiry[], days = 7): { date: string; count: number }[] {
  const now = new Date();
  const result: { date: string; count: number }[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayLabel = d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
    const count = inquiries.filter((inq) => inq.createdAt?.slice(0, 10) === dateStr).length;
    result.push({ date: dayLabel, count });
  }

  return result;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Tab state
  const [activeTab, setActiveTab] = useState<ActiveTab>('watches');

  // Watch state
  const [watches, setWatches] = useState<Watch[]>([]);
  const [watchesLoading, setWatchesLoading] = useState(true);
  const [watchesError, setWatchesError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBrand, setFilterBrand] = useState('All');
  const [filterTier, setFilterTier] = useState('All');
  const [editingWatch, setEditingWatch] = useState<Watch | null>(null);

  // Bulk selection state
  const [selectedWatches, setSelectedWatches] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Add Watch modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addFormData, setAddFormData] = useState<WatchFormData>({ ...emptyFormData });
  const [addImageFiles, setAddImageFiles] = useState<File[]>([]);
  const [addImagePreviews, setAddImagePreviews] = useState<string[]>([]);
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const addFileInputRef = useRef<HTMLInputElement>(null);

  // Edit Watch modal state
  const [editFormData, setEditFormData] = useState<WatchFormData>({ ...emptyFormData });
  const [editImageFiles, setEditImageFiles] = useState<File[]>([]);
  const [editImagePreviews, setEditImagePreviews] = useState<string[]>([]);
  const [editExistingImages, setEditExistingImages] = useState<string[]>([]);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Image drag-and-drop state for edit modal
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);

  // Inquiry state
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(true);
  const [inquiriesError, setInquiriesError] = useState<string | null>(null);
  const [inquiryFilter, setInquiryFilter] = useState<InquiryFilter>('ALL');
  const [expandedInquiry, setExpandedInquiry] = useState<string | null>(null);

  // CRM notes state (per-inquiry, stored in localStorage)
  const [crmNotes, setCrmNotes] = useState<Record<string, string>>({});

  // -------------------------------------------------------------------------
  // Data fetching
  // -------------------------------------------------------------------------
  const fetchWatches = useCallback(async () => {
    setWatchesLoading(true);
    setWatchesError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/watches?status=ALL`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error(`Failed to fetch watches (${res.status})`);
      const data = await res.json();
      // API may return { watches: [...] } or an array directly
      setWatches(Array.isArray(data) ? data : data.watches ?? []);
    } catch (err: any) {
      setWatchesError(err.message ?? 'Failed to load watches');
    } finally {
      setWatchesLoading(false);
    }
  }, []);

  const fetchInquiries = useCallback(async () => {
    setInquiriesLoading(true);
    setInquiriesError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/inquiries`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error(`Failed to fetch inquiries (${res.status})`);
      const data = await res.json();
      const loaded: Inquiry[] = Array.isArray(data) ? data : data.inquiries ?? [];
      setInquiries(loaded);

      // Load CRM notes from localStorage
      const notesMap: Record<string, string> = {};
      loaded.forEach((inq) => {
        const saved = localStorage.getItem(`manila-crm-notes-${inq.id}`);
        if (saved) notesMap[inq.id] = saved;
      });
      setCrmNotes(notesMap);
    } catch (err: any) {
      setInquiriesError(err.message ?? 'Failed to load inquiries');
    } finally {
      setInquiriesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWatches();
    fetchInquiries();
  }, [fetchWatches, fetchInquiries]);

  // -------------------------------------------------------------------------
  // Watch status change
  // -------------------------------------------------------------------------
  const handleWatchStatusChange = async (slug: string, newStatus: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/watches/${slug}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      setWatches((prev) =>
        prev.map((w) => (w.slug === slug ? { ...w, status: newStatus } : w))
      );
    } catch {
      alert('Failed to update watch status. Please try again.');
    }
  };

  // -------------------------------------------------------------------------
  // Inquiry status change (CRM progression)
  // -------------------------------------------------------------------------
  const handleInquiryStatusChange = async (id: string, newStatus: string) => {
    try {
      const body: Record<string, any> = { status: newStatus };
      // When marking as CONTACTED or FOLLOW_UP, update lastContactedAt
      if (newStatus === 'CONTACTED' || newStatus === 'FOLLOW_UP') {
        body.lastContactedAt = new Date().toISOString();
      }
      const res = await fetch(`${API_BASE_URL}/inquiries/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed to update status');
      setInquiries((prev) =>
        prev.map((inq) => (inq.id === id ? { ...inq, ...body } : inq))
      );
    } catch {
      alert('Failed to update inquiry status. Please try again.');
    }
  };

  // -------------------------------------------------------------------------
  // CRM Notes
  // -------------------------------------------------------------------------
  const handleCrmNoteChange = (id: string, note: string) => {
    setCrmNotes((prev) => ({ ...prev, [id]: note }));
    localStorage.setItem(`manila-crm-notes-${id}`, note);
  };

  // -------------------------------------------------------------------------
  // Delete watch
  // -------------------------------------------------------------------------
  const handleDelete = async (id: string, slug: string) => {
    if (!confirm('Are you sure you want to delete this watch?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/watches/${slug}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Delete failed');
      setWatches((prev) => prev.filter((w) => w.id !== id));
      setSelectedWatches((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch {
      alert('Failed to delete watch. Please try again.');
    }
  };

  // -------------------------------------------------------------------------
  // Bulk Actions
  // -------------------------------------------------------------------------
  const toggleWatchSelection = (id: string) => {
    setSelectedWatches((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedWatches.size === filteredWatches.length) {
      setSelectedWatches(new Set());
    } else {
      setSelectedWatches(new Set(filteredWatches.map((w) => w.id)));
    }
  };

  const handleBulkStatusChange = async (newStatus: string) => {
    if (selectedWatches.size === 0) return;
    const label = newStatus === 'SOLD' ? 'SOLD' : 'RESERVED';
    if (!confirm(`Mark ${selectedWatches.size} watch(es) as ${label}?`)) return;

    setBulkActionLoading(true);
    try {
      const selectedArr = watches.filter((w) => selectedWatches.has(w.id));
      await Promise.all(
        selectedArr.map((w) =>
          fetch(`${API_BASE_URL}/watches/${w.slug}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ status: newStatus }),
          })
        )
      );
      setWatches((prev) =>
        prev.map((w) => (selectedWatches.has(w.id) ? { ...w, status: newStatus } : w))
      );
      setSelectedWatches(new Set());
    } catch {
      alert('Some bulk status updates failed. Please refresh and try again.');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedWatches.size === 0) return;
    if (!confirm(`Delete ${selectedWatches.size} watch(es)? This cannot be undone.`)) return;

    setBulkActionLoading(true);
    try {
      const selectedArr = watches.filter((w) => selectedWatches.has(w.id));
      await Promise.all(
        selectedArr.map((w) =>
          fetch(`${API_BASE_URL}/watches/${w.slug}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
          })
        )
      );
      setWatches((prev) => prev.filter((w) => !selectedWatches.has(w.id)));
      setSelectedWatches(new Set());
    } catch {
      alert('Some deletions failed. Please refresh and try again.');
    } finally {
      setBulkActionLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // Populate edit form when editingWatch changes
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (editingWatch) {
      const boxPapers = editingWatch.boxPapers ?? '';
      setEditFormData({
        brand: editingWatch.brand ?? '',
        model: editingWatch.model ?? '',
        name: editingWatch.name ?? '',
        reference: editingWatch.reference ?? '',
        price_php: String(editingWatch.pricePHP ?? editingWatch.price_php ?? ''),
        condition: editingWatch.condition ?? 'excellent',
        category: editingWatch.category ?? 'Sport',
        tier: editingWatch.tier ?? 'A',
        box: editingWatch.box ?? (boxPapers === 'Full Set' || boxPapers === 'Box Only'),
        papers: editingWatch.papers ?? (boxPapers === 'Full Set' || boxPapers === 'Papers Only'),
        description: editingWatch.description ?? '',
      });
      setEditExistingImages(editingWatch.images ?? []);
      setEditImageFiles([]);
      setEditImagePreviews([]);
      setEditError(null);
      setDraggedImageIndex(null);
    }
  }, [editingWatch]);

  // -------------------------------------------------------------------------
  // Image handling helpers
  // -------------------------------------------------------------------------
  const handleImageSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFiles: React.Dispatch<React.SetStateAction<File[]>>,
    setPreviews: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    const files = Array.from(e.target.files ?? []);
    setFiles((prev) => [...prev, ...files]);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeNewImage = (
    index: number,
    setFiles: React.Dispatch<React.SetStateAction<File[]>>,
    setPreviews: React.Dispatch<React.SetStateAction<string[]>>,
    previews: string[],
  ) => {
    URL.revokeObjectURL(previews[index]);
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setEditExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  // -------------------------------------------------------------------------
  // Image drag-and-drop reorder (existing images in edit modal)
  // -------------------------------------------------------------------------
  const handleImageDragStart = (index: number) => {
    setDraggedImageIndex(index);
  };

  const handleImageDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleImageDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedImageIndex === null || draggedImageIndex === dropIndex) return;

    setEditExistingImages((prev) => {
      const updated = [...prev];
      const [draggedItem] = updated.splice(draggedImageIndex, 1);
      updated.splice(dropIndex, 0, draggedItem);
      return updated;
    });
    setDraggedImageIndex(null);
  };

  const handleImageDragEnd = () => {
    setDraggedImageIndex(null);
  };

  // -------------------------------------------------------------------------
  // Upload images helper
  // -------------------------------------------------------------------------
  const uploadImages = async (files: File[]): Promise<string[]> => {
    if (files.length === 0) return [];
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    const token = localStorage.getItem('admin_token');
    const res = await fetch(`${API_BASE_URL}/upload-image`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!res.ok) throw new Error('Image upload failed');
    const data = await res.json();
    return data.urls ?? [];
  };

  // -------------------------------------------------------------------------
  // Compute boxPapers string from booleans
  // -------------------------------------------------------------------------
  const computeBoxPapers = (box: boolean, papers: boolean): string => {
    if (box && papers) return 'Full Set';
    if (box) return 'Box Only';
    if (papers) return 'Papers Only';
    return 'None';
  };

  // -------------------------------------------------------------------------
  // Add Watch submit
  // -------------------------------------------------------------------------
  const handleAddWatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddSubmitting(true);
    setAddError(null);

    try {
      // Upload images first
      const uploadedUrls = await uploadImages(addImageFiles);

      const slug = `${addFormData.brand}-${addFormData.model}`.toLowerCase().replace(/\s+/g, '-');
      const id = `watch-${Date.now()}`;

      const payload = {
        id,
        slug,
        brand: addFormData.brand,
        model: addFormData.model,
        reference: addFormData.reference,
        pricePHP: parseInt(addFormData.price_php) || 0,
        condition: addFormData.condition,
        category: addFormData.category,
        tier: addFormData.tier,
        boxPapers: computeBoxPapers(addFormData.box, addFormData.papers),
        description: addFormData.description,
        images: uploadedUrls,
        status: 'AVAILABLE',
        availability: 'in_stock',
      };

      const res = await fetch(`${API_BASE_URL}/watches`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error ?? `Failed to create watch (${res.status})`);
      }

      // Cleanup previews
      addImagePreviews.forEach((url) => URL.revokeObjectURL(url));

      // Reset form and close
      setAddFormData({ ...emptyFormData });
      setAddImageFiles([]);
      setAddImagePreviews([]);
      setShowAddModal(false);

      // Refresh list
      await fetchWatches();
    } catch (err: any) {
      setAddError(err.message ?? 'Failed to add watch');
    } finally {
      setAddSubmitting(false);
    }
  };

  // -------------------------------------------------------------------------
  // Edit Watch submit
  // -------------------------------------------------------------------------
  const handleEditWatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWatch) return;
    setEditSubmitting(true);
    setEditError(null);

    try {
      // Upload any new images
      const newUploadedUrls = await uploadImages(editImageFiles);
      const allImages = [...editExistingImages, ...newUploadedUrls];

      const payload: Record<string, any> = {
        brand: editFormData.brand,
        model: editFormData.model,
        reference: editFormData.reference,
        pricePHP: parseInt(editFormData.price_php) || 0,
        condition: editFormData.condition,
        category: editFormData.category,
        tier: editFormData.tier,
        boxPapers: computeBoxPapers(editFormData.box, editFormData.papers),
        description: editFormData.description,
        images: allImages,
      };

      const res = await fetch(`${API_BASE_URL}/watches/${editingWatch.slug}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error ?? `Failed to update watch (${res.status})`);
      }

      // Cleanup previews
      editImagePreviews.forEach((url) => URL.revokeObjectURL(url));

      // Close modal and refresh
      setEditingWatch(null);
      await fetchWatches();
    } catch (err: any) {
      setEditError(err.message ?? 'Failed to update watch');
    } finally {
      setEditSubmitting(false);
    }
  };

  // -------------------------------------------------------------------------
  // Logout
  // -------------------------------------------------------------------------
  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  // -------------------------------------------------------------------------
  // Computed values
  // -------------------------------------------------------------------------
  const totalWatches = watches.length;
  const totalValue = watches.reduce((sum, w) => sum + (w.pricePHP ?? w.price_php ?? 0), 0);
  const newInquiriesCount = inquiries.filter((i) => i.status === 'NEW').length;
  const mostViewedWatch = watches.length
    ? watches.reduce((best, w) => ((w.viewCount ?? 0) > (best.viewCount ?? 0) ? w : best), watches[0])
    : null;

  // Filtered watches
  const filteredWatches = watches.filter((watch) => {
    const matchesSearch =
      watch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      watch.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      watch.reference.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBrand = filterBrand === 'All' || watch.brand === filterBrand;
    const matchesTier = filterTier === 'All' || watch.tier === filterTier;
    return matchesSearch && matchesBrand && matchesTier;
  });

  const brands = ['All', ...Array.from(new Set(watches.map((w) => w.brand)))];
  const tiers = ['All', 'A', 'B', 'C'];

  // Filtered inquiries
  const filteredInquiries = inquiries.filter((inq) =>
    inquiryFilter === 'ALL' ? true : inq.status === inquiryFilter
  );

  // Analytics data
  const storedViews = getStoredViews();
  const totalViews = storedViews.length + watches.reduce((sum, w) => sum + (w.viewCount || 0), 0);
  const topViewedWatches = getTopViewedWatches(watches, storedViews);
  const conversionRate = totalViews > 0 ? ((inquiries.length / totalViews) * 100).toFixed(1) : '0.0';
  const inquiriesByDay = getInquiriesByDay(inquiries);
  const maxDailyInquiries = Math.max(...inquiriesByDay.map((d) => d.count), 1);

  // -------------------------------------------------------------------------
  // Badge helpers
  // -------------------------------------------------------------------------
  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      AVAILABLE: 'bg-green-100 text-green-800',
      RESERVED: 'bg-yellow-100 text-yellow-800',
      SOLD: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[status] ?? 'bg-neutral-100 text-neutral-900'}`}>
        {status}
      </span>
    );
  };

  const getInquiryBadge = (status: string) => {
    const map: Record<string, string> = {
      NEW: 'bg-blue-100 text-blue-800',
      CONTACTED: 'bg-yellow-100 text-yellow-800',
      FOLLOW_UP: 'bg-orange-100 text-orange-800',
      CLOSED: 'bg-green-100 text-green-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[status] ?? 'bg-neutral-100 text-neutral-900'}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const getTierBadge = (tier: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      A: { label: 'In Stock', color: 'bg-green-100 text-green-800' },
      B: { label: 'Incoming', color: 'bg-blue-100 text-blue-800' },
      C: { label: 'Sourcing', color: 'bg-yellow-100 text-yellow-800' },
    };
    const badge = badges[tier] ?? badges.A;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        Tier {tier}: {badge.label}
      </span>
    );
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      {/* Header */}
      <header className="border-b sticky top-0 z-10" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Manila Watch Atelier</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>Admin Dashboard</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{user?.name}</p>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{user?.email}</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors hover:opacity-80"
                style={{ color: 'var(--muted-foreground)' }}
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl p-6 shadow-sm border"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Total Watches</p>
                <p className="text-3xl font-bold mt-2" style={{ color: 'var(--card-foreground)' }}>{totalWatches}</p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(59,130,246,0.15)' }}>
                <Package className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl p-6 shadow-sm border"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Inventory Value</p>
                <p className="text-3xl font-bold mt-2" style={{ color: 'var(--card-foreground)' }}>
                  {totalValue >= 1_000_000
                    ? `₱${(totalValue / 1_000_000).toFixed(1)}M`
                    : `₱${totalValue.toLocaleString()}`}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(34,197,94,0.15)' }}>
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl p-6 shadow-sm border"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>New Inquiries</p>
                <p className="text-3xl font-bold mt-2" style={{ color: 'var(--card-foreground)' }}>{newInquiriesCount}</p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(168,85,247,0.15)' }}>
                <MessageSquare className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl p-6 shadow-sm border"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Most Viewed</p>
                <p className="text-lg font-bold mt-1 truncate max-w-[160px]" style={{ color: 'var(--card-foreground)' }} title={mostViewedWatch?.name}>
                  {mostViewedWatch?.name ?? '—'}
                </p>
                {mostViewedWatch && (
                  <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: 'var(--muted-foreground)' }}>
                    <Eye className="w-3 h-3" />
                    {mostViewedWatch.viewCount?.toLocaleString() ?? 0} views
                  </p>
                )}
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(212,175,55,0.15)' }}>
                <TrendingUp className="w-6 h-6 text-[#D4AF37]" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 rounded-xl p-1 shadow-sm border w-fit" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <button
            type="button"
            onClick={() => setActiveTab('watches')}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'watches'
                ? 'bg-[#D4AF37] text-black'
                : 'hover:opacity-80'
            }`}
            style={activeTab !== 'watches' ? { color: 'var(--muted-foreground)' } : {}}
          >
            <span className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Watches
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('inquiries')}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'inquiries'
                ? 'bg-[#D4AF37] text-black'
                : 'hover:opacity-80'
            }`}
            style={activeTab !== 'inquiries' ? { color: 'var(--muted-foreground)' } : {}}
          >
            <span className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Inquiries
              {newInquiriesCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {newInquiriesCount}
                </span>
              )}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'analytics'
                ? 'bg-[#D4AF37] text-black'
                : 'hover:opacity-80'
            }`}
            style={activeTab !== 'analytics' ? { color: 'var(--muted-foreground)' } : {}}
          >
            <span className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </span>
          </button>
        </div>

        {/* ================================================================ */}
        {/* ANALYTICS TAB                                                    */}
        {/* ================================================================ */}
        {activeTab === 'analytics' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Total Views Card */}
              <div className="rounded-xl p-6 shadow-sm border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Total Views</h3>
                  <Eye className="w-5 h-5 text-neutral-400" />
                </div>
                <p className="text-3xl font-bold text-neutral-900">{totalViews.toLocaleString()}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Across all watch pages
                </p>
              </div>

              {/* Inquiry Conversion Rate */}
              <div className="rounded-xl p-6 shadow-sm border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Inquiry Conversion Rate</h3>
                  <TrendingUp className="w-5 h-5 text-neutral-400" />
                </div>
                <p className="text-3xl font-bold text-neutral-900">{conversionRate}%</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  {inquiries.length} inquiries / {totalViews} views
                </p>
              </div>

              {/* Total Inquiries */}
              <div className="rounded-xl p-6 shadow-sm border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Total Inquiries</h3>
                  <MessageSquare className="w-5 h-5 text-neutral-400" />
                </div>
                <p className="text-3xl font-bold text-neutral-900">{inquiries.length}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  {newInquiriesCount} new, {inquiries.filter((i) => i.status === 'CONTACTED').length} contacted
                </p>
              </div>
            </div>

            {/* Top Viewed Watches - Inline Bar Chart */}
            <div className="rounded-xl p-6 shadow-sm border mb-6" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#D4AF37]" />
                Top Viewed Watches
              </h3>
              {topViewedWatches.length === 0 ? (
                <p className="text-sm text-neutral-500 dark:text-neutral-400">No view data available yet.</p>
              ) : (
                <div className="space-y-3">
                  {topViewedWatches.map((item, idx) => {
                    const maxCount = topViewedWatches[0]?.count || 1;
                    const barWidth = maxCount > 0 ? Math.max((item.count / maxCount) * 100, 4) : 4;
                    return (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-6 text-xs font-medium text-neutral-400 text-right flex-shrink-0">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-neutral-900 truncate mr-2">
                              {item.name}
                            </span>
                            <span className="text-xs text-neutral-500 dark:text-neutral-400 flex-shrink-0">
                              {item.count} views
                            </span>
                          </div>
                          <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-2.5">
                            <div
                              className="h-2.5 rounded-full transition-all duration-500"
                              style={{
                                width: `${barWidth}%`,
                                backgroundColor: '#D4AF37',
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Inquiries Over Time - Last 7 Days */}
            <div className="rounded-xl p-6 shadow-sm border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#D4AF37]" />
                Inquiries - Last 7 Days
              </h3>
              <div className="flex items-end gap-2 h-40">
                {inquiriesByDay.map((day, idx) => {
                  const barHeight = maxDailyInquiries > 0
                    ? Math.max((day.count / maxDailyInquiries) * 100, 4)
                    : 4;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                        {day.count}
                      </span>
                      <div className="w-full flex items-end justify-center" style={{ height: '120px' }}>
                        <div
                          className="w-full max-w-[40px] rounded-t transition-all duration-500"
                          style={{
                            height: `${barHeight}%`,
                            backgroundColor: day.count > 0 ? '#D4AF37' : '#e5e5e5',
                          }}
                        />
                      </div>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                        {day.date}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* ================================================================ */}
        {/* WATCHES TAB                                                      */}
        {/* ================================================================ */}
        {activeTab === 'watches' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
            {/* Filters and Actions */}
            <div className="rounded-xl p-6 shadow-sm border mb-6" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
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
                      className="w-full pl-11 pr-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-400 focus:border-transparent"
                    />
                  </div>

                  {/* Brand Filter */}
                  <select
                    value={filterBrand}
                    onChange={(e) => setFilterBrand(e.target.value)}
                    aria-label="Filter by brand"
                    className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-400 focus:border-transparent"
                  >
                    {brands.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>

                  {/* Tier Filter */}
                  <select
                    value={filterTier}
                    onChange={(e) => setFilterTier(e.target.value)}
                    aria-label="Filter by tier"
                    className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-400 focus:border-transparent"
                  >
                    {tiers.map((tier) => (
                      <option key={tier} value={tier}>
                        {tier === 'All' ? 'All Tiers' : `Tier ${tier}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => exportWatchesCSV(filteredWatches)}
                    className="flex items-center gap-2 px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg border border-neutral-300 dark:border-neutral-600 transition-colors"
                    title="Export watches as CSV"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline text-sm">Export</span>
                  </button>
                  <button
                    type="button"
                    onClick={fetchWatches}
                    className="flex items-center gap-2 px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg border border-neutral-300 dark:border-neutral-600 transition-colors"
                    title="Refresh"
                  >
                    <RefreshCw className={`w-4 h-4 ${watchesLoading ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAddFormData({ ...emptyFormData });
                      setAddImageFiles([]);
                      setAddImagePreviews([]);
                      setAddError(null);
                      setShowAddModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    Add Watch
                  </button>
                </div>
              </div>
            </div>

            {/* Bulk Action Bar */}
            <AnimatePresence>
              {selectedWatches.size > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-neutral-900 text-white rounded-xl p-4 mb-4 flex items-center justify-between flex-wrap gap-3"
                >
                  <div className="flex items-center gap-3">
                    <CheckSquare className="w-5 h-5 text-[#D4AF37]" />
                    <span className="text-sm font-medium">
                      {selectedWatches.size} watch{selectedWatches.size > 1 ? 'es' : ''} selected
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleBulkStatusChange('SOLD')}
                      disabled={bulkActionLoading}
                      className="px-3 py-1.5 text-xs font-medium bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Mark as SOLD
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBulkStatusChange('RESERVED')}
                      disabled={bulkActionLoading}
                      className="px-3 py-1.5 text-xs font-medium bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Mark as RESERVED
                    </button>
                    <button
                      type="button"
                      onClick={handleBulkDelete}
                      disabled={bulkActionLoading}
                      className="px-3 py-1.5 text-xs font-medium bg-red-800 hover:bg-red-900 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <span className="flex items-center gap-1">
                        <Trash2 className="w-3 h-3" />
                        Delete Selected
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedWatches(new Set())}
                      className="px-3 py-1.5 text-xs font-medium bg-neutral-700 hover:bg-neutral-600 rounded-lg transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error state */}
            {watchesError && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{watchesError}</p>
                <button type="button" onClick={fetchWatches} className="ml-auto text-sm font-medium underline">
                  Retry
                </button>
              </div>
            )}

            {/* Loading state */}
            {watchesLoading && !watchesError && (
              <div className="rounded-xl shadow-sm border p-12 text-center" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <RefreshCw className="w-8 h-8 text-neutral-400 mx-auto mb-3 animate-spin" />
                <p className="text-neutral-600 dark:text-neutral-400">Loading watches...</p>
              </div>
            )}

            {/* Watches Table */}
            {!watchesLoading && !watchesError && (
              <div className="rounded-xl shadow-sm border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
                      <tr>
                        <th className="px-4 py-3 text-left">
                          <button
                            type="button"
                            onClick={toggleSelectAll}
                            className="p-1 hover:bg-neutral-200 rounded transition-colors"
                            title={selectedWatches.size === filteredWatches.length ? 'Deselect all' : 'Select all'}
                          >
                            {selectedWatches.size === filteredWatches.length && filteredWatches.length > 0 ? (
                              <CheckSquare className="w-4 h-4 text-neutral-700" />
                            ) : (
                              <Square className="w-4 h-4 text-neutral-400" />
                            )}
                          </button>
                        </th>
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                      {filteredWatches.map((watch, index) => (
                        <motion.tr
                          key={watch.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.03 }}
                          className={`hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors ${
                            selectedWatches.has(watch.id) ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''
                          }`}
                        >
                          <td className="px-4 py-4">
                            <button
                              type="button"
                              onClick={() => toggleWatchSelection(watch.id)}
                              className="p-1 hover:bg-neutral-200 rounded transition-colors"
                            >
                              {selectedWatches.has(watch.id) ? (
                                <CheckSquare className="w-4 h-4 text-neutral-700" />
                              ) : (
                                <Square className="w-4 h-4 text-neutral-400" />
                              )}
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={watch.images?.[0] ?? ''}
                                alt={watch.name}
                                className="w-16 h-16 object-cover rounded-lg bg-neutral-100"
                              />
                              <div>
                                <p className="font-medium text-neutral-900">{watch.name}</p>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">{watch.model}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-neutral-900">{watch.brand}</td>
                          <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">{watch.reference}</td>
                          <td className="px-6 py-4 text-sm font-medium text-neutral-900">
                            ₱{(watch.pricePHP ?? watch.price_php ?? 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4">{getTierBadge(watch.tier)}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {getStatusBadge(watch.status)}
                              <select
                                value={watch.status}
                                onChange={(e) => handleWatchStatusChange(watch.slug, e.target.value)}
                                aria-label={`Change status for ${watch.name}`}
                                className="text-xs border border-neutral-300 dark:border-neutral-600 rounded px-1.5 py-1 focus:ring-1 focus:ring-neutral-900 dark:focus:ring-neutral-400 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900"
                              >
                                <option value="AVAILABLE">AVAILABLE</option>
                                <option value="RESERVED">RESERVED</option>
                                <option value="SOLD">SOLD</option>
                              </select>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingWatch(watch)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(watch.id, watch.slug)}
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
                    <p className="text-neutral-600 dark:text-neutral-400">No watches found</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-1">Try adjusting your filters</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* ================================================================ */}
        {/* INQUIRIES TAB (Enhanced CRM)                                     */}
        {/* ================================================================ */}
        {activeTab === 'inquiries' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
            {/* Filters */}
            <div className="rounded-xl p-6 shadow-sm border mb-6" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex gap-2 flex-wrap">
                  {(['ALL', 'NEW', 'CONTACTED', 'FOLLOW_UP', 'CLOSED'] as InquiryFilter[]).map((status) => (
                    <button
                      type="button"
                      key={status}
                      onClick={() => setInquiryFilter(status)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        inquiryFilter === status
                          ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                      }`}
                    >
                      {status.replace('_', ' ')}
                      {status === 'NEW' && newInquiriesCount > 0 && (
                        <span className="ml-1.5 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                          {newInquiriesCount}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => exportInquiriesCSV(filteredInquiries)}
                    className="flex items-center gap-2 px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg border border-neutral-300 dark:border-neutral-600 transition-colors"
                    title="Export inquiries as CSV"
                  >
                    <Download className="w-4 h-4" />
                    <span className="text-sm">Export</span>
                  </button>
                  <button
                    type="button"
                    onClick={fetchInquiries}
                    className="flex items-center gap-2 px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg border border-neutral-300 dark:border-neutral-600 transition-colors"
                    title="Refresh"
                  >
                    <RefreshCw className={`w-4 h-4 ${inquiriesLoading ? 'animate-spin' : ''}`} />
                    <span className="text-sm">Refresh</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Error state */}
            {inquiriesError && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{inquiriesError}</p>
                <button type="button" onClick={fetchInquiries} className="ml-auto text-sm font-medium underline">
                  Retry
                </button>
              </div>
            )}

            {/* Loading state */}
            {inquiriesLoading && !inquiriesError && (
              <div className="rounded-xl shadow-sm border p-12 text-center" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <RefreshCw className="w-8 h-8 text-neutral-400 mx-auto mb-3 animate-spin" />
                <p className="text-neutral-600 dark:text-neutral-400">Loading inquiries...</p>
              </div>
            )}

            {/* Inquiries Table */}
            {!inquiriesLoading && !inquiriesError && (
              <div className="rounded-xl shadow-sm border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Phone
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Watch
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Details
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                      {filteredInquiries.map((inquiry, index) => (
                        <React.Fragment key={inquiry.id}>
                          <motion.tr
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.03 }}
                            className="hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                          >
                            <td className="px-6 py-4 text-sm font-medium text-neutral-900">{inquiry.name}</td>
                            <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                              <a href={`mailto:${inquiry.email}`} className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5" />
                                {inquiry.email}
                              </a>
                            </td>
                            <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                              {inquiry.phone ? (
                                <span className="flex items-center gap-1.5">
                                  <Phone className="w-3.5 h-3.5" />
                                  {inquiry.phone}
                                </span>
                              ) : (
                                <span className="text-neutral-400">—</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-neutral-900">
                              {inquiry.watch ? (
                                <span>
                                  {inquiry.watch.brand} {inquiry.watch.model}
                                </span>
                              ) : (
                                <span className="text-neutral-400">General inquiry</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                {getInquiryBadge(inquiry.status)}
                                <select
                                  value={inquiry.status}
                                  onChange={(e) => handleInquiryStatusChange(inquiry.id, e.target.value)}
                                  aria-label={`Change status for inquiry from ${inquiry.name}`}
                                  className="text-xs border border-neutral-300 dark:border-neutral-600 rounded px-1.5 py-1 focus:ring-1 focus:ring-neutral-900 dark:focus:ring-neutral-400 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900"
                                >
                                  <option value="NEW">NEW</option>
                                  <option value="CONTACTED">CONTACTED</option>
                                  <option value="FOLLOW_UP">FOLLOW UP</option>
                                  <option value="CLOSED">CLOSED</option>
                                </select>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                              <span className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                {new Date(inquiry.createdAt).toLocaleDateString('en-PH', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedInquiry(expandedInquiry === inquiry.id ? null : inquiry.id)
                                }
                                className="p-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                                title="Toggle details"
                              >
                                {expandedInquiry === inquiry.id ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </button>
                            </td>
                          </motion.tr>

                          {/* Expanded detail row with CRM features */}
                          <AnimatePresence>
                            {expandedInquiry === inquiry.id && (
                              <motion.tr
                                key={`${inquiry.id}-detail`}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-neutral-50 dark:bg-neutral-800/50"
                              >
                                <td colSpan={7} className="px-6 py-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Message */}
                                    <div>
                                      <h4 className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                                        Message
                                      </h4>
                                      <p className="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap p-4 rounded-lg border" style={{ backgroundColor: 'var(--secondary)', borderColor: 'var(--border)' }}>
                                        {inquiry.message || 'No message provided.'}
                                      </p>
                                    </div>

                                    {/* Watch details */}
                                    {inquiry.watch && (
                                      <div>
                                        <h4 className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                                          Watch Details
                                        </h4>
                                        <div className="flex gap-4 p-4 rounded-lg border" style={{ backgroundColor: 'var(--secondary)', borderColor: 'var(--border)' }}>
                                          {inquiry.watch.images?.[0] && (
                                            <img
                                              src={inquiry.watch.images[0]}
                                              alt={`${inquiry.watch.brand} ${inquiry.watch.model}`}
                                              className="w-20 h-20 object-cover rounded-lg bg-neutral-100 dark:bg-neutral-700"
                                            />
                                          )}
                                          <div>
                                            <p className="font-medium text-neutral-900">
                                              {inquiry.watch.brand} {inquiry.watch.model}
                                            </p>
                                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                                              Ref: {inquiry.watch.reference}
                                            </p>
                                            <p className="text-sm font-medium text-neutral-900 mt-1">
                                              ₱{inquiry.watch.pricePHP?.toLocaleString() ?? '—'}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {/* CRM: Last Contacted */}
                                    <div>
                                      <h4 className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                                        Last Contacted
                                      </h4>
                                      <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--secondary)', borderColor: 'var(--border)' }}>
                                        {inquiry.lastContactedAt ? (
                                          <p className="text-sm text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                                            {new Date(inquiry.lastContactedAt).toLocaleString('en-PH', {
                                              year: 'numeric',
                                              month: 'short',
                                              day: 'numeric',
                                              hour: '2-digit',
                                              minute: '2-digit',
                                            })}
                                          </p>
                                        ) : (
                                          <p className="text-sm text-neutral-400">Not yet contacted</p>
                                        )}
                                        {/* Status progression buttons */}
                                        <div className="mt-3 flex flex-wrap gap-2">
                                          {(['NEW', 'CONTACTED', 'FOLLOW_UP', 'CLOSED'] as const).map((s) => (
                                            <button
                                              key={s}
                                              type="button"
                                              onClick={() => handleInquiryStatusChange(inquiry.id, s)}
                                              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                                                inquiry.status === s
                                                  ? 'bg-[#D4AF37] text-white'
                                                  : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                                              }`}
                                            >
                                              {s.replace('_', ' ')}
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    </div>

                                    {/* CRM: Notes */}
                                    <div>
                                      <h4 className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                                        CRM Notes
                                      </h4>
                                      <textarea
                                        value={crmNotes[inquiry.id] ?? ''}
                                        onChange={(e) => handleCrmNoteChange(inquiry.id, e.target.value)}
                                        rows={4}
                                        placeholder="Add notes about this customer..."
                                        className="w-full px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent resize-vertical bg-white dark:bg-neutral-800 text-neutral-900 placeholder:text-neutral-400"
                                      />
                                      <p className="text-xs text-neutral-400 mt-1">
                                        Notes are saved automatically to your browser
                                      </p>
                                    </div>
                                  </div>
                                </td>
                              </motion.tr>
                            )}
                          </AnimatePresence>
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredInquiries.length === 0 && (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                    <p className="text-neutral-600">No inquiries found</p>
                    <p className="text-sm text-neutral-500 mt-1">
                      {inquiryFilter !== 'ALL'
                        ? `No ${inquiryFilter.toLowerCase().replace('_', ' ')} inquiries. Try changing the filter.`
                        : 'No inquiries have been submitted yet.'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Edit Watch Modal */}
      <AnimatePresence>
        {editingWatch && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setEditingWatch(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              style={{ backgroundColor: 'var(--card)', color: 'var(--card-foreground)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 border-b px-6 py-4 rounded-t-2xl z-10" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold" style={{ color: 'var(--card-foreground)' }}>Edit Watch</h2>
                  <button
                    type="button"
                    onClick={() => setEditingWatch(null)}
                    className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                    title="Close modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleEditWatch} className="p-6 space-y-6">
                {editError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 flex items-center gap-2 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {editError}
                  </div>
                )}

                {/* Row 1: Brand + Model */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="edit-brand" className="block text-sm font-medium text-neutral-700 mb-1">Brand *</label>
                    <select
                      id="edit-brand"
                      value={editFormData.brand}
                      onChange={(e) => setEditFormData((prev) => ({ ...prev, brand: e.target.value }))}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                      required
                    >
                      <option value="Rolex">Rolex</option>
                      <option value="Patek Philippe">Patek Philippe</option>
                      <option value="Audemars Piguet">Audemars Piguet</option>
                      <option value="Cartier">Cartier</option>
                      <option value="Omega">Omega</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="edit-model" className="block text-sm font-medium text-neutral-700 mb-1">Model *</label>
                    <input
                      id="edit-model"
                      type="text"
                      value={editFormData.model}
                      onChange={(e) => setEditFormData((prev) => ({ ...prev, model: e.target.value }))}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                      placeholder="e.g. Submariner"
                      required
                    />
                  </div>
                </div>

                {/* Row 2: Name + Reference */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="edit-name" className="block text-sm font-medium text-neutral-700 mb-1">Name</label>
                    <input
                      id="edit-name"
                      type="text"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                      placeholder="Display name"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-reference" className="block text-sm font-medium text-neutral-700 mb-1">Reference</label>
                    <input
                      id="edit-reference"
                      type="text"
                      value={editFormData.reference}
                      onChange={(e) => setEditFormData((prev) => ({ ...prev, reference: e.target.value }))}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                      placeholder="e.g. 116610LN"
                    />
                  </div>
                </div>

                {/* Row 3: Price + Condition */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="edit-price" className="block text-sm font-medium text-neutral-700 mb-1">Price (PHP) *</label>
                    <input
                      id="edit-price"
                      type="number"
                      value={editFormData.price_php}
                      onChange={(e) => setEditFormData((prev) => ({ ...prev, price_php: e.target.value }))}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                      placeholder="e.g. 550000"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-condition" className="block text-sm font-medium text-neutral-700 mb-1">Condition</label>
                    <select
                      id="edit-condition"
                      value={editFormData.condition}
                      onChange={(e) => setEditFormData((prev) => ({ ...prev, condition: e.target.value }))}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                    >
                      <option value="Brand New">Brand New</option>
                      <option value="Unworn">Unworn</option>
                      <option value="excellent">Excellent</option>
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                    </select>
                  </div>
                </div>

                {/* Row 4: Category + Tier */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="edit-category" className="block text-sm font-medium text-neutral-700 mb-1">Category</label>
                    <select
                      id="edit-category"
                      value={editFormData.category}
                      onChange={(e) => setEditFormData((prev) => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                    >
                      <option value="Sport">Sport</option>
                      <option value="Luxury">Luxury</option>
                      <option value="Dress">Dress</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="edit-tier" className="block text-sm font-medium text-neutral-700 mb-1">Tier</label>
                    <select
                      id="edit-tier"
                      value={editFormData.tier}
                      onChange={(e) => setEditFormData((prev) => ({ ...prev, tier: e.target.value }))}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                    >
                      <option value="A">Tier A - In Stock</option>
                      <option value="B">Tier B - Incoming</option>
                      <option value="C">Tier C - Sourcing</option>
                    </select>
                  </div>
                </div>

                {/* Row 5: Box + Papers checkboxes */}
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editFormData.box}
                      onChange={(e) => setEditFormData((prev) => ({ ...prev, box: e.target.checked }))}
                      className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                    />
                    <span className="text-sm font-medium text-neutral-700">Box included</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editFormData.papers}
                      onChange={(e) => setEditFormData((prev) => ({ ...prev, papers: e.target.checked }))}
                      className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                    />
                    <span className="text-sm font-medium text-neutral-700">Papers included</span>
                  </label>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
                  <textarea
                    value={editFormData.description}
                    onChange={(e) => setEditFormData((prev) => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent resize-vertical"
                    placeholder="Watch description..."
                  />
                </div>

                {/* Images with drag-and-drop reorder */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Images
                    <span className="text-xs font-normal text-neutral-400 ml-2">Drag to reorder</span>
                  </label>

                  {/* Existing images - draggable */}
                  {editExistingImages.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-neutral-500 mb-2">Current images (drag to reorder, click X to remove)</p>
                      <div className="flex flex-wrap gap-3">
                        {editExistingImages.map((url, idx) => (
                          <div
                            key={`${url}-${idx}`}
                            draggable
                            onDragStart={() => handleImageDragStart(idx)}
                            onDragOver={(e) => handleImageDragOver(e, idx)}
                            onDrop={(e) => handleImageDrop(e, idx)}
                            onDragEnd={handleImageDragEnd}
                            className={`relative group cursor-grab active:cursor-grabbing transition-all ${
                              draggedImageIndex === idx ? 'opacity-40 scale-95' : 'opacity-100'
                            }`}
                          >
                            <div className="absolute top-1 left-1 z-10 bg-black/50 text-white rounded px-1 py-0.5 text-[10px] font-medium flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <GripVertical className="w-2.5 h-2.5" />
                              {idx + 1}
                            </div>
                            <img
                              src={url}
                              alt={`Watch image ${idx + 1}`}
                              className="w-20 h-20 object-cover rounded-lg border border-neutral-200"
                            />
                            <button
                              type="button"
                              onClick={() => removeExistingImage(idx)}
                              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Remove image"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* New image previews */}
                  {editImagePreviews.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-neutral-500 mb-2">New images to upload</p>
                      <div className="flex flex-wrap gap-3">
                        {editImagePreviews.map((url, idx) => (
                          <div key={url} className="relative group">
                            <img
                              src={url}
                              alt={`New image ${idx + 1}`}
                              className="w-20 h-20 object-cover rounded-lg border border-blue-200"
                            />
                            <button
                              type="button"
                              onClick={() => removeNewImage(idx, setEditImageFiles, setEditImagePreviews, editImagePreviews)}
                              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Remove image"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <input
                    ref={editFileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    aria-label="Upload watch images"
                    onChange={(e) => handleImageSelect(e, setEditImageFiles, setEditImagePreviews)}
                  />
                  <button
                    type="button"
                    onClick={() => editFileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 border border-dashed border-neutral-300 rounded-lg text-sm text-neutral-600 hover:border-neutral-400 hover:bg-neutral-50 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Add images
                  </button>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2 border-t border-neutral-200">
                  <button
                    type="submit"
                    disabled={editSubmitting}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingWatch(null)}
                    disabled={editSubmitting}
                    className="px-6 py-3 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Watch Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              style={{ backgroundColor: 'var(--card)', color: 'var(--card-foreground)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 border-b px-6 py-4 rounded-t-2xl z-10" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold" style={{ color: 'var(--card-foreground)' }}>Add New Watch</h2>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                    title="Close modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleAddWatch} className="p-6 space-y-6">
                {addError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 flex items-center gap-2 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {addError}
                  </div>
                )}

                {/* Row 1: Brand + Model */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="add-brand" className="block text-sm font-medium text-neutral-700 mb-1">Brand *</label>
                    <select
                      id="add-brand"
                      value={addFormData.brand}
                      onChange={(e) => setAddFormData((prev) => ({ ...prev, brand: e.target.value }))}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                      required
                    >
                      <option value="Rolex">Rolex</option>
                      <option value="Patek Philippe">Patek Philippe</option>
                      <option value="Audemars Piguet">Audemars Piguet</option>
                      <option value="Cartier">Cartier</option>
                      <option value="Omega">Omega</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="add-model" className="block text-sm font-medium text-neutral-700 mb-1">Model *</label>
                    <input
                      id="add-model"
                      type="text"
                      value={addFormData.model}
                      onChange={(e) => setAddFormData((prev) => ({ ...prev, model: e.target.value }))}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                      placeholder="e.g. Submariner"
                      required
                    />
                  </div>
                </div>

                {/* Row 2: Name + Reference */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="add-name" className="block text-sm font-medium text-neutral-700 mb-1">Name</label>
                    <input
                      id="add-name"
                      type="text"
                      value={addFormData.name}
                      onChange={(e) => setAddFormData((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                      placeholder="Display name"
                    />
                  </div>
                  <div>
                    <label htmlFor="add-reference" className="block text-sm font-medium text-neutral-700 mb-1">Reference</label>
                    <input
                      id="add-reference"
                      type="text"
                      value={addFormData.reference}
                      onChange={(e) => setAddFormData((prev) => ({ ...prev, reference: e.target.value }))}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                      placeholder="e.g. 116610LN"
                    />
                  </div>
                </div>

                {/* Row 3: Price + Condition */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="add-price" className="block text-sm font-medium text-neutral-700 mb-1">Price (PHP) *</label>
                    <input
                      id="add-price"
                      type="number"
                      value={addFormData.price_php}
                      onChange={(e) => setAddFormData((prev) => ({ ...prev, price_php: e.target.value }))}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                      placeholder="e.g. 550000"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="add-condition" className="block text-sm font-medium text-neutral-700 mb-1">Condition</label>
                    <select
                      id="add-condition"
                      value={addFormData.condition}
                      onChange={(e) => setAddFormData((prev) => ({ ...prev, condition: e.target.value }))}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                    >
                      <option value="Brand New">Brand New</option>
                      <option value="Unworn">Unworn</option>
                      <option value="excellent">Excellent</option>
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                    </select>
                  </div>
                </div>

                {/* Row 4: Category + Tier */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="add-category" className="block text-sm font-medium text-neutral-700 mb-1">Category</label>
                    <select
                      id="add-category"
                      value={addFormData.category}
                      onChange={(e) => setAddFormData((prev) => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                    >
                      <option value="Sport">Sport</option>
                      <option value="Luxury">Luxury</option>
                      <option value="Dress">Dress</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="add-tier" className="block text-sm font-medium text-neutral-700 mb-1">Tier</label>
                    <select
                      id="add-tier"
                      value={addFormData.tier}
                      onChange={(e) => setAddFormData((prev) => ({ ...prev, tier: e.target.value }))}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
                    >
                      <option value="A">Tier A - In Stock</option>
                      <option value="B">Tier B - Incoming</option>
                      <option value="C">Tier C - Sourcing</option>
                    </select>
                  </div>
                </div>

                {/* Row 5: Box + Papers checkboxes */}
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addFormData.box}
                      onChange={(e) => setAddFormData((prev) => ({ ...prev, box: e.target.checked }))}
                      className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                    />
                    <span className="text-sm font-medium text-neutral-700">Box included</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addFormData.papers}
                      onChange={(e) => setAddFormData((prev) => ({ ...prev, papers: e.target.checked }))}
                      className="w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                    />
                    <span className="text-sm font-medium text-neutral-700">Papers included</span>
                  </label>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="add-description" className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
                  <textarea
                    id="add-description"
                    value={addFormData.description}
                    onChange={(e) => setAddFormData((prev) => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent resize-vertical"
                    placeholder="Watch description..."
                  />
                </div>

                {/* Images */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Images</label>

                  {/* Image previews */}
                  {addImagePreviews.length > 0 && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-3">
                        {addImagePreviews.map((url, idx) => (
                          <div key={url} className="relative group">
                            <img
                              src={url}
                              alt={`Upload preview ${idx + 1}`}
                              className="w-20 h-20 object-cover rounded-lg border border-neutral-200"
                            />
                            <button
                              type="button"
                              onClick={() => removeNewImage(idx, setAddImageFiles, setAddImagePreviews, addImagePreviews)}
                              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Remove image"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <input
                    ref={addFileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    aria-label="Upload watch images"
                    onChange={(e) => handleImageSelect(e, setAddImageFiles, setAddImagePreviews)}
                  />
                  <button
                    type="button"
                    onClick={() => addFileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 border border-dashed border-neutral-300 rounded-lg text-sm text-neutral-600 hover:border-neutral-400 hover:bg-neutral-50 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    {addImagePreviews.length > 0 ? 'Add more images' : 'Upload images'}
                  </button>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2 border-t border-neutral-200">
                  <button
                    type="submit"
                    disabled={addSubmitting}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Adding Watch...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Add Watch
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    disabled={addSubmitting}
                    className="px-6 py-3 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
