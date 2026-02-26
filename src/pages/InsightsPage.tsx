import { useState, useEffect, useMemo } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { motion } from 'motion/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------
const API_BASE_URL = import.meta.env.PROD
  ? '/api'
  : 'http://localhost:3001/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Watch {
  id: string;
  brand: string;
  name: string;
  pricePHP?: number;
  price_php: number;
  retailPricePHP?: number | null;
  marketTrend?: 'APPRECIATING' | 'STABLE' | 'DEPRECIATING' | null;
  complications?: string[];
  caseMaterial?: string | null;
  condition: string;
  status?: 'AVAILABLE' | 'RESERVED' | 'SOLD';
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const BRAND_COLORS: Record<string, string> = {
  Rolex: '#006039',
  'Patek Philippe': '#1a365d',
  'Audemars Piguet': '#1a1a1a',
  Omega: '#c41e3a',
  Cartier: '#8B0000',
  Tudor: '#8B4513',
  Other: '#D4AF37',
};

const TREND_COLORS: Record<string, string> = {
  APPRECIATING: '#22c55e',
  STABLE: '#D4AF37',
  DEPRECIATING: '#ef4444',
  UNKNOWN: '#525252',
};

const BRAND_CONTEXT: Record<string, string> = {
  Rolex:
    'Rolex remains the benchmark in the secondary market. Professional models such as the Submariner, Daytona, and GMT-Master II consistently trade above retail, driven by constrained authorized-dealer supply and relentless global demand. As a dealer, Rolex is the most liquid asset in any portfolio.',
  'Patek Philippe':
    'Patek Philippe occupies the pinnacle of collectibility. Complicated references and limited-edition pieces appreciate steadily over decades, making them generational stores of value. Nautilus and Aquanaut sport models have seen extraordinary premiums, though the market is beginning to normalize after the 2021-2022 peak.',
  'Audemars Piguet':
    'Audemars Piguet, led by the iconic Royal Oak family, commands strong premiums in the grey market. Limited allocations at boutiques and a relatively small production volume keep secondary prices elevated. Collectors increasingly pursue Royal Oak Offshore and CODE 11.59 references.',
  Omega:
    'Omega offers a compelling value proposition for pre-owned buyers. While most references trade at or slightly below retail, limited collaborations like the MoonSwatch and vintage Speedmaster models can generate meaningful premiums. Omega is a volume mover for any dealer inventory.',
  Cartier:
    'Cartier has experienced a resurgence in collector interest, particularly the Santos, Tank, and Crash lines. The brand bridges fine jewelry and haute horlogerie, attracting a clientele that values design heritage. Grey market premiums are modest but growing for sought-after references.',
  Tudor:
    'Tudor is the entry point into serious Swiss watchmaking, positioned as the accessible sibling to Rolex. The Black Bay and Pelagos lines trade close to retail, making them ideal for collectors building their first portfolio. Dealer margins are thinner, but turnover is fast.',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getPrice(w: Watch): number {
  return w.pricePHP ?? w.price_php ?? 0;
}

function getBrandColor(brand: string): string {
  return BRAND_COLORS[brand] ?? BRAND_COLORS.Other;
}

function formatPHP(value: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toString();
}

// ---------------------------------------------------------------------------
// Custom Recharts Tooltip
// ---------------------------------------------------------------------------
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
  isCurrency?: boolean;
  isPercent?: boolean;
}

