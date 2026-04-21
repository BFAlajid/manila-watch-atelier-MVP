import { useEffect, useState } from 'react';
import { useWatch } from '../context/WatchContext';
import { Link } from 'react-router-dom';
import { X, ArrowLeft } from 'lucide-react';
import { fetchWatches } from '../lib/api';

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
  images: string[];
  specifications: {
    movement: string;
    caseMaterial: string;
    diameter: string;
    waterResistance: string;
  };
}

export default function ComparePage() {
  const { comparison, removeFromComparison, formatPrice } = useWatch();
  const [watches, setWatches] = useState<Watch[]>([]);

  useEffect(() => {
    if (comparison.length === 0) {
      setWatches([]);
      return;
    }

    let cancelled = false;
    fetchWatches()
      .then((allWatches) => {
        if (cancelled) return;
        const selectedWatches = allWatches.filter((w: Watch) => comparison.includes(w.id));
        setWatches(selectedWatches);
      })
      .catch((err) => {
        if (!cancelled) console.error('Failed to load watches for compare page:', err);
      });
    return () => { cancelled = true; };
  }, [comparison]);

  if (comparison.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white pt-24 pb-16">
        <div className="container mx-auto px-4">
          <Link to="/inventory" className="inline-flex items-center gap-2 text-neutral-400 hover:text-[#D4AF37] mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Inventory
          </Link>
          <div className="text-center py-16">
            <h1 className="text-3xl mb-4">No Watches to Compare</h1>
            <p className="text-neutral-400 mb-8">Add watches from the inventory to start comparing</p>
            <Link to="/inventory" className="px-6 py-3 bg-[#D4AF37] text-black rounded-lg hover:bg-[#F4E5B8] transition-colors inline-block">
              Browse Inventory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const specs = [
    { label: 'Movement', key: 'movement' },
    { label: 'Case Material', key: 'caseMaterial' },
    { label: 'Diameter', key: 'diameter' },
    { label: 'Water Resistance', key: 'waterResistance' }
  ];

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-16">
      <div className="container mx-auto px-4">
        <Link to="/inventory" className="inline-flex items-center gap-2 text-neutral-400 hover:text-[#D4AF37] mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Inventory
        </Link>

        <h1 className="text-4xl mb-8">Compare Watches</h1>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-4 text-left border-b border-neutral-800 w-48">Specification</th>
                {watches.map((watch) => (
                  <th key={watch.id} className="p-4 border-b border-neutral-800 min-w-[280px]">
                    <div className="relative">
                      <button
                        onClick={() => removeFromComparison(watch.id)}
                        className="absolute -top-2 -right-2 bg-neutral-800 hover:bg-neutral-700 rounded-full p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <Link to={`/watch/${watch.slug}`}>
                        <img
                          src={watch.images[0]}
                          alt={watch.name}
                          className="w-full h-48 object-cover rounded-lg mb-4"
                        />
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Name */}
              <tr>
                <td className="p-4 border-b border-neutral-800 text-neutral-400">Name</td>
                {watches.map((watch) => (
                  <td key={watch.id} className="p-4 border-b border-neutral-800">
                    <Link to={`/watch/${watch.slug}`} className="hover:text-[#D4AF37]">
                      {watch.brand} {watch.name}
                    </Link>
                  </td>
                ))}
              </tr>

              {/* Price */}
              <tr>
                <td className="p-4 border-b border-neutral-800 text-neutral-400">Price</td>
                {watches.map((watch) => (
                  <td key={watch.id} className="p-4 border-b border-neutral-800 text-[#D4AF37]">
                    {formatPrice(watch.price_php)}
                  </td>
                ))}
              </tr>

              {/* Reference */}
              <tr>
                <td className="p-4 border-b border-neutral-800 text-neutral-400">Reference</td>
                {watches.map((watch) => (
                  <td key={watch.id} className="p-4 border-b border-neutral-800">
                    {watch.reference}
                  </td>
                ))}
              </tr>

              {/* Condition */}
              <tr>
                <td className="p-4 border-b border-neutral-800 text-neutral-400">Condition</td>
                {watches.map((watch) => (
                  <td key={watch.id} className="p-4 border-b border-neutral-800 capitalize">
                    {watch.condition.replace('_', ' ')}
                  </td>
                ))}
              </tr>

              {/* Box & Papers */}
              <tr>
                <td className="p-4 border-b border-neutral-800 text-neutral-400">Box & Papers</td>
                {watches.map((watch) => (
                  <td key={watch.id} className="p-4 border-b border-neutral-800">
                    {watch.box && watch.papers ? 'Full Set' : watch.box ? 'Box Only' : watch.papers ? 'Papers Only' : 'Watch Only'}
                  </td>
                ))}
              </tr>

              {/* Tier */}
              <tr>
                <td className="p-4 border-b border-neutral-800 text-neutral-400">Availability</td>
                {watches.map((watch) => (
                  <td key={watch.id} className="p-4 border-b border-neutral-800">
                    {watch.tier === 'A' ? 'In Hand' : watch.tier === 'B' ? 'Incoming' : 'On Demand'}
                  </td>
                ))}
              </tr>

              {/* Specifications */}
              {specs.map((spec) => (
                <tr key={spec.key}>
                  <td className="p-4 border-b border-neutral-800 text-neutral-400">{spec.label}</td>
                  {watches.map((watch) => (
                    <td key={watch.id} className="p-4 border-b border-neutral-800">
                      {watch.specifications[spec.key as keyof typeof watch.specifications]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CTA Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {watches.map((watch) => (
            <Link
              key={watch.id}
              to={`/watch/${watch.slug}`}
              className="px-6 py-3 bg-[#D4AF37] text-black rounded-lg hover:bg-[#F4E5B8] transition-colors text-center"
            >
              View {watch.brand} {watch.model}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
