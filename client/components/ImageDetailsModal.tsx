import React, { useState, useEffect } from "react";
import { Copy, Languages, X, Lock, Unlock, Download } from "lucide-react";
import { get } from "../src/utils/api";
import { motion } from 'framer-motion';

interface Image {
  _id: string;
  url: string;
  title: string;
  description?: string;
  isBlurred: boolean;
  isUnlocked?: boolean;
  unlockPrice: number;
  category?: string;
  tags?: string[];
  prompt?: string;
  categorySelections?: Record<string, string>;
  uploadedBy?: {
    name: string;
    username: string;
  };
  createdAt: string;
}

interface ImageDetailsModalProps {
  image: Image;
  onClose: () => void;
  onUnlock: (imageId: string) => Promise<void>;
  onRemix: (image: Image) => void;
}

const ImageDetailsModal: React.FC<ImageDetailsModalProps> = ({
  image,
  onClose,
  onUnlock,
  onRemix
}) => {
  const [promptCopied, setPromptCopied] = useState(false);
  const [similarImages, setSimilarImages] = useState<Image[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [currentImage, setCurrentImage] = useState<Image>(image);

  // Keep local image in sync if parent changes it
  useEffect(() => {
    setCurrentImage(image);
  }, [image]);

  // Fetch similar images based on prompt or category
  useEffect(() => {
    const fetchSimilarImages = async () => {
      try {
        setLoadingSimilar(true);
        const response = await get<any>('/images');
        const allImages = response.images || response || [];
        
        // Filter similar images based on prompt or category
        const similar = allImages.filter((img: Image) => 
          img._id !== currentImage._id && (
            (currentImage.prompt && img.prompt && img.prompt.toLowerCase().includes(currentImage.prompt.toLowerCase().split(' ')[0])) ||
            (currentImage.category && img.category === currentImage.category) ||
            (currentImage.tags && img.tags && currentImage.tags.some(tag => img.tags?.includes(tag)))
          )
        ).slice(0, 6); // Limit to 6 similar images
        
        setSimilarImages(similar);
      } catch (error) {
        console.error('Error fetching similar images:', error);
      } finally {
        setLoadingSimilar(false);
      }
    };

    fetchSimilarImages();
  }, [currentImage]);

  const handleCopyPrompt = async () => {
    if (!currentImage.prompt) return;
    
    try {
      await navigator.clipboard.writeText(currentImage.prompt);
      setPromptCopied(true);
      setTimeout(() => setPromptCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy prompt:", err);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(currentImage.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = currentImage.title || 'image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download image:", error);
    }
  };

  const handleUnlock = async () => {
    await onUnlock(currentImage._id);
  };

  const handleRemix = () => {
    onRemix(currentImage);
    onClose();
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-[#171717] rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col lg:flex-row shadow-2xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-culosai-cream hover:bg-black/70 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Image Section */}
        <div className="w-full lg:w-1/2 h-64 sm:h-80 lg:h-full relative">
          <img
            src={currentImage.url}
            alt={currentImage.title || 'AI Generated Image'}
            className={`w-full h-full object-cover ${
              currentImage.isBlurred && !currentImage.isUnlocked ? 'blur-md' : ''
            }`}
          />
          
          {/* Overlay for locked images */}
          {currentImage.isBlurred && !currentImage.isUnlocked && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-center">
                <Lock className="w-12 h-12 sm:w-16 sm:h-16 text-culosai-accent-gold mx-auto mb-4" />
                <p className="text-culosai-cream font-norwester text-lg sm:text-xl">
                  {currentImage.unlockPrice} tokens to unlock
                </p>
              </div>
            </div>
          )}

          {/* Unlocked Badge */}
          {!currentImage.isBlurred || currentImage.isUnlocked ? (
            <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-lg text-sm font-norwester flex items-center gap-2">
              <Unlock className="w-4 h-4" />
              Unlocked
            </div>
          ) : null}
        </div>

        {/* Content Section */}
        <div className="w-full lg:w-1/2 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-culosai-cream font-norwester text-xl sm:text-2xl lg:text-3xl mb-2">
              {currentImage.title || 'AI Generated Image'}
            </h2>
            {currentImage.uploadedBy && (
              <p className="text-culosai-gold/60 text-sm sm:text-base">
                By {currentImage.uploadedBy.name}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            <motion.button
              onClick={handleRemix}
              className="flex items-center gap-2 px-4 py-3 bg-culosai-accent-gold text-culosai-dark-brown font-norwester rounded-lg hover:bg-culosai-accent-gold/80 transition-colors text-sm sm:text-base min-h-[44px]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Remix
            </motion.button>

            <motion.button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-3 bg-culosai-dark-brown text-culosai-cream font-norwester rounded-lg hover:bg-culosai-dark-brown/80 transition-colors text-sm sm:text-base min-h-[44px]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download className="w-4 h-4" />
              Download
            </motion.button>

            {currentImage.isBlurred && !currentImage.isUnlocked && (
              <motion.button
                onClick={handleUnlock}
                className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white font-norwester rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base min-h-[44px]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Unlock className="w-4 h-4" />
                Unlock ({currentImage.unlockPrice} tokens)
              </motion.button>
            )}
          </div>

          {/* Prompt Section */}
          {currentImage.prompt && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-culosai-cream font-norwester text-lg sm:text-xl">Prompt</h3>
                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={handleCopyPrompt}
                    className="flex items-center gap-1 text-culosai-accent-gold hover:opacity-80 transition-opacity text-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Copy className="w-4 h-4" />
                    {promptCopied ? "Copied!" : "Copy"}
                  </motion.button>
                  <Languages className="w-5 h-5 text-culosai-accent-gold" />
                </div>
              </div>
              <div className="p-4 bg-[#2A2A2A] rounded-lg">
                <p className="text-culosai-gold/80 text-sm sm:text-base leading-relaxed">
                  {currentImage.prompt}
                </p>
              </div>
            </div>
          )}

          {/* Description */}
          {currentImage.description && (
            <div className="mb-6">
              <h3 className="text-culosai-cream font-norwester text-lg sm:text-xl mb-3">Description</h3>
              <p className="text-culosai-gold/70 text-sm sm:text-base leading-relaxed">
                {currentImage.description}
              </p>
            </div>
          )}

          {/* Tags */}
          {currentImage.tags && currentImage.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-culosai-cream font-norwester text-lg sm:text-xl mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {currentImage.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-culosai-accent-gold/20 text-culosai-accent-gold text-sm px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Category Selections */}
          {currentImage.categorySelections && Object.keys(currentImage.categorySelections).length > 0 && (
            <div className="mb-6">
              <h3 className="text-culosai-cream font-norwester text-lg sm:text-xl mb-3">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(currentImage.categorySelections).map(([key, value]) => (
                  <span
                    key={key}
                    className="bg-culosai-dark-brown/50 text-culosai-cream text-sm px-3 py-1 rounded-full"
                  >
                    {key}: {value}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Similar Images */}
          <div className="mb-6">
            <h3 className="text-culosai-cream font-norwester text-lg sm:text-xl mb-3">Similar Images</h3>
            {loadingSimilar ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-culosai-accent-gold"></div>
              </div>
            ) : similarImages.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {similarImages.map((similarImage) => (
                  <div
                    key={similarImage._id}
                    className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setCurrentImage(similarImage)}
                  >
                    <img
                      src={similarImage.url}
                      alt={similarImage.title || 'Similar Image'}
                      className={`w-full h-full object-cover ${
                        similarImage.isBlurred && !similarImage.isUnlocked ? 'blur-md' : ''
                      }`}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-culosai-gold/60 text-sm sm:text-base">No similar images found</p>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ImageDetailsModal; 