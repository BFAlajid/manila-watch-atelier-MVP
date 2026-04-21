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
import { LowStockBadge } from '../components/LowStockBadge';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { InquiryModal } from '../components/InquiryModal';
import { RecentlyViewed } from '../components/RecentlyViewed';
import { TrustBadges } from '../components/TrustBadges';
import { WatchVideoPlayer } from '../components/WatchVideoPlayer';
import { useWatch } from '../context/WatchContext';
import type { Watch } from '../types/inventory';
import { SEOHead, getWatchJsonLd } from '../components/SEOHead';
import { ImageLightbox, ZoomTrigger } from '../components/ImageLightbox';
import { SocialShareButtons } from '../components/SocialShareButtons';
import { AppointmentBooking } from '../components/AppointmentBooking';

// API configuration
const API_BASE_URL = import.meta.env.PROD
  ? '/api'
  : 'http://localhost:3001/api';

export default function WatchDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [watch, setWatch] = useState<Watch | null>(null);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [isAppointmentOpen, setIsAppointmentOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const {
    addToRecentlyViewed,
    incrementViewCount,
    formatPrice
  } = useWatch();

  useEffect(() => {
    if (!slug) return;

    // Load single watch from API (also increments viewCount server-side)
    const loadWatch = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/watches/${slug}`);
        if (!response.ok) {
          if (response.status === 404) {
            navigate('/inventory');
            return;
          }
          throw new Error('Failed to load watch');
        }

        const foundWatch = await response.json();
        setWatch(foundWatch);
        addToRecentlyViewed(foundWatch.id);
        incrementViewCount(foundWatch.id);
      } catch (error) {
        console.error('Error loading watch:', error);
        navigate('/inventory');
      }
    };

    loadWatch();
  }, [slug, navigate, addToRecentlyViewed, incrementViewCount]);

  if (!watch) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="h-5 w-40 bg-neutral-800 rounded animate-pulse mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Image skeleton */}
              <div>
                <div className="bg-neutral-900 rounded-2xl overflow-hidden mb-4">
                  <div className="w-full h-[600px] bg-neutral-800 animate-pulse" />
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-neutral-800 rounded-lg animate-pulse" />
                  ))}
                </div>
              </div>
              {/* Details skeleton */}
              <div>
                <div className="h-6 w-32 bg-[#D4AF37]/20 rounded animate-pulse mb-3" />
                <div className="h-10 w-3/4 bg-neutral-800 rounded animate-pulse mb-4" />
                <div className="h-5 w-48 bg-neutral-800 rounded animate-pulse mb-6" />
                <div className="h-14 w-64 bg-[#D4AF37]/20 rounded animate-pulse mb-8" />
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="h-20 bg-neutral-900 rounded-xl animate-pulse" />
                  <div className="h-20 bg-neutral-900 rounded-xl animate-pulse" />
                </div>
                <div className="h-14 w-full bg-[#D4AF37]/20 rounded-xl animate-pulse mb-8" />
                <div className="border-t border-neutral-800 pt-8 mt-8">
                  <div className="h-6 w-32 bg-neutral-800 rounded animate-pulse mb-4" />
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-neutral-800 rounded animate-pulse" />
                    <div className="h-4 w-5/6 bg-neutral-800 rounded animate-pulse" />
                    <div className="h-4 w-4/6 bg-neutral-800 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
      <SEOHead
        title={`${watch.brand} ${watch.model || watch.name} Ref. ${watch.reference} | Manila Watch Atelier`}
        description={`${watch.brand} ${watch.model || watch.name} Ref. ${watch.reference}, ${watch.condition.replace('_', ' ')} condition${watch.box || watch.papers ? `, ${watch.box ? 'box' : ''}${watch.box && watch.papers ? ' & ' : ''}${watch.papers ? 'papers' : ''}` : ''}. ${price}. Grey market. Manila, Philippines.`}
        ogImage={watch.images?.[0]}
        ogType="product"
        canonical={`/watch/${watch.slug}`}
        jsonLd={getWatchJsonLd(watch)}
      />
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
                <div className="relative bg-neutral-900 rounded-2xl overflow-hidden mb-4 cursor-zoom-in" onClick={() => setLightboxOpen(true)}>
                  <img
                    src={watch.images[selectedImage]}
                    alt={watch.name}
                    className="w-full h-[600px] object-cover"
                  />
                  <div className="absolute top-4 right-4 flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <FavoriteButton watchId={watch.id} watchName={watch.name} />
                    <ShareButton slug={watch.slug} watchName={watch.name} />
                  </div>
                  <ZoomTrigger onClick={() => setLightboxOpen(true)} />
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
              {/* Brand & Name */}
              <p className="text-[#D4AF37] mb-2">{watch.brand}</p>
              <h1 className="text-4xl mb-4 font-serif">{watch.name}</h1>

              {/* Reference & Copy */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-neutral-400">Ref: {watch.reference}</span>
                <CopyButton text={watch.reference} label="Reference" />
              </div>

              {/* Price */}
              <div className="mb-6">
                <p className="text-5xl text-[#D4AF37] mb-2">{price}</p>
                <LowStockBadge tier={watch.tier} availability={watch.availability} />
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

              {/* Book Viewing */}
              <button
                type="button"
                onClick={() => setIsAppointmentOpen(true)}
                className="w-full py-3 mb-4 border border-[#D4AF37] text-[#D4AF37] rounded-xl hover:bg-[#D4AF37]/10 transition-colors text-sm"
              >
                Book an In-Person Viewing
              </button>

              <ComparisonButton watchId={watch.id} className="mb-4" />

              {/* Social Share */}
              <SocialShareButtons
                slug={watch.slug}
                watchName={watch.name}
                brand={watch.brand}
                price={price}
                className="mb-8"
              />

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
        watchId={watch.id}
      />

      {/* Appointment Booking */}
      <AppointmentBooking
        isOpen={isAppointmentOpen}
        onClose={() => setIsAppointmentOpen(false)}
        watchName={`${watch.brand} ${watch.name}`}
        watchId={watch.id}
      />

      {/* Image Lightbox */}
      <ImageLightbox
        images={watch.images || []}
        initialIndex={selectedImage}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        alt={`${watch.brand} ${watch.name}`}
      />
    </motion.div>
  );
}
