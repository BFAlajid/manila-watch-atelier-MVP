import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import {
  Package, DollarSign, TrendingUp, MessageSquare, LogOut, Plus, Edit2, Trash2,
  Eye, Search, Filter, ChevronDown, ChevronUp, Mail, Phone, Clock,
  X, RefreshCw, AlertCircle, Upload, Image as ImageIcon, Save, Loader2,
  BarChart3, Download, CheckSquare, Square, GripVertical, FileText, Users,
  MessageCircle, ExternalLink, Bot, Sparkles
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
  source?: string; // FORM, AI_CHAT, WHATSAPP
  createdAt: string;
  lastContactedAt?: string;
  notes?: string;
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

type InquirySort = 'newest' | 'oldest' | 'status' | 'last_contacted';

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
  let str = String(value ?? '');
  // Neutralize CSV-injection formula triggers (=, +, -, @, tab, CR) by prefixing
  // a single quote so Excel/Sheets treat the cell as text, not a formula.
  if (/^[=+\-@\t\r]/.test(str)) {
    str = "'" + str;
  }
  if (/[,"\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function exportWatchesCSV(watches: Watch[]) {
  // Round-trip-friendly column set: includes slug so re-importing updates
  // existing rows instead of creating duplicates. Images joined with `|`.
  const headers = [
    'Slug', 'Brand', 'Model', 'Name', 'Reference', 'Price (PHP)',
    'Retail Price (PHP)', 'Condition', 'Box', 'Papers', 'Box Papers',
    'Tier', 'Category', 'Status', 'Featured', 'Year', 'Nickname',
    'Case Diameter', 'Case Material', 'Dial Color', 'Movement',
    'Caliber', 'Bracelet Type', 'Complications', 'Market Trend',
    'Annual Appreciation', 'Description', 'Images',
  ];
  const rows = watches.map((w) => {
    // Cast to access extended server fields not in the narrow client type.
    const ext = w as any;
    return [
      escapeCSV(w.slug),
      escapeCSV(w.brand),
      escapeCSV(w.model),
      escapeCSV(w.name),
      escapeCSV(w.reference),
      escapeCSV(w.pricePHP ?? w.price_php ?? 0),
      escapeCSV(ext.retailPricePHP ?? ''),
      escapeCSV(w.condition),
      escapeCSV(w.box ? 'true' : 'false'),
      escapeCSV(w.papers ? 'true' : 'false'),
      escapeCSV(w.boxPapers || 'Full Set'),
      escapeCSV(w.tier || 'A'),
      escapeCSV(w.category || 'Sport'),
      escapeCSV(w.status || 'AVAILABLE'),
      escapeCSV(ext.featured ? 'true' : 'false'),
      escapeCSV(ext.year ?? ''),
      escapeCSV(ext.nickname ?? ''),
      escapeCSV(ext.caseDiameter ?? ''),
      escapeCSV(ext.caseMaterial ?? ''),
      escapeCSV(ext.dialColor ?? ''),
      escapeCSV(ext.movement ?? ''),
      escapeCSV(ext.caliber ?? ''),
      escapeCSV(ext.braceletType ?? ''),
      escapeCSV(Array.isArray(ext.complications) ? ext.complications.join('|') : ''),
      escapeCSV(ext.marketTrend ?? 'STABLE'),
      escapeCSV(ext.annualAppreciation ?? 0),
      escapeCSV(w.description ?? ''),
      escapeCSV(Array.isArray(w.images) ? w.images.join('|') : ''),
    ].join(',');
  });
  const csv = [headers.join(','), ...rows].join('\n');
  downloadCSV(`watches-export-${new Date().toISOString().slice(0, 10)}.csv`, csv);
}

// ---------------------------------------------------------------------------
// CSV Import helpers — round-trip with exportWatchesCSV above.
// ---------------------------------------------------------------------------
function parseCSV(text: string): string[][] {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1); // strip BOM
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else { inQuotes = false; }
      } else field += c;
    } else {
      if (c === ',') { row.push(field); field = ''; }
      else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
      else if (c === '\r') { /* skip */ }
      else if (c === '"' && field === '') inQuotes = true;
      else field += c;
    }
  }
  if (field !== '' || row.length > 0) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((v) => v.length > 0));
}

