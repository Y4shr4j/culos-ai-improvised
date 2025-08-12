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
        className="bg-[#1c1c1c] rounded-xl w-full max-w-5xl h-[90vh] overflow-hidden flex flex-col lg:flex-row shadow-2xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* LEFT IMAGE */}
        <div className="w-full lg:w-1/2 relative">
          <img
            src={currentImage.url}
            alt={currentImage.title || 'AI Generated Image'}
            className={`w-full h-full object-cover ${
              currentImage.isBlurred && !currentImage.isUnlocked ? 'blur-md' : ''
            }`}
          />
        </div>
  
        {/* RIGHT CONTENT */}
        <div className="w-full lg:w-1/2 flex flex-col p-6 overflow-y-auto">
          
          {/* HEADER */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <img
                src="https://via.placeholder.com/40"
                alt="Avatar"
                className="w-10 h-10 rounded-full object-cover"
              />
              <h2 className="text-[#F5D7A3] font-bold text-lg">
                {currentImage.uploadedBy?.name || 'Mina Seo'}
              </h2>
            </div>
            <motion.button
              onClick={handleRemix}
              className="px-5 py-2 bg-[#B5462C] text-white font-semibold rounded-full hover:bg-[#a23e27] transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              REMIX
            </motion.button>
          </div>
  
          {/* HORIZONTAL LINE */}
          <div className="border-b border-gray-700 mb-5"></div>
  
          {/* PROMPT */}
          {currentImage.prompt && (
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[#F5D7A3] text-sm font-medium">Prompts</span>
                <motion.button
                  onClick={handleCopyPrompt}
                  className="flex items-center gap-1 text-[#F5D7A3] text-sm hover:opacity-80"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Copy className="w-4 h-4" />
                  {promptCopied ? "Copied!" : "Copiar prompts"}
                </motion.button>
                <Languages className="w-5 h-5 text-[#F5D7A3] cursor-pointer" />
              </div>
              <div className="bg-[#3a3a3a] text-gray-300 p-3 rounded-lg text-sm">
                {currentImage.prompt}
              </div>
            </div>
          )}
  
          {/* TAGS */}
          {currentImage.tags && currentImage.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {currentImage.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="bg-[#3b261b] text-[#F5D7A3] text-xs px-3 py-1 rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
  
          {/* SIMILAR IMAGES */}
          <div>
            <h3 className="text-[#F5D7A3] font-semibold text-base mb-3">
              Similar Images
            </h3>
            {loadingSimilar ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#F5D7A3]"></div>
              </div>
            ) : similarImages.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {similarImages.slice(0, 3).map((similarImage) => (
                  <div
                    key={similarImage._id}
                    className="aspect-[3/4] rounded-lg overflow-hidden cursor-pointer hover:opacity-80"
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
              <p className="text-gray-500 text-sm">No similar images found</p>
            )}
          </div>


  
        </div>
      </motion.div>
    </motion.div>
  );
  
};

export default ImageDetailsModal; 