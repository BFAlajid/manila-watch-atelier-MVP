import { useState } from 'react';
import { Play, X, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VideoData {
  type: 'youtube' | 'facebook' | 'upload' | 'url';
  url: string;
  thumbnail?: string;
}

interface WatchVideoPlayerProps {
  video: VideoData;
  watchName: string;
  posterImage?: string; // Fallback to watch image if no video thumbnail
}

export function WatchVideoPlayer({ video, watchName, posterImage }: WatchVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(true); // Auto-play on load
  const [isFullscreen, setIsFullscreen] = useState(false);

  const getThumbnail = () => {
    if (video.thumbnail) return video.thumbnail;
    if (posterImage) return posterImage;

    // Generate thumbnail from video type
    if (video.type === 'youtube') {
      const videoId = video.url.split('/').pop()?.split('?')[0];
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }

    return posterImage || '';
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handleFullscreen = () => {
    setIsFullscreen(true);
  };

  const handleCloseFullscreen = () => {
    setIsFullscreen(false);
  };

  return (
    <>
      {/* Main Video Player */}
      <div className="relative bg-neutral-900 rounded-2xl overflow-hidden">
        {!isPlaying ? (
          // Video Thumbnail with Play Button
          <div className="relative group cursor-pointer" onClick={handlePlay}>
            <img
              src={getThumbnail()}
              alt={`${watchName} video`}
              className="w-full h-[600px] object-cover"
            />

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />

            {/* Play Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="w-24 h-24 bg-[#D4AF37] rounded-full flex items-center justify-center shadow-2xl motion-reduce:transition-none"
              >
                <Play className="w-12 h-12 text-black fill-current ml-2" />
              </motion.div>
            </div>

            {/* Video Label */}
            <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg">
              <p className="text-sm text-white font-medium">▶ Watch Video Presentation</p>
            </div>
          </div>
        ) : (
          // Embedded Video Player
          <div className="relative bg-black rounded-2xl overflow-hidden">
            {video.type === 'youtube' && (
              <div className="aspect-video">
                <iframe
                  src={`${video.url}?autoplay=1`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={`${watchName} video`}
                />
              </div>
            )}

            {video.type === 'facebook' && (
              <div className="flex justify-center">
                <iframe
                  src={`${video.url}&autoplay=1`}
                  width="500"
                  height="890"
                  className="border-0 overflow-hidden"
                  allowFullScreen
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  title={`${watchName} video`}
                />
              </div>
            )}

            {(video.type === 'url' || video.type === 'upload') && (
              <video
                src={video.url}
                controls
                autoPlay
                className="w-full h-[600px]"
                poster={video.thumbnail || posterImage}
              >
                Your browser does not support the video tag.
              </video>
            )}

            {/* Fullscreen Button */}
            <button
              onClick={handleFullscreen}
              className="absolute bottom-4 right-4 bg-black/70 hover:bg-black/90 p-3 rounded-lg transition-colors"
              title="Open in fullscreen"
            >
              <Maximize2 className="w-5 h-5 text-white" />
            </button>
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          >
            {/* Close Button */}
            <button
              onClick={handleCloseFullscreen}
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors z-10"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Fullscreen Video */}
            <div className="w-full h-full flex items-center justify-center p-4">
              {video.type === 'youtube' && (
                <iframe
                  src={`${video.url}?autoplay=1`}
                  className="w-full h-full max-w-7xl"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={`${watchName} video fullscreen`}
                />
              )}

              {video.type === 'facebook' && (
                <iframe
                  src={`${video.url}&autoplay=1`}
                  width="600"
                  height="1067"
                  className="border-0"
                  allowFullScreen
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  title={`${watchName} video fullscreen`}
                />
              )}

              {(video.type === 'url' || video.type === 'upload') && (
                <video
                  src={video.url}
                  controls
                  autoPlay
                  className="w-full h-full max-w-7xl"
                  poster={video.thumbnail || posterImage}
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