function canonicalizeHeader(h: string): string {
  const key = h.trim().toLowerCase().replace(/\s+/g, '_').replace(/[()]/g, '').replace(/^_+|_+$/g, '');
  const map: Record<string, string> = {
    slug: 'slug', brand: 'brand', model: 'model', name: 'name', reference: 'reference',
    price_php: 'pricePHP', pricephp: 'pricePHP', price: 'pricePHP',
    retail_price_php: 'retailPricePHP', retailpricephp: 'retailPricePHP', retail_price: 'retailPricePHP',
    condition: 'condition', box: 'box', papers: 'papers',
    box_papers: 'boxPapers', boxpapers: 'boxPapers',
    tier: 'tier', category: 'category', status: 'status', featured: 'featured',
    year: 'year', nickname: 'nickname', availability: 'availability',
    case_diameter: 'caseDiameter', casediameter: 'caseDiameter',
    case_material: 'caseMaterial', casematerial: 'caseMaterial',
    dial_color: 'dialColor', dialcolor: 'dialColor',
    movement: 'movement', caliber: 'caliber',
    bracelet_type: 'braceletType', bracelettype: 'braceletType',
    complications: 'complications',
    market_trend: 'marketTrend', markettrend: 'marketTrend',
    annual_appreciation: 'annualAppreciation', annualappreciation: 'annualAppreciation',
    description: 'description', images: 'images',
  };
  return map[key] || '';
}

function coerceField(key: string, value: string): any {
  if (!value) return undefined;
  if (['box', 'papers', 'featured'].includes(key)) {
    return ['true', 'yes', '1', 'y'].includes(value.toLowerCase());
  }
  if (['pricePHP', 'retailPricePHP', 'year', 'caseDiameter', 'annualAppreciation'].includes(key)) {
    const n = parseFloat(value.replace(/[,₱$€£¥\s]/g, ''));
    return isNaN(n) ? undefined : n;
  }
  if (key === 'images' || key === 'complications') {
    return value.split(/[|;]/).map((s) => s.trim()).filter(Boolean);
  }
  return value;
}

