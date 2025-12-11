import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, FileText, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { FavoriteButton } from '../components/FavoriteButton';
import { ShareButton } from '../components/ShareButton';
import { ComparisonButton } from '../components/ComparisonButton';
import { CopyButton } from '../components/CopyButton';
import { ViewCounter } from '../components/ViewCounter';
import { LowStockBadge } from '../components/LowStockBadge';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { InquiryModal } from '../components/InquiryModal';
import { PaymentCalculator } from '../components/PaymentCalculator';
import { RecentlyViewed } from '../components/RecentlyViewed';
import { TrustBadges } from '../components/TrustBadges';
import { WatchVideoPlayer } from '../components/WatchVideoPlayer';
import { useWatch } from '../context/WatchContext';
import type { Watch } from '../types/inventory';
import { ScarcityIndicator } from '../components/psychology/ScarcityIndicator';
import { SocialProofBadge, TestimonialSnippet } from '../components/psychology/SocialProofBadge';
import { UrgencyTimer } from '../components/psychology/UrgencyTimer';
import { FOMOIndicator } from '../components/psychology/FOMOIndicator';

// API configuration
const API_BASE_URL = import.meta.env.PROD
  ? '/api'
  : 'http://localhost:3001/api';

export default function WatchDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [watch, setWatch] = useState<Watch | null>(null);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const {
    addToRecentlyViewed,
    incrementViewCount,
    formatPrice
  } = useWatch();

  useEffect(() => {
    if (!slug) return;

    // Load watch data from API
    const loadWatch = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/inventory`);
        if (!response.ok) {
          throw new Error('Failed to load inventory');
        }

        const allWatches = await response.json();
        const foundWatch = allWatches.find((w: Watch) => w.slug === slug);

        if (foundWatch) {
          setWatch(foundWatch);
          addToRecentlyViewed(foundWatch.id);
          incrementViewCount(foundWatch.id);
        } else {
          navigate('/inventory');
        }
      } catch (error) {
        console.error('Error loading watch:', error);
        navigate('/inventory');
      }
    };

    loadWatch();
  }, [slug, navigate, addToRecentlyViewed, incrementViewCount]);

  if (!watch) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const price = formatPrice(watch.price_php);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-black text-white"
    >
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <Link
            to="/inventory"
            className="inline-flex items-center gap-2 text-neutral-400 hover:text-[#D4AF37] mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Inventory
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Video & Images */}
            <div>
              {/* Video Player - Shows First if Available */}
              {watch.video && watch.video.url && (
                <div className="mb-4">
                  <WatchVideoPlayer
                    video={watch.video}
                    watchName={watch.name}
                    posterImage={watch.images[0]}
                  />
                </div>
              )}

              {/* Image Gallery - Shows if no video, or below video */}
              {(!watch.video || !watch.video.url) && (
                <div className="relative bg-neutral-900 rounded-2xl overflow-hidden mb-4">
                  <img
                    src={watch.images[selectedImage]}
                    alt={watch.name}
                    className="w-full h-[600px] object-cover"
                  />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <FavoriteButton watchId={watch.id} watchName={watch.name} />
                    <ShareButton slug={watch.slug} watchName={watch.name} />
                  </div>
                </div>
              )}

              {/* Thumbnail Gallery */}
              {watch.images.length > 1 && (
                <div>
                  {watch.video && (
                    <p className="text-sm text-neutral-400 mb-2">Watch Images:</p>
                  )}
                  <div className="grid grid-cols-4 gap-4">
                    {watch.images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`rounded-lg overflow-hidden border-2 transition-colors ${
                          selectedImage === index
                            ? 'border-[#D4AF37]'
                            : 'border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        <img
                          src={img}
                          alt={`${watch.name} view ${index + 1}`}
                          className="w-full h-24 object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons (when video is present) */}
              {watch.video && (
                <div className="flex gap-2 mt-4">
                  <FavoriteButton watchId={watch.id} watchName={watch.name} />
                  <ShareButton slug={watch.slug} watchName={watch.name} />
                </div>
              )}
            </div>

            {/* Details */}
            <div>
              {/* FOMO & Social Proof Badges */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <FOMOIndicator
                  watchId={watch.id}
                  tier={watch.tier || 'A'}
                  condition={watch.condition}
                  brand={watch.brand}
                />
                <SocialProofBadge
                  watchId={watch.id}
                  tier={watch.tier || 'A'}
                  brand={watch.brand}
                  condition={watch.condition}
                />
              </div>

              {/* Brand & Name */}
              <p className="text-[#D4AF37] mb-2">{watch.brand}</p>
              <h1 className="text-4xl mb-4">{watch.name}</h1>

              {/* Reference & Copy */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-neutral-400">Ref: {watch.reference}</span>
                <CopyButton text={watch.reference} label="Reference" />
              </div>

              {/* View Count */}
              <ViewCounter watchId={watch.id} className="mb-6" />

              {/* Price */}
              <div className="mb-6">
                <p className="text-5xl text-[#D4AF37] mb-2">{price}</p>
                <LowStockBadge tier={watch.tier} availability={watch.availability} />
              </div>

              {/* Scarcity Indicator */}
              {(watch.tier === 'A' || !watch.tier) && (
                <div className="mb-6">
                  <ScarcityIndicator
                    tier="A"
                    watchId={watch.id}
                    availability={watch.availability}
                  />
                </div>
              )}

              {/* Urgency Timer */}
              <div className="mb-6">
                <UrgencyTimer
                  tier={watch.tier || 'A'}
                  estimatedArrival={watch.estimated_arrival}
                  watchId={watch.id}
                  pricePhp={watch.price_php}
                />
              </div>

              {/* Condition & Accessories */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-neutral-900 rounded-xl p-4">
                  <p className="text-sm text-neutral-400 mb-1">Condition</p>
                  <p className="capitalize">{watch.condition.replace('_', ' ')}</p>
                </div>
                <div className="bg-neutral-900 rounded-xl p-4">
                  <p className="text-sm text-neutral-400 mb-1">Availability</p>
                  <p>
                    {watch.tier === 'A' ? 'In Hand' : watch.tier === 'B' ? 'Incoming' : 'On Demand'}
                  </p>
                </div>
              </div>

              {/* Box & Papers */}
              <div className="flex gap-4 mb-8">
                <div className={`flex items-center gap-2 ${watch.box ? 'text-white' : 'text-neutral-600'}`}>
                  <Package className="w-5 h-5" />
                  <span>Box</span>
                  {watch.box && <span className="text-green-500">✓</span>}
                </div>
                <div className={`flex items-center gap-2 ${watch.papers ? 'text-white' : 'text-neutral-600'}`}>
                  <FileText className="w-5 h-5" />
                  <span>Papers</span>
                  {watch.papers && <span className="text-green-500">✓</span>}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mb-8">
                <button
                  onClick={() => setIsInquiryOpen(true)}
                  className="flex-1 px-6 py-4 bg-[#D4AF37] text-black rounded-xl hover:bg-[#F4E5B8] transition-colors"
                >
                  Inquire Now
                </button>
                <WhatsAppButton
                  watchName={watch.name}
                  price={price}
                  reference={watch.reference}
                  position="inline"
                />
              </div>

              <ComparisonButton watchId={watch.id} className="mb-8" />

              {/* Payment Calculator */}
              <PaymentCalculator price={watch.price_php} />

              {/* Description */}
              <div className="mt-8 border-t border-neutral-800 pt-8">
                <h3 className="text-xl mb-4">Description</h3>
                <p className="text-neutral-300 leading-relaxed">{watch.description}</p>
              </div>

              {/* Specifications */}
              <div className="mt-8 border-t border-neutral-800 pt-8">
                <h3 className="text-xl mb-4">Specifications</h3>
                <div className="space-y-3">
                  {Object.entries(watch.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-neutral-400 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="text-white">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Testimonials */}
              <div className="mt-8">
                <h3 className="text-xl mb-4">Customer Reviews</h3>
                <TestimonialSnippet brand={watch.brand} />
              </div>

              {/* Trust Badge */}
              <div className="mt-8 border border-neutral-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-6 h-6 text-[#D4AF37]" />
                  <h4>Authenticity Guaranteed</h4>
                </div>
                <p className="text-sm text-neutral-400">
                  All watches come with our 100% authenticity guarantee, 3-month service warranty,
                  and buy-back option. We stand behind every timepiece we sell.
                </p>
              </div>
            </div>
          </div>

          {/* Recently Viewed */}
          <RecentlyViewed currentWatchId={watch.id} />

          {/* Trust Badges */}
          <TrustBadges />
        </div>
      </div>

      <Footer />

      {/* Inquiry Modal */}
      <InquiryModal
        isOpen={isInquiryOpen}
        onClose={() => setIsInquiryOpen(false)}
        watchName={watch.name}
        watchReference={watch.reference}
        watchPrice={price}
      />
    </motion.div>
  );
}
