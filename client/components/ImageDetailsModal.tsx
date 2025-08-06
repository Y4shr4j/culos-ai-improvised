import React, { useState, useEffect } from "react";
import { Copy, Languages, X, Lock, Unlock, Download } from "lucide-react";
import { get } from "../src/utils/api";

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
  user: any;
  tokens: number | null;
  unlockingImageId: string | null;
}

const ImageDetailsModal: React.FC<ImageDetailsModalProps> = ({
  image,
  onClose,
  onUnlock,
  onRemix,
  user,
  tokens,
  unlockingImageId
}) => {
  const [promptCopied, setPromptCopied] = useState(false);
  const [similarImages, setSimilarImages] = useState<Image[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  // Fetch similar images based on prompt or category
  useEffect(() => {
    const fetchSimilarImages = async () => {
      try {
        setLoadingSimilar(true);
        const response = await get<any>('/images');
        const allImages = response.images || response || [];
        
        // Filter similar images based on prompt or category
        const similar = allImages.filter((img: Image) => 
          img._id !== image._id && (
            (image.prompt && img.prompt && img.prompt.toLowerCase().includes(image.prompt.toLowerCase().split(' ')[0])) ||
            (image.category && img.category === image.category) ||
            (image.tags && img.tags && image.tags.some(tag => img.tags?.includes(tag)))
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
  }, [image]);

  const handleCopyPrompt = async () => {
    if (!image.prompt) return;
    
    try {
      await navigator.clipboard.writeText(image.prompt);
      setPromptCopied(true);
      setTimeout(() => setPromptCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy prompt:", err);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = image.title || 'image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
      // Fallback: open in new tab
      window.open(image.url, '_blank');
    }
  };

  const handleUnlock = async () => {
    await onUnlock(image._id);
  };

  const handleRemix = () => {
    onRemix(image);
  };

  // Convert category selections to tags for display
  const categoryTags = image.categorySelections 
    ? Object.entries(image.categorySelections).map(([category, value]) => `${category}: ${value}`)
    : [];

  // Combine tags from image and category selections
  const allTags = [...(image.tags || []), ...categoryTags];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-[#171717] border border-culosai-accent-gold rounded-[20px] w-full max-w-[756px] h-auto md:h-[521px] flex flex-col md:flex-row overflow-hidden">
        {/* Left side - Main Image */}
        <div className="w-full md:w-[270px] h-[300px] md:h-full">
          <img
            src={image.url}
            alt={image.title}
            className="w-full h-full object-cover rounded-t-[20px] md:rounded-l-[20px] md:rounded-tr-none"
            style={{
              filter: image.isBlurred && !image.isUnlocked 
                ? 'blur(8px)' 
                : 'none'
            }}
          />
        </div>

        {/* Right side - Content */}
        <div className="flex-1 p-4 md:p-8 space-y-4 overflow-y-auto">
          {/* Header section with character info and remix button */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-culosai-accent-gold flex items-center justify-center">
                  <span className="text-culosai-dark-brown font-norwester text-lg">
                    {image.uploadedBy?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <h1 className="text-culosai-cream font-norwester text-xl">
                  {image.uploadedBy?.name || 'Unknown User'}
                </h1>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleRemix}
                  className="px-6 py-2 bg-[#813521] rounded-[25px] text-culosai-accent-gold font-norwester text-sm hover:bg-[#913521] transition-colors"
                >
                  Remix
                </button>
                <button
                  onClick={onClose}
                  className="text-culosai-accent-gold hover:text-culosai-cream transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-gray-600/20"></div>
          </div>

          {/* Prompts Section */}
          {image.prompt && (
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                    <span className="text-culosai-cream font-norwester text-sm">
                      Prompts
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleCopyPrompt}
                        className="flex items-center gap-1 text-culosai-accent-gold hover:opacity-80 transition-opacity"
                      >
                        <Copy size={16} />
                        <span className="font-norwester text-sm">
                          {promptCopied ? "Copied!" : "Copy prompts"}
                        </span>
                      </button>
                      <button className="text-culosai-accent-gold hover:opacity-80 transition-opacity">
                        <Languages size={20} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Prompt Text */}
                <div className="w-full p-3 bg-[#2A2A2A] rounded-[10px]">
                  <p className="text-gray-400 font-norwester text-xs leading-relaxed">
                    {image.prompt}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tags Section */}
          {allTags.length > 0 && (
            <div className="space-y-2 max-w-[291px]">
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag, tagIndex) => (
                  <div
                    key={tagIndex}
                    className="px-3 py-2 bg-[#813521]/22 rounded-[10px] text-[#F8C679] font-norwester text-xs"
                  >
                    {tag}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleDownload}
              className="bg-culosai-accent-gold hover:bg-culosai-accent-gold/80 text-culosai-dark-brown font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
            >
              <Download size={16} />
              Download
            </button>
            
            {image.isBlurred && !image.isUnlocked && (
              <button
                onClick={handleUnlock}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                disabled={!user || unlockingImageId === image._id}
              >
                <Unlock size={16} />
                {unlockingImageId === image._id ? 'Unlocking...' : 'Unlock Image'}
              </button>
            )}
          </div>

          {/* Similar Images Section */}
          <div className="space-y-3">
            <h2 className="text-culosai-cream font-norwester text-base">
              Similar images
            </h2>
            {loadingSimilar ? (
              <div className="flex gap-4 overflow-x-auto">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="flex-shrink-0 w-[98px] h-[129px] bg-gray-600 rounded-md animate-pulse"></div>
                ))}
              </div>
            ) : similarImages.length > 0 ? (
              <div className="flex gap-4 overflow-x-auto">
                {similarImages.map((similarImage) => (
                  <div key={similarImage._id} className="flex-shrink-0">
                    <img
                      src={similarImage.url}
                      alt={similarImage.title}
                      className="w-[98px] h-[129px] object-cover rounded-md hover:opacity-80 transition-opacity cursor-pointer"
                      style={{
                        filter: similarImage.isBlurred && !similarImage.isUnlocked 
                          ? 'blur(4px)' 
                          : 'none'
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No similar images found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageDetailsModal; 