import { useState } from 'react';
import { Video, Link, Upload, X, Youtube, Facebook, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VideoData {
  type: 'youtube' | 'facebook' | 'upload' | 'url';
  url: string;
  thumbnail?: string;
}

interface VideoManagerProps {
  video?: VideoData;
  onChange: (video: VideoData | undefined) => void;
  onUpload?: (file: File) => Promise<string>; // Optional upload handler
}

export function VideoManager({ video, onChange, onUpload }: VideoManagerProps) {
  const [videoType, setVideoType] = useState<VideoData['type']>(video?.type || 'youtube');
  const [videoUrl, setVideoUrl] = useState(video?.url || '');
  const [thumbnailUrl, setThumbnailUrl] = useState(video?.thumbnail || '');

  // Extract video ID from various URL formats
  const extractYouTubeId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const extractFacebookVideoId = (url: string): string | null => {
    // Facebook video URLs are complex, we'll use the full URL for embedding
    if (url.includes('facebook.com') && (url.includes('videos') || url.includes('reel'))) {
      return url;
    }
    return null;
  };

  // Extract src from iframe code if pasted
  const extractIframeSrc = (input: string): string => {
    const iframeMatch = input.match(/src=["']([^"']+)["']/);
    if (iframeMatch) {
      return iframeMatch[1];
    }
    return input;
  };

  // Convert URLs to embed format
  const getEmbedUrl = (type: VideoData['type'], url: string): string => {
    if (type === 'youtube') {
      const videoId = extractYouTubeId(url);
      return videoId ? `https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0` : url;
    } else if (type === 'facebook') {
      // First, check if user pasted full iframe code - extract src
      const extractedUrl = extractIframeSrc(url);

      // If it's already a Facebook plugin/embed URL, use it as-is
      if (extractedUrl.includes('facebook.com/plugins/video.php')) {
        return extractedUrl;
      }

      // Otherwise, convert regular Facebook video/reel URLs to embed format
      const encodedUrl = encodeURIComponent(extractedUrl);
      return `https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=false&width=500`;
    }
    return url;
  };

  // Handle save
  const handleSave = () => {
    if (!videoUrl.trim()) {
      onChange(undefined);
      return;
    }

    const embedUrl = getEmbedUrl(videoType, videoUrl);
    onChange({
      type: videoType,
      url: embedUrl,
      thumbnail: thumbnailUrl.trim() || undefined,
    });
  };

  // Handle remove
  const handleRemove = () => {
    setVideoUrl('');
    setThumbnailUrl('');
    onChange(undefined);
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpload) {
      try {
        const uploadedUrl = await onUpload(file);
        setVideoUrl(uploadedUrl);
        setVideoType('upload');
        onChange({
          type: 'upload',
          url: uploadedUrl,
          thumbnail: thumbnailUrl.trim() || undefined,
        });
      } catch (error) {
        console.error('Video upload failed:', error);
        alert('Failed to upload video. Please try again.');
      }
    }
  };

  return (
    <div className="border border-neutral-700 bg-neutral-800 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Video className="w-5 h-5 text-neutral-400" />
          <h3 className="font-medium">Product Video</h3>
          {video && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
              Added
            </span>
          )}
        </div>
        {video && (
          <button
            type="button"
            onClick={handleRemove}
            className="text-red-600 hover:bg-red-50 p-2 rounded transition-colors"
            title="Remove video"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Video Type Selection */}
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">Video Source</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => setVideoType('youtube')}
              className={`p-3 rounded border-2 transition-all ${
                videoType === 'youtube'
                  ? 'border-red-500 bg-red-50'
                  : 'border-neutral-300 hover:border-neutral-400'
              }`}
            >
              <Youtube className="w-5 h-5 mx-auto mb-1 text-red-600" />
              <span className="text-xs">YouTube</span>
            </button>

            <button
              type="button"
              onClick={() => setVideoType('facebook')}
              className={`p-3 rounded border-2 transition-all ${
                videoType === 'facebook'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-neutral-300 hover:border-neutral-400'
              }`}
            >
              <Facebook className="w-5 h-5 mx-auto mb-1 text-blue-600" />
              <span className="text-xs">Facebook</span>
            </button>

            <button
              type="button"
              onClick={() => setVideoType('url')}
              className={`p-3 rounded border-2 transition-all ${
                videoType === 'url'
                  ? 'border-neutral-900 bg-neutral-50'
                  : 'border-neutral-300 hover:border-neutral-400'
              }`}
            >
              <Link className="w-5 h-5 mx-auto mb-1" />
              <span className="text-xs">URL</span>
            </button>

            <button
              type="button"
              onClick={() => setVideoType('upload')}
              className={`p-3 rounded border-2 transition-all ${
                videoType === 'upload'
                  ? 'border-neutral-900 bg-neutral-50'
                  : 'border-neutral-300 hover:border-neutral-400'
              }`}
            >
              <Upload className="w-5 h-5 mx-auto mb-1" />
              <span className="text-xs">Upload</span>
            </button>
          </div>
        </div>

        {/* YouTube Input */}
        {videoType === 'youtube' && (
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">YouTube URL</label>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              onBlur={handleSave}
              className="w-full px-3 py-2 border border-neutral-700 bg-neutral-800 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="https://www.youtube.com/watch?v=..."
            />
            <p className="text-xs text-neutral-500 mt-1">
              Paste any YouTube URL (watch, share, or embed)
            </p>
          </div>
        )}

        {/* Facebook Input */}
        {videoType === 'facebook' && (
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Facebook Video</label>
            <textarea
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              onBlur={handleSave}
              rows={3}
              className="w-full px-3 py-2 border border-neutral-700 bg-neutral-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
              placeholder="Paste Facebook reel URL or entire <iframe> code..."
            />
            <div className="text-xs text-neutral-400 mt-2 space-y-1">
              <p className="font-semibold text-neutral-300">How to get embed code:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Open your Facebook video/reel</li>
                <li>Click the three dots (⋯) → "Embed"</li>
                <li>Copy the entire <code className="bg-neutral-700 px-1 rounded">&lt;iframe&gt;...&lt;/iframe&gt;</code> code</li>
                <li>Paste it here (or just the reel URL works too)</li>
              </ol>
            </div>
          </div>
        )}

        {/* Direct URL Input */}
        {videoType === 'url' && (
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Direct Video URL</label>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              onBlur={handleSave}
              className="w-full px-3 py-2 border border-neutral-700 bg-neutral-800 rounded focus:outline-none focus:ring-2 focus:ring-neutral-900"
              placeholder="https://example.com/video.mp4"
            />
            <p className="text-xs text-neutral-500 mt-1">
              Direct link to MP4, WebM, or other video file
            </p>
          </div>
        )}

        {/* File Upload */}
        {videoType === 'upload' && (
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Upload Video File</label>
            <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center">
              <Upload className="w-10 h-10 mx-auto mb-2 text-neutral-400" />
              <p className="text-sm text-neutral-400 mb-2">
                {videoUrl ? 'Video uploaded' : 'Choose a video file'}
              </p>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileUpload}
                className="hidden"
                id="video-file-upload"
              />
              <label
                htmlFor="video-file-upload"
                className="inline-block px-4 py-2 bg-neutral-900 text-white rounded cursor-pointer hover:bg-neutral-800 transition-colors"
              >
                {videoUrl ? 'Change Video' : 'Choose File'}
              </label>
              <p className="text-xs text-neutral-500 mt-2">
                MP4, WebM, MOV (max 100MB)
              </p>
              {videoUrl && (
                <p className="text-xs text-green-600 mt-2 font-medium">
                  ✓ {videoUrl.split('/').pop()}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Optional Thumbnail */}
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            Custom Thumbnail (Optional)
          </label>
          <input
            type="text"
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
            onBlur={handleSave}
            className="w-full px-3 py-2 border border-neutral-700 bg-neutral-800 rounded focus:outline-none focus:ring-2 focus:ring-neutral-900"
            placeholder="/images/thumbnails/video-thumb.jpg"
          />
          <p className="text-xs text-neutral-500 mt-1">
            Custom thumbnail image (auto-generated if not provided)
          </p>
        </div>

        {/* Preview */}
        {video && (
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Preview</label>
            <div className="aspect-video bg-neutral-900 rounded overflow-hidden">
              {video.type === 'youtube' && (
                <iframe
                  src={video.url}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}

              {video.type === 'facebook' && (
                <iframe
                  src={video.url}
                  title="Facebook video preview"
                  className="w-full h-full"
                  style={{ border: 'none', overflow: 'hidden' }}
                  scrolling="no"
                  frameBorder="0"
                  allowFullScreen={true}
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                />
              )}

              {(video.type === 'url' || video.type === 'upload') && (
                <video
                  src={video.url}
                  controls
                  className="w-full h-full"
                  poster={video.thumbnail}
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-neutral-400">
              <span>Type: {video.type.toUpperCase()}</span>
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 hover:text-neutral-900"
              >
                <span>Open in new tab</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="bg-blue-50 border border-blue-200 rounded p-3">
          <p className="text-xs text-blue-800">
            <strong>💡 Tip:</strong> The video will be displayed as the first thing when customers view this watch.
            Use high-quality videos showcasing the watch from multiple angles.
          </p>
        </div>
      </div>
    </div>
  );
}