function CustomTooltip({ active, payload, label, isCurrency, isPercent }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 shadow-xl">
      {label && <p className="text-white text-sm font-semibold mb-1">{label}</p>}
      {payload.map((entry, idx) => (
        <p key={idx} className="text-sm" style={{ color: entry.color }}>
          {entry.name}:{' '}
          {isCurrency
            ? formatPHP(entry.value)
            : isPercent
            ? `${entry.value.toFixed(1)}%`
            : entry.value}
        </p>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section wrapper
// ---------------------------------------------------------------------------
function ChartSection({
  title,
  subtitle,
  children,
  delay = 0,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay }}
      className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 md:p-8"
    >
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">{title}</h2>
      {subtitle && <p className="text-neutral-400 text-sm mb-6">{subtitle}</p>}
      {!subtitle && <div className="mb-6" />}
      {children}
    </motion.section>
  );
}

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------
function StatCard({
  label,
  value,
  sub,
  delay = 0,
}: {
  label: string;
  value: string;
  sub?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col items-center text-center"
    >
      <span className="text-neutral-400 text-xs uppercase tracking-widest mb-2">{label}</span>
      <span className="text-2xl md:text-3xl font-bold text-[#D4AF37]">{value}</span>
      {sub && <span className="text-neutral-500 text-xs mt-1">{sub}</span>}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export default function InsightsPage() {
  const [watches, setWatches] = useState<Watch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch watches
  useEffect(() => {
    const fetchWatches = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/watches`);
        if (!res.ok) throw new Error('Failed to fetch watches');
        const data: Watch[] = await res.json();
        setWatches(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchWatches();
  }, []);

  // -----------------------------------------------------------------------
  // Derived data
  // -----------------------------------------------------------------------
  const availableWatches = useMemo(
    () => watches.filter((w) => w.status !== 'SOLD'),
    [watches],
  );

  const brands = useMemo(() => {
    const set = new Set(availableWatches.map((w) => w.brand));
    return Array.from(set).sort();
  }, [availableWatches]);

  // Brand Price Distribution
  const brandPriceData = useMemo(() => {
    return brands.map((brand) => {
      const bw = availableWatches.filter((w) => w.brand === brand);
      const prices = bw.map(getPrice).filter((p) => p > 0);
      if (prices.length === 0) return { brand, min: 0, avg: 0, max: 0 };
      return {
        brand,
        min: Math.min(...prices),
        avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
        max: Math.max(...prices),
      };
    });
  }, [brands, availableWatches]);

  // Market Trend Breakdown
  const trendData = useMemo(() => {
    const counts: Record<string, number> = {
      APPRECIATING: 0,
      STABLE: 0,
      DEPRECIATING: 0,
      UNKNOWN: 0,
    };
    availableWatches.forEach((w) => {
      const t = w.marketTrend ?? 'UNKNOWN';
      counts[t] = (counts[t] || 0) + 1;
    });
    const total = availableWatches.length || 1;
    return Object.entries(counts)
      .filter(([, count]) => count > 0)
      .map(([trend, count]) => ({
        name: trend.charAt(0) + trend.slice(1).toLowerCase(),
        value: count,
        pct: +((count / total) * 100).toFixed(1),
      }));
  }, [availableWatches]);

  // Grey Market Premium over Retail
  const premiumData = useMemo(() => {
    return brands
      .map((brand) => {
        const bw = availableWatches.filter(
          (w) => w.brand === brand && w.retailPricePHP && w.retailPricePHP > 0,
        );
        if (bw.length === 0) return null;
        const avgRetail =
          bw.reduce((s, w) => s + (w.retailPricePHP ?? 0), 0) / bw.length;
        const avgGrey =
          bw.reduce((s, w) => s + getPrice(w), 0) / bw.length;
        const premiumPct = avgRetail > 0 ? ((avgGrey - avgRetail) / avgRetail) * 100 : 0;
        return {
          brand,
          premiumPct: +premiumPct.toFixed(1),
          avgRetail: Math.round(avgRetail),
          avgGrey: Math.round(avgGrey),
        };
      })
      .filter(Boolean) as Array<{
      brand: string;
      premiumPct: number;
      avgRetail: number;
      avgGrey: number;
    }>;
  }, [brands, availableWatches]);

  // Inventory Count by Brand
  const inventoryCountData = useMemo(() => {
    return brands.map((brand) => ({
      brand,
      count: availableWatches.filter((w) => w.brand === brand).length,
    }));
  }, [brands, availableWatches]);

  // Portfolio totals
  const portfolioStats = useMemo(() => {
    const total = availableWatches.reduce((s, w) => s + getPrice(w), 0);
    const avg = availableWatches.length > 0 ? total / availableWatches.length : 0;
    const byBrand = brands.map((brand) => {
      const bw = availableWatches.filter((w) => w.brand === brand);
      return { brand, count: bw.length, total: bw.reduce((s, w) => s + getPrice(w), 0) };
    });
    return { total, avg, count: availableWatches.length, byBrand };
  }, [brands, availableWatches]);

  // -----------------------------------------------------------------------
  // Axis tick formatting
  // -----------------------------------------------------------------------
  const AXIS_STYLE = { fill: '#a3a3a3', fontSize: 12 };
  const GRID_STYLE = { stroke: '#525252', strokeDasharray: '3 3' };

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-black"
    >
      <Header />

      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Market <span className="text-[#D4AF37]">Insights</span>
            </h1>
            <p className="text-lg text-neutral-400 max-w-2xl">
              Data-driven analysis of our current inventory, pricing trends, and grey market
              premiums -- curated from a dealer&apos;s perspective.
            </p>
          </motion.div>

          {/* Loading / Error States */}
          {loading && (
            <div className="flex justify-center items-center py-32">
              <div className="w-10 h-10 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {error && (
            <div className="text-center py-32">
              <p className="text-red-400 text-lg">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-10">
              {/* --------------------------------------------------------- */}
              {/* Portfolio Value Stat Cards                                 */}
              {/* --------------------------------------------------------- */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  label="Total Portfolio Value"
                  value={formatPHP(portfolioStats.total)}
                  delay={0}
                />
                <StatCard
                  label="Average Price"
                  value={formatPHP(Math.round(portfolioStats.avg))}
                  delay={0.1}
                />
                <StatCard
                  label="Total Pieces"
                  value={portfolioStats.count.toString()}
                  delay={0.2}
                />
                <StatCard
                  label="Brands"
                  value={brands.length.toString()}
                  delay={0.3}
                />
              </div>

              {/* Brand breakdown mini table */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 md:p-8"
              >
                <h2 className="text-2xl font-bold text-white mb-6">
                  Portfolio Breakdown by Brand
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-neutral-700 text-neutral-400 text-xs uppercase tracking-wider">
                        <th className="pb-3 pr-4">Brand</th>
                        <th className="pb-3 pr-4 text-right">Pieces</th>
                        <th className="pb-3 text-right">Total Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {portfolioStats.byBrand
                        .sort((a, b) => b.total - a.total)
                        .map((row) => (
                          <tr
                            key={row.brand}
                            className="border-b border-neutral-800 last:border-0"
                          >
                            <td className="py-3 pr-4">
                              <span className="flex items-center gap-2">
                                <span
                                  className="inline-block w-3 h-3 rounded-full"
                                  style={{ backgroundColor: getBrandColor(row.brand) }}
                                />
                                <span className="text-white text-sm">{row.brand}</span>
                              </span>
                            </td>
                            <td className="py-3 pr-4 text-right text-neutral-300 text-sm">
                              {row.count}
                            </td>
                            <td className="py-3 text-right text-[#D4AF37] text-sm font-medium">
                              {formatPHP(row.total)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>

              {/* --------------------------------------------------------- */}
              {/* Brand Price Distribution                                   */}
              {/* --------------------------------------------------------- */}
              <ChartSection
                title="Brand Price Distribution"
                subtitle="Minimum, average, and maximum asking price per brand (PHP)"
                delay={0.1}
              >
                <ResponsiveContainer width="100%" height={380}>
                  <BarChart
                    data={brandPriceData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                  >
                    <CartesianGrid {...GRID_STYLE} />
                    <XAxis
                      dataKey="brand"
                      tick={AXIS_STYLE}
                      stroke="#525252"
                      interval={0}
                      angle={-25}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis
                      tick={AXIS_STYLE}
                      stroke="#525252"
                      tickFormatter={(v: number) => formatCompact(v)}
                    />
                    <Tooltip content={<CustomTooltip isCurrency />} />
                    <Legend
                      wrapperStyle={{ color: '#a3a3a3', fontSize: 12 }}
                    />
                    <Bar dataKey="min" name="Min" fill="#525252" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="avg" name="Avg" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="max" name="Max" fill="#fbbf24" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartSection>

              {/* --------------------------------------------------------- */}
              {/* Market Trend Breakdown                                     */}
              {/* --------------------------------------------------------- */}
              <ChartSection
                title="Market Trend Breakdown"
                subtitle="Percentage of current inventory by market trend classification"
                delay={0.15}
              >
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie
                        data={trendData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={120}
                        paddingAngle={3}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, pct }: { name: string; pct: number }) =>
                          `${name} ${pct}%`
                        }
                        stroke="none"
                      >
                        {trendData.map((entry) => (
                          <Cell
                            key={entry.name}
                            fill={
                              TREND_COLORS[entry.name.toUpperCase()] ?? TREND_COLORS.UNKNOWN
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload || payload.length === 0) return null;
                          const d = payload[0].payload as { name: string; value: number; pct: number };
                          return (
                            <div className="bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 shadow-xl">
                              <p className="text-white text-sm font-semibold">{d.name}</p>
                              <p className="text-neutral-300 text-sm">
                                {d.value} pieces ({d.pct}%)
                              </p>
                            </div>
                          );
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Legend */}
                  <div className="flex flex-col gap-3 min-w-[180px]">
                    {trendData.map((entry) => (
                      <div key={entry.name} className="flex items-center gap-3">
                        <span
                          className="inline-block w-4 h-4 rounded-full"
                          style={{
                            backgroundColor:
                              TREND_COLORS[entry.name.toUpperCase()] ?? TREND_COLORS.UNKNOWN,
                          }}
                        />
                        <span className="text-neutral-300 text-sm">
                          {entry.name}{' '}
                          <span className="text-neutral-500">
                            ({entry.value} &middot; {entry.pct}%)
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </ChartSection>

              {/* --------------------------------------------------------- */}
              {/* Grey Market Premium over Retail                            */}
              {/* --------------------------------------------------------- */}
              {premiumData.length > 0 && (
                <ChartSection
                  title="Grey Market Premium over Retail"
                  subtitle="Average percentage premium (or discount) of our asking price vs. retail, by brand"
                  delay={0.2}
                >
                  <ResponsiveContainer width="100%" height={380}>
                    <BarChart
                      data={premiumData}
                      margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                    >
                      <CartesianGrid {...GRID_STYLE} />
                      <XAxis
                        dataKey="brand"
                        tick={AXIS_STYLE}
                        stroke="#525252"
                        interval={0}
                        angle={-25}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis
                        tick={AXIS_STYLE}
                        stroke="#525252"
                        tickFormatter={(v: number) => `${v}%`}
                      />
                      <Tooltip
                        content={({ active, payload, label: tipLabel }) => {
                          if (!active || !payload || payload.length === 0) return null;
                          const d = payload[0].payload as {
                            brand: string;
                            premiumPct: number;
                            avgRetail: number;
                            avgGrey: number;
                          };
                          return (
                            <div className="bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 shadow-xl">
                              <p className="text-white text-sm font-semibold">{tipLabel}</p>
                              <p className="text-neutral-300 text-sm">
                                Premium: {d.premiumPct > 0 ? '+' : ''}
                                {d.premiumPct}%
                              </p>
                              <p className="text-neutral-400 text-xs">
                                Retail avg: {formatPHP(d.avgRetail)}
                              </p>
                              <p className="text-neutral-400 text-xs">
                                Grey avg: {formatPHP(d.avgGrey)}
                              </p>
                            </div>
                          );
                        }}
                      />
                      <Bar dataKey="premiumPct" name="Premium %" radius={[4, 4, 0, 0]}>
                        {premiumData.map((entry) => (
                          <Cell
                            key={entry.brand}
                            fill={entry.premiumPct >= 0 ? '#22c55e' : '#ef4444'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartSection>
              )}

              {/* --------------------------------------------------------- */}
              {/* Inventory Count by Brand                                   */}
              {/* --------------------------------------------------------- */}
              <ChartSection
                title="Inventory Count by Brand"
                subtitle="Number of available pieces per brand"
                delay={0.25}
              >
                <ResponsiveContainer width="100%" height={360}>
                  <BarChart
                    data={inventoryCountData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                  >
                    <CartesianGrid {...GRID_STYLE} />
                    <XAxis
                      dataKey="brand"
                      tick={AXIS_STYLE}
                      stroke="#525252"
                      interval={0}
                      angle={-25}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tick={AXIS_STYLE} stroke="#525252" allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Pieces" radius={[4, 4, 0, 0]}>
                      {inventoryCountData.map((entry) => (
                        <Cell key={entry.brand} fill={getBrandColor(entry.brand)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartSection>

              {/* --------------------------------------------------------- */}
              {/* Brand Context Paragraphs                                  */}
              {/* --------------------------------------------------------- */}
              <motion.section
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 md:p-8"
              >
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  Dealer&apos;s Notes
                </h2>
                <p className="text-neutral-400 text-sm mb-8">
                  Brand-by-brand market context from our team of specialists.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(BRAND_CONTEXT).map(([brand, text], idx) => {
                    const brandInInventory = brands.includes(brand);
                    return (
                      <motion.div
                        key={brand}
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: idx * 0.07 }}
                        className="border border-neutral-800 rounded-xl p-5 hover:border-[#D4AF37]/40 transition-colors"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <span
                            className="inline-block w-4 h-4 rounded-full"
                            style={{ backgroundColor: getBrandColor(brand) }}
                          />
                          <h3 className="text-lg font-semibold text-white">{brand}</h3>
                          {brandInInventory && (
                            <span className="ml-auto text-xs text-[#D4AF37] border border-[#D4AF37]/30 rounded-full px-2 py-0.5">
                              In Stock
                            </span>
                          )}
                        </div>
                        <p className="text-neutral-400 text-sm leading-relaxed">{text}</p>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.section>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </motion.div>
  );
}