function csvRowsToWatchObjects(rows: string[][]): any[] {
  if (rows.length < 2) return [];
  const headers = rows[0].map(canonicalizeHeader);
  return rows.slice(1).map((row) => {
    const obj: Record<string, any> = {};
    for (let i = 0; i < headers.length; i++) {
      const key = headers[i];
      if (!key) continue;
      const value = (row[i] ?? '').trim();
      const coerced = coerceField(key, value);
      if (coerced !== undefined) obj[key] = coerced;
    }
    // Auto-generate slug if missing so first-time imports from non-MWA
    // spreadsheets still work.
    if (!obj.slug && obj.brand && obj.model) {
      const base = `${obj.brand}-${obj.model}${obj.reference ? `-${obj.reference}` : ''}`;
      obj.slug = base.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    return obj;
  });
}

function exportInquiriesCSV(inquiries: Inquiry[]) {
  // Full-fidelity export so Sherard can move the data into a spreadsheet CRM
  // or share it with an accountant. ISO timestamps so re-import / sort works.
  const headers = [
    'ID', 'Name', 'Email', 'Phone', 'Message',
    'Watch Brand', 'Watch Model', 'Watch Reference', 'Watch Slug', 'Watch Price (PHP)',
    'Status', 'Source', 'Created At (ISO)', 'Last Contacted At (ISO)', 'Notes',
  ];
  const rows = inquiries.map((inq) => [
    escapeCSV(inq.id),
    escapeCSV(inq.name),
    escapeCSV(inq.email),
    escapeCSV(inq.phone),
    escapeCSV(inq.message),
    escapeCSV(inq.watch?.brand ?? ''),
    escapeCSV(inq.watch?.model ?? ''),
    escapeCSV(inq.watch?.reference ?? ''),
    escapeCSV(inq.watch?.slug ?? ''),
    escapeCSV(inq.watch?.pricePHP ?? ''),
    escapeCSV(inq.status),
    escapeCSV(inq.source ?? 'FORM'),
    escapeCSV(inq.createdAt ?? ''),
    escapeCSV(inq.lastContactedAt ?? ''),
    escapeCSV(inq.notes ?? ''),
  ].join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  downloadCSV(`inquiries-export-${new Date().toISOString().slice(0, 10)}.csv`, csv);
}

// ---------------------------------------------------------------------------
// Analytics helpers
// ---------------------------------------------------------------------------
// Local view counts are stored by WatchContext as Record<watchId, count>.
// This helper reads the same shape that incrementViewCount writes.
type LocalViewCounts = Record<string, number>;

function getStoredViews(): LocalViewCounts {
  try {
    const raw = localStorage.getItem('manila-watch-views');
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed as LocalViewCounts;
    return {};
  } catch {
    return {};
  }
}

function getTotalLocalViews(views: LocalViewCounts): number {
  return Object.values(views).reduce((sum, n) => sum + (typeof n === 'number' ? n : 0), 0);
}

function getTopViewedWatches(watches: Watch[], views: LocalViewCounts, limit = 8): { name: string; brand: string; count: number }[] {
  // Combine server-side viewCount with client-side local counts (keyed by watch id).
  const combined: { name: string; brand: string; count: number }[] = watches.map((w) => ({
    name: w.name || `${w.brand} ${w.model}`,
    brand: w.brand,
    count: (views[w.id] || 0) + (w.viewCount || 0),
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
  const importFileInputRef = useRef<HTMLInputElement>(null);

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
  const [inquirySearch, setInquirySearch] = useState('');
  const [inquirySort, setInquirySort] = useState<InquirySort>('newest');
  const [expandedInquiry, setExpandedInquiry] = useState<string | null>(null);
  const [selectedInquiries, setSelectedInquiries] = useState<Set<string>>(new Set());
  const [inquiryBulkLoading, setInquiryBulkLoading] = useState(false);

  // CRM notes — server-persisted per inquiry. Debounced save queue.
  const [crmNotes, setCrmNotes] = useState<Record<string, string>>({});
  const [savingNotes, setSavingNotes] = useState<Record<string, boolean>>({});
  // Per-inquiry save state: 'saved' (green), 'error' (red), or undefined (idle).
  // Shown alongside the notes textarea so admins know if their edit persisted.
  const [noteSaveState, setNoteSaveState] = useState<Record<string, 'saved' | 'error'>>({});
  const notesDebounceRef = useRef<Record<string, number>>({});

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

      // Hydrate notes from the inquiry objects (server-persisted).
      // Fall back to legacy localStorage entries if the server record is empty
      // — covers the transition from the old per-browser notes system.
      const notesMap: Record<string, string> = {};
      for (const inq of loaded) {
        if (inq.notes && inq.notes.length > 0) {
          notesMap[inq.id] = inq.notes;
        } else {
          const legacy = localStorage.getItem(`manila-crm-notes-${inq.id}`);
          if (legacy) notesMap[inq.id] = legacy;
        }
      }
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
    // Snapshot previous status so we can revert if the server rejects the change.
    const prevStatus = watches.find((w) => w.slug === slug)?.status;
    // Optimistic update for snappy UI.
    setWatches((prev) =>
      prev.map((w) => (w.slug === slug ? { ...w, status: newStatus } : w))
    );
    try {
      const res = await fetch(`${API_BASE_URL}/watches/${slug}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Failed to update status');
      }
      toast.success(`Marked as ${newStatus}`);
    } catch (err: any) {
      if (prevStatus !== undefined) {
        setWatches((prev) =>
          prev.map((w) => (w.slug === slug ? { ...w, status: prevStatus } : w))
        );
      }
      toast.error(err?.message || 'Failed to update watch status. Please try again.');
    }
  };

  // -------------------------------------------------------------------------
  // Inquiry status change (CRM progression)
  // -------------------------------------------------------------------------
  const handleInquiryStatusChange = async (id: string, newStatus: string) => {
    const prev = inquiries.find((i) => i.id === id);
    const body: Record<string, any> = { status: newStatus };
    if (newStatus === 'CONTACTED' || newStatus === 'FOLLOW_UP') {
      body.lastContactedAt = new Date().toISOString();
    }
    // Optimistic update — snapper for the admin.
    setInquiries((cur) => cur.map((inq) => (inq.id === id ? { ...inq, ...body } : inq)));
    try {
      const res = await fetch(`${API_BASE_URL}/inquiries/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Failed to update status');
      }
      toast.success(`Lead marked as ${newStatus.replace('_', ' ')}`);
    } catch (err: any) {
      // Revert: server rejected, so we shouldn't pretend the UI is in sync.
      if (prev) {
        setInquiries((cur) => cur.map((inq) => (inq.id === id ? prev : inq)));
      }
      toast.error(err?.message || 'Failed to update inquiry status. Please try again.');
    }
  };

  // -------------------------------------------------------------------------
  // Bulk inquiry actions — admin selects N inquiries, applies one status.
  // -------------------------------------------------------------------------
  const toggleInquirySelection = (id: string) => {
    setSelectedInquiries((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAllInquiries = () => {
    if (selectedInquiries.size === filteredInquiries.length) {
      setSelectedInquiries(new Set());
    } else {
      setSelectedInquiries(new Set(filteredInquiries.map((i) => i.id)));
    }
  };

  const handleBulkInquiryStatusChange = async (newStatus: 'CONTACTED' | 'FOLLOW_UP' | 'CLOSED') => {
    if (selectedInquiries.size === 0) return;
    if (!confirm(`Mark ${selectedInquiries.size} inquiry(ies) as ${newStatus.replace('_', ' ')}?`)) return;

    setInquiryBulkLoading(true);
    const selectedArr = inquiries.filter((i) => selectedInquiries.has(i.id));
    const body: Record<string, any> = { status: newStatus };
    if (newStatus === 'CONTACTED' || newStatus === 'FOLLOW_UP') {
      body.lastContactedAt = new Date().toISOString();
    }
    try {
      const results = await Promise.all(
        selectedArr.map((inq) =>
          fetch(`${API_BASE_URL}/inquiries/${inq.id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(body),
          }).then((r) => ({ id: inq.id, ok: r.ok }))
        )
      );
      const ok = results.filter((r) => r.ok).map((r) => r.id);
      const failed = results.length - ok.length;
      // Only mutate the successful rows so the UI tracks server truth.
      setInquiries((prev) =>
        prev.map((inq) => (ok.includes(inq.id) ? { ...inq, ...body } : inq))
      );
      setSelectedInquiries(new Set());
      if (failed > 0) {
        toast.warning(`${failed} of ${selectedArr.length} updates failed — refresh to verify.`);
      } else {
        toast.success(`${ok.length} inquiry(ies) marked ${newStatus.replace('_', ' ')}`);
      }
    } catch {
      toast.error('Bulk update failed. Please refresh and try again.');
    } finally {
      setInquiryBulkLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // CRM Notes — now server-persisted (syncs across admins/devices).
  // Debounced save: 600ms after the admin stops typing.
  // -------------------------------------------------------------------------
  const handleCrmNoteChange = (id: string, note: string) => {
    // Optimistic local update (and legacy localStorage as offline fallback).
    setCrmNotes((prev) => ({ ...prev, [id]: note }));
    localStorage.setItem(`manila-crm-notes-${id}`, note);
    // Clear any prior saved/error indicator — we're typing again.
    setNoteSaveState((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });

    // Debounce the server write so we don't fire on every keystroke.
    const existing = notesDebounceRef.current[id];
    if (existing) window.clearTimeout(existing);

    notesDebounceRef.current[id] = window.setTimeout(async () => {
      delete notesDebounceRef.current[id];
      setSavingNotes((prev) => ({ ...prev, [id]: true }));
      try {
        const res = await fetch(`${API_BASE_URL}/inquiries/${id}`, {
          method: 'PUT',
          headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify({ notes: note }),
        });
        if (!res.ok) throw new Error(`Save failed (${res.status})`);
        setInquiries((prev) => prev.map((inq) => (inq.id === id ? { ...inq, notes: note } : inq)));
        setNoteSaveState((prev) => ({ ...prev, [id]: 'saved' }));
        // Auto-clear the "Saved" pill after 2s so it doesn't linger.
        window.setTimeout(() => {
          setNoteSaveState((prev) => {
            if (prev[id] !== 'saved') return prev;
            const next = { ...prev };
            delete next[id];
            return next;
          });
        }, 2000);
      } catch (err) {
        console.error('[crm-notes] server save failed:', err);
        setNoteSaveState((prev) => ({ ...prev, [id]: 'error' }));
      } finally {
        setSavingNotes((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }
    }, 600);
  };

  // -------------------------------------------------------------------------
  // CRM quick-action helpers
  // -------------------------------------------------------------------------
  const getWhatsAppReplyLink = (inq: Inquiry): string | null => {
    const raw = (inq.phone || '').replace(/[^\d+]/g, '');
    if (!raw || raw.length < 8) return null;
    // Assume PH numbers without + prefix start with 09 → rewrite to 639
    const normalized = raw.startsWith('+')
      ? raw.slice(1)
      : raw.startsWith('0')
        ? '63' + raw.slice(1)
        : raw;
    const watchCtx = inq.watch ? ` about the ${inq.watch.brand} ${inq.watch.model} (Ref. ${inq.watch.reference})` : '';
    const msg = encodeURIComponent(
      `Hi ${inq.name.split(' ')[0]}, this is Sherard from Manila Watch Atelier${watchCtx}. Thanks for reaching out — happy to help.`
    );
    return `https://wa.me/${normalized}?text=${msg}`;
  };

  const getEmailReplyLink = (inq: Inquiry): string => {
    const watchCtx = inq.watch
      ? ` — ${inq.watch.brand} ${inq.watch.model} (Ref. ${inq.watch.reference})`
      : '';
    const subject = encodeURIComponent(`Re: Your inquiry${watchCtx}`);
    const body = encodeURIComponent(
      `Hi ${inq.name.split(' ')[0]},\n\nThanks for reaching out to Manila Watch Atelier. ` +
        `I'd be delighted to discuss${watchCtx ? ` the ${inq.watch?.brand} ${inq.watch?.model}` : ' your inquiry'} further.\n\n` +
        `Best,\nSherard W Ng`
    );
    return `mailto:${encodeURIComponent(inq.email)}?subject=${subject}&body=${body}`;
  };

  const getAgeString = (isoDate: string): string => {
    if (!isoDate) return '';
    const diffMs = Date.now() - new Date(isoDate).getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    if (hours < 1) return 'just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 14) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    return `${weeks}w ago`;
  };

  // -------------------------------------------------------------------------
  // Delete watch — implemented as a soft-delete (PUT status=SOLD) so the
  // piece stays in the archive for sales history. Uses PUT instead of DELETE
  // to avoid CDN / proxy / adblock blockers that reject DELETE verbs, and
  // because the server handler does the identical state change either way.
  // -------------------------------------------------------------------------
  const handleDelete = async (id: string, slug: string) => {
    if (!confirm('Mark this watch as SOLD? It will move to the archive — history is preserved.')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/watches/${slug}`, {
        method: 'PUT',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'SOLD' }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || `Request failed (${res.status})`);
      }
      setWatches((prev) => prev.filter((w) => w.id !== id));
      setSelectedWatches((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      toast.success('Watch marked as SOLD');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to mark watch as sold. Please try again.');
    }
  };

  // -------------------------------------------------------------------------
  // CSV Import handler
  // -------------------------------------------------------------------------
  const handleImportFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset so the same file can be re-selected after a fix.
    e.target.value = '';
    if (!file) return;

    try {
      const text = await file.text();
      const rows = parseCSV(text);
      if (rows.length < 2) {
        toast.error('CSV appears empty — expected a header row plus at least one data row.');
        return;
      }
      const watchObjects = csvRowsToWatchObjects(rows);
      if (watchObjects.length === 0) {
        toast.error('No valid rows found in CSV.');
        return;
      }
      if (!confirm(
        `Import ${watchObjects.length} row(s)?\n\n` +
        `Existing watches with a matching slug will be updated; ` +
        `new slugs will create fresh records. ` +
        `This action is logged in the audit trail.`
      )) return;

      setBulkActionLoading(true);
      const res = await fetch(`${API_BASE_URL}/watches/bulk-import`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ watches: watchObjects }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || `Import failed (${res.status})`);
      }
      const result = await res.json();

      await fetchWatches();

      const errorCount = result.errors?.length || 0;
      const summary = `Created ${result.created} · Updated ${result.updated}${errorCount ? ` · ${errorCount} error(s)` : ''}`;
      if (errorCount > 0) {
        const firstErr = result.errors[0];
        toast.warning(`Import complete — ${summary}`, {
          description: `First error: Row ${firstErr.row}${firstErr.slug ? ` (${firstErr.slug})` : ''}: ${firstErr.error}`,
          duration: 8000,
        });
      } else {
        toast.success(`Import complete — ${summary}`);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Import failed.');
    } finally {
      setBulkActionLoading(false);
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
      const results = await Promise.all(
        selectedArr.map((w) =>
          fetch(`${API_BASE_URL}/watches/${w.slug}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ status: newStatus }),
          })
        )
      );
      const failed = results.filter((r) => !r.ok).length;
      setWatches((prev) =>
        prev.map((w) => (selectedWatches.has(w.id) ? { ...w, status: newStatus } : w))
      );
      setSelectedWatches(new Set());
      if (failed > 0) {
        toast.warning(`${failed} of ${selectedArr.length} updates failed — refresh to see authoritative state.`);
      } else {
        toast.success(`${selectedArr.length} watch(es) marked ${label}`);
      }
    } catch {
      toast.error('Some bulk status updates failed. Please refresh and try again.');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedWatches.size === 0) return;
    if (!confirm(`Mark ${selectedWatches.size} watch(es) as SOLD? They move to the archive — history is preserved.`)) return;

    setBulkActionLoading(true);
    try {
      const selectedArr = watches.filter((w) => selectedWatches.has(w.id));
      const results = await Promise.all(
        selectedArr.map((w) =>
          fetch(`${API_BASE_URL}/watches/${w.slug}`, {
            method: 'PUT',
            headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'SOLD' }),
          })
        )
      );
      const failed = results.filter((r) => !r.ok).length;
      if (failed > 0) {
        toast.warning(`${failed} of ${selectedArr.length} could not be marked SOLD. Refresh and retry those.`);
      } else {
        toast.success(`${selectedArr.length} watch(es) marked SOLD`);
      }
      setWatches((prev) => prev.filter((w) => !selectedWatches.has(w.id)));
      setSelectedWatches(new Set());
    } catch {
      toast.error('Some deletions failed. Please refresh and try again.');
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

  // Filtered + searched + sorted inquiries
  const inquirySearchLower = inquirySearch.trim().toLowerCase();
  const filteredInquiries = inquiries
    .filter((inq) => (inquiryFilter === 'ALL' ? true : inq.status === inquiryFilter))
    .filter((inq) => {
      if (!inquirySearchLower) return true;
      return (
        inq.name.toLowerCase().includes(inquirySearchLower) ||
        inq.email.toLowerCase().includes(inquirySearchLower) ||
        (inq.phone ?? '').toLowerCase().includes(inquirySearchLower) ||
        (inq.message ?? '').toLowerCase().includes(inquirySearchLower) ||
        (inq.watch?.brand ?? '').toLowerCase().includes(inquirySearchLower) ||
        (inq.watch?.model ?? '').toLowerCase().includes(inquirySearchLower) ||
        (inq.watch?.reference ?? '').toLowerCase().includes(inquirySearchLower)
      );
    })
    .sort((a, b) => {
      switch (inquirySort) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'status': {
          // NEW first (urgent), then CONTACTED, FOLLOW_UP, CLOSED
          const order: Record<string, number> = { NEW: 0, CONTACTED: 1, FOLLOW_UP: 2, CLOSED: 3 };
          const diff = (order[a.status] ?? 99) - (order[b.status] ?? 99);
          if (diff !== 0) return diff;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        case 'last_contacted': {
          const aTs = a.lastContactedAt ? new Date(a.lastContactedAt).getTime() : 0;
          const bTs = b.lastContactedAt ? new Date(b.lastContactedAt).getTime() : 0;
          return bTs - aTs;
        }
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  // Analytics data
  const storedViews = getStoredViews();
  const totalViews = getTotalLocalViews(storedViews) + watches.reduce((sum, w) => sum + (w.viewCount || 0), 0);
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
                  <input
                    ref={importFileInputRef}
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={handleImportFileChange}
                  />
                  <button
                    type="button"
                    onClick={() => importFileInputRef.current?.click()}
                    disabled={bulkActionLoading}
                    className="flex items-center gap-2 px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg border border-neutral-300 dark:border-neutral-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Import watches from a CSV (upserts by slug)"
                  >
                    <Upload className="w-4 h-4" />
                    <span className="hidden sm:inline text-sm">Import</span>
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
            {/* Filters + Search + Sort */}
            <div className="rounded-xl p-6 shadow-sm border mb-6" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="flex flex-col gap-4">
                {/* Status filter pills */}
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
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

                  <div className="flex items-center gap-2 flex-wrap">
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

                {/* Search + Sort row */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" aria-hidden="true" />
                    <input
                      type="search"
                      value={inquirySearch}
                      onChange={(e) => setInquirySearch(e.target.value)}
                      placeholder="Search by name, email, phone, message, or watch…"
                      aria-label="Search inquiries"
                      className="w-full pl-10 pr-10 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                    />
                    {inquirySearch && (
                      <button
                        type="button"
                        onClick={() => setInquirySearch('')}
                        aria-label="Clear search"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <label htmlFor="inquiry-sort" className="text-sm text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                      Sort:
                    </label>
                    <select
                      id="inquiry-sort"
                      value={inquirySort}
                      onChange={(e) => setInquirySort(e.target.value as InquirySort)}
                      className="px-3 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                    >
                      <option value="newest">Newest first</option>
                      <option value="oldest">Oldest first</option>
                      <option value="status">Status (NEW first)</option>
                      <option value="last_contacted">Last contacted</option>
                    </select>
                  </div>
                </div>

                {/* Search summary */}
                {(inquirySearch || inquiryFilter !== 'ALL') && (
                  <p className="text-sm text-neutral-600 dark:text-neutral-400" aria-live="polite">
                    Showing {filteredInquiries.length} of {inquiries.length} inquiries
                    {inquirySearch && <> matching <span className="text-[#D4AF37]">"{inquirySearch}"</span></>}
                    {inquiryFilter !== 'ALL' && <> with status <span className="text-[#D4AF37]">{inquiryFilter.replace('_', ' ')}</span></>}
                  </p>
                )}
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

            {/* Bulk action bar — only visible when inquiries are selected */}
            {!inquiriesLoading && !inquiriesError && selectedInquiries.size > 0 && (
              <div className="mb-4 rounded-xl border border-[#D4AF37]/40 bg-[#D4AF37]/5 p-3 flex items-center gap-3 flex-wrap">
                <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {selectedInquiries.size} selected
                </span>
                <button
                  type="button"
                  disabled={inquiryBulkLoading}
                  onClick={() => handleBulkInquiryStatusChange('CONTACTED')}
                  className="px-3 py-1.5 text-xs font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
                >
                  Mark CONTACTED
                </button>
                <button
                  type="button"
                  disabled={inquiryBulkLoading}
                  onClick={() => handleBulkInquiryStatusChange('FOLLOW_UP')}
                  className="px-3 py-1.5 text-xs font-medium bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors"
                >
                  Mark FOLLOW UP
                </button>
                <button
                  type="button"
                  disabled={inquiryBulkLoading}
                  onClick={() => handleBulkInquiryStatusChange('CLOSED')}
                  className="px-3 py-1.5 text-xs font-medium bg-neutral-600 text-white rounded-lg hover:bg-neutral-700 disabled:opacity-50 transition-colors"
                >
                  Mark CLOSED
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedInquiries(new Set())}
                  className="ml-auto text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
                >
                  Clear selection
                </button>
                {inquiryBulkLoading && <Loader2 className="w-4 h-4 animate-spin text-neutral-500" />}
              </div>
            )}

            {/* Inquiries Table */}
            {!inquiriesLoading && !inquiriesError && (
              <div className="rounded-xl shadow-sm border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
                      <tr>
                        <th className="px-4 py-3 w-10">
                          <label className="flex items-center justify-center cursor-pointer" title="Select all visible">
                            <input
                              type="checkbox"
                              checked={filteredInquiries.length > 0 && selectedInquiries.size === filteredInquiries.length}
                              onChange={toggleSelectAllInquiries}
                              aria-label="Select all visible inquiries"
                              className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 text-[#D4AF37] focus:ring-[#D4AF37]"
                            />
                          </label>
                        </th>
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
                          Actions
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
                            className={`transition-colors ${
                              selectedInquiries.has(inquiry.id)
                                ? 'bg-[#D4AF37]/10 hover:bg-[#D4AF37]/15'
                                : 'hover:bg-neutral-50 dark:hover:bg-neutral-800'
                            }`}
                          >
                            <td className="px-4 py-4">
                              <label className="flex items-center justify-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={selectedInquiries.has(inquiry.id)}
                                  onChange={() => toggleInquirySelection(inquiry.id)}
                                  aria-label={`Select inquiry from ${inquiry.name}`}
                                  className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 text-[#D4AF37] focus:ring-[#D4AF37]"
                                />
                              </label>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-neutral-900">
                              <div className="flex flex-col gap-1">
                                <span>{inquiry.name}</span>
                                {inquiry.source === 'AI_CHAT' && (
                                  <span className="inline-flex items-center gap-1 self-start px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-[10px] font-medium uppercase tracking-wide">
                                    <Bot className="w-3 h-3" />
                                    AI Chat
                                  </span>
                                )}
                                {inquiry.source === 'WHATSAPP' && (
                                  <span className="inline-flex items-center gap-1 self-start px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-[10px] font-medium uppercase tracking-wide">
                                    <MessageCircle className="w-3 h-3" />
                                    WhatsApp
                                  </span>
                                )}
                                {inquiry.status === 'NEW' && (() => {
                                  const hours = (Date.now() - new Date(inquiry.createdAt).getTime()) / (1000 * 60 * 60);
                                  return hours > 24 ? (
                                    <span className="inline-flex items-center gap-1 self-start px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-[10px] font-medium uppercase tracking-wide">
                                      <Sparkles className="w-3 h-3" />
                                      Needs reply
                                    </span>
                                  ) : null;
                                })()}
                              </div>
                            </td>
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
                              <span
                                className="flex items-center gap-1.5"
                                title={new Date(inquiry.createdAt).toLocaleString('en-PH', {
                                  year: 'numeric', month: 'short', day: 'numeric',
                                  hour: '2-digit', minute: '2-digit',
                                })}
                              >
                                <Clock className="w-3.5 h-3.5" />
                                {getAgeString(inquiry.createdAt)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-1">
                                {(() => {
                                  const waLink = getWhatsAppReplyLink(inquiry);
                                  return waLink ? (
                                    <a
                                      href={waLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                                      title="Reply on WhatsApp"
                                      aria-label={`Reply to ${inquiry.name} on WhatsApp`}
                                    >
                                      <MessageCircle className="w-4 h-4" />
                                    </a>
                                  ) : null;
                                })()}
                                <a
                                  href={getEmailReplyLink(inquiry)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                  title="Reply by email"
                                  aria-label={`Reply to ${inquiry.name} by email`}
                                >
                                  <Mail className="w-4 h-4" />
                                </a>
                                {inquiry.watch && (
                                  <a
                                    href={`/watch/${inquiry.watch.slug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="p-2 text-[#D4AF37] hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                                    title="View watch page"
                                    aria-label={`View ${inquiry.watch.brand} ${inquiry.watch.model} page`}
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                )}
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedInquiry(expandedInquiry === inquiry.id ? null : inquiry.id)
                                  }
                                  className="p-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                                  title="Toggle details"
                                  aria-label={expandedInquiry === inquiry.id ? 'Hide details' : 'Show details'}
                                  aria-expanded={expandedInquiry === inquiry.id}
                                >
                                  {expandedInquiry === inquiry.id ? (
                                    <ChevronUp className="w-4 h-4" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
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
                                <td colSpan={8} className="px-6 py-4">
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
                                      <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                          CRM Notes
                                        </h4>
                                        {savingNotes[inquiry.id] && (
                                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-neutral-500">
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                            Saving…
                                          </span>
                                        )}
                                        {!savingNotes[inquiry.id] && noteSaveState[inquiry.id] === 'saved' && (
                                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                                            <Save className="w-3 h-3" />
                                            Saved
                                          </span>
                                        )}
                                        {!savingNotes[inquiry.id] && noteSaveState[inquiry.id] === 'error' && (
                                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-red-600 dark:text-red-400">
                                            <AlertCircle className="w-3 h-3" />
                                            Save failed — will retry
                                          </span>
                                        )}
                                      </div>
                                      <textarea
                                        value={crmNotes[inquiry.id] ?? ''}
                                        onChange={(e) => handleCrmNoteChange(inquiry.id, e.target.value)}
                                        rows={4}
                                        placeholder="Add notes about this customer..."
                                        aria-label={`Notes for inquiry from ${inquiry.name}`}
                                        className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent resize-vertical bg-white dark:bg-neutral-800 text-neutral-900 placeholder:text-neutral-400 ${
                                          noteSaveState[inquiry.id] === 'error'
                                            ? 'border-red-400 dark:border-red-500'
                                            : 'border-neutral-300 dark:border-neutral-600'
                                        }`}
                                      />
                                      <p className="text-xs text-neutral-400 mt-1">
                                        Notes sync to the server automatically. A local copy is kept in this browser as a backup.
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
