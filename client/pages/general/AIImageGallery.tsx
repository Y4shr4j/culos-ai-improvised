import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { Link } from "react-router-dom";
import { get, post } from "../../src/utils/api";
import { useAuth } from "../../src/contexts/AuthContext";
import { Lock, Unlock, Search, Filter } from "lucide-react";
import ImageDetailsModal from "../../components/ImageDetailsModal";
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

interface AIImageGalleryProps {
  embedded?: boolean;
}

const AIImageGallery: React.FC<AIImageGalleryProps> = ({ embedded = false }) => {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [showImageDetails, setShowImageDetails] = useState(false);
  const [unlockingImageId, setUnlockingImageId] = useState<string | null>(null);
  const { user: authUser, token, loading: authLoading } = useAuth();

  const fetchImages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching images from /images endpoint...');
      const response = await get<any>('/images');
      console.log('Images response:', response);
      const imagesArray = response.images || response || [];
      console.log('Images array:', imagesArray);
      setImages(imagesArray);
    } catch (error) {
      console.error("Error fetching images:", error);
      setError("Failed to load images. Please try again later.");
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await get('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setTokens(null);
      window.location.href = '/login';
    }
  };

  const handleUnlockImage = async (imageId: string) => {
    try {
      setUnlockingImageId(imageId);
      await post(`/images/unlock/${imageId}`);
      
      // Update the image's unlocked status in the local state
      setImages(prevImages =>
        prevImages.map(img =>
          img._id === imageId ? { ...img, isUnlocked: true, isBlurred: false } : img
        )
      );
      
      // Update selected image if it's the same one
      if (selectedImage && selectedImage._id === imageId) {
        setSelectedImage(prev => prev ? { ...prev, isUnlocked: true, isBlurred: false } : null);
      }
    } catch (err: any) {
      console.error('Error unlocking image:', err);
      alert(err.message || 'Failed to unlock image');
    } finally {
      setUnlockingImageId(null);
    }
  };

  const handleImageClick = (image: Image) => {
    // Only allow clicking if image is unlocked or not blurred
    if (!image.isBlurred || image.isUnlocked) {
      setSelectedImage(image);
      setShowImageDetails(true);
    }
  };

  const handleCloseImageDetails = () => {
    setShowImageDetails(false);
    setSelectedImage(null);
  };

  const handleRemix = (image: Image) => {
    // Navigate to AI generation page with prefilled data
    const params = new URLSearchParams();
    if (image.prompt) params.append('prompt', image.prompt);
    if (image.categorySelections) {
      Object.entries(image.categorySelections).forEach(([key, value]) => {
        params.append(`category_${key}`, value);
      });
    }
    
    window.location.href = `/aiimagegeneration?${params.toString()}`;
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (token && !authLoading) {
          const userData = await get<any>('/auth/me');
          setUser(userData);
          setTokens(userData.tokens || 0);
        } else {
          setUser(null);
          setTokens(null);
        }
      } catch (error) {
        setUser(null);
        setTokens(null);
      }
    };

    fetchUserData();
  }, [token, authUser, authLoading]);

  useEffect(() => {
    // Ensure we fetch after auth state is resolved so Authorization header is present
    if (!authLoading) {
      fetchImages();
    }
  }, [authLoading, token]);

  if (authLoading) {
    return (
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-culosai-accent-gold mx-auto"></div>
        <p className="mt-4 text-culosai-cream">Loading...</p>
      </div>
    );
  }

  // If embedded, just return the gallery content
  if (embedded) {
    return (
      <div>
        {/* Image Gallery */}
        {loading ? (
          <div className="text-left text-culosai-cream">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-culosai-accent-gold mb-4"></div>
            <p className="mb-6">Loading images...</p>
            
            {/* Loading skeleton */}
            <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-6">
              {[...Array(10)].map((_, index) => (
                <div key={index} className="relative overflow-hidden rounded-lg shadow-lg bg-[#171717] animate-pulse mb-6 break-inside-avoid">
                  <div className="h-48 bg-culosai-dark bg-opacity-50"></div>
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="text-left text-culosai-cream">
            <p className="text-lg text-red-400">{error}</p>
            <button 
              onClick={fetchImages} 
              className="mt-2 px-4 py-2 bg-culosai-accent-gold text-culosai-dark rounded hover:bg-opacity-80 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : images.length === 0 ? (
          <div className="text-left text-culosai-cream">
            <p className="text-lg">No images found</p>
            <p className="text-sm text-culosai-accent-gold">
              Generate some images to get started
            </p>
          </div>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-6">
            {images.map((image) => (
              <motion.div
                key={image._id} 
                className={`relative group overflow-hidden rounded-lg shadow-lg bg-[#171717] mb-6 break-inside-avoid ${(!image.isBlurred || image.isUnlocked) ? 'cursor-pointer' : 'cursor-default'}`} 
                onClick={() => handleImageClick(image)}
                whileHover={{ scale: 1.02, boxShadow: '0 8px 32px 0 rgba(252,237,188,0.10)' }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                    style={{
                      filter: image.isBlurred && !image.isUnlocked 
                        ? `blur(8px)` // 80% blur effect
                        : 'none',
                      transition: 'filter 0.3s ease-in-out'
                    }}
                  />
                  
                  {image.isBlurred && !image.isUnlocked && (
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center p-4 text-center text-white">
                      <Lock className="w-12 h-12 mb-2" />
                      <p className="font-semibold text-sm">Unlock for {image.unlockPrice} token{image.unlockPrice !== 1 ? 's' : ''}</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnlockImage(image._id);
                        }}
                        className="mt-3 bg-culosai-accent-gold hover:bg-culosai-accent-gold/80 text-culosai-dark-brown font-medium py-2 px-4 rounded-full text-sm transition-colors disabled:opacity-50"
                        disabled={!user || unlockingImageId === image._id}
                      >
                        {unlockingImageId === image._id ? 'Unlocking...' : (user ? 'Unlock Image' : 'Login to Unlock')}
                      </button>
                    </div>
                  )}
                  
                  {image.isUnlocked && (
                    <div className="absolute bottom-2 right-2 bg-green-500 text-white p-1 rounded-full">
                      <Unlock className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Image Details Modal */}
        {showImageDetails && selectedImage && (
          <ImageDetailsModal
            image={selectedImage}
            onClose={handleCloseImageDetails}
            onUnlock={handleUnlockImage}
            onRemix={handleRemix}
          />
        )}
      </div>
    );
  }

  // Full page layout
  return (
    <div className={`${embedded ? '' : 'min-h-screen bg-gradient-to-b from-[#2A2A2A] from-[17%] to-[#513238] to-[25%] text-culosai-gold font-norwester text-xl'}`}>
      {!embedded && <Navbar user={user} tokens={tokens} onLogout={handleLogout} />}
      
      <main className={`${embedded ? '' : 'px-4 sm:px-6 lg:px-10 py-6 sm:py-8 lg:py-20'}`}>
        <div className="max-w-7xl mx-auto">
          {/* Gallery Header */}
          {!embedded && (
            <div className="mb-8 sm:mb-12">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-norwester text-culosai-cream mb-4">
                AI Image Gallery
              </h1>
              <p className="text-culosai-gold/80 text-base sm:text-lg">
                Discover and unlock amazing AI-generated images
              </p>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12 sm:py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-culosai-accent-gold mx-auto mb-4"></div>
                <p className="text-culosai-cream text-lg">Loading images...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex items-center justify-center py-12 sm:py-20">
              <div className="text-center">
                <p className="text-red-400 text-lg mb-4">{error}</p>
                <button
                  onClick={fetchImages}
                  className="px-6 py-3 bg-culosai-accent-gold text-culosai-dark-brown font-norwester rounded-lg hover:bg-culosai-accent-gold/80 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Image Grid */}
          {!loading && !error && (
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5 gap-4 sm:gap-6 lg:gap-8">
              {images.map((image) => (
                <motion.div
                  key={image._id}
                  className="group relative bg-[#2A2A2A] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer mb-4 sm:mb-6 lg:mb-8 break-inside-avoid"
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  onClick={() => handleImageClick(image)}
                >
                  {/* Image Container */}
                  <div className="relative overflow-hidden">
                    <img
                      src={image.url}
                      alt={image.title || 'AI Generated Image'}
                      className="w-full h-auto object-cover transition-all duration-300"
                      style={{
                        filter: image.isBlurred && !image.isUnlocked ? 'blur(8px)' : 'none',
                        transition: 'filter 0.3s ease-in-out'
                      }}
                    />
                    
                    {/* Overlay for locked images */}
                    {image.isBlurred && !image.isUnlocked && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="text-center">
                          <Lock className="w-8 h-8 sm:w-12 sm:h-12 text-culosai-accent-gold mx-auto mb-2" />
                          <p className="text-culosai-cream font-norwester text-sm sm:text-base">
                            {image.unlockPrice} tokens to unlock
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Unlock Button for locked images */}
                    {image.isBlurred && !image.isUnlocked && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnlockImage(image._id);
                        }}
                        disabled={unlockingImageId === image._id}
                        className="absolute bottom-2 right-2 bg-culosai-accent-gold text-culosai-dark-brown font-norwester px-3 py-1 sm:px-4 sm:py-2 rounded-lg hover:bg-culosai-accent-gold/80 transition-colors text-sm sm:text-base disabled:opacity-60 min-h-[44px] flex items-center justify-center"
                      >
                        {unlockingImageId === image._id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-culosai-dark-brown"></div>
                        ) : (
                          <>
                            <Unlock className="w-4 h-4 mr-1" />
                            Unlock
                          </>
                        )}
                      </button>
                    )}

                    {/* Unlocked Badge */}
                    {!image.isBlurred || image.isUnlocked ? (
                      <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-norwester flex items-center gap-1">
                        <Unlock className="w-3 h-3" />
                        Unlocked
                      </div>
                    ) : null}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && images.length === 0 && (
            <div className="flex items-center justify-center py-12 sm:py-20">
              <div className="text-center">
                <p className="text-culosai-cream text-lg mb-4">No images found</p>
                <p className="text-culosai-gold/60 text-sm sm:text-base">
                  Start generating images to see them here
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Image Details Modal */}
      {showImageDetails && selectedImage && (
        <ImageDetailsModal
          image={selectedImage}
          onClose={handleCloseImageDetails}
          onUnlock={handleUnlockImage}
          onRemix={handleRemix}
        />
      )}
    </div>
  );
};

export default AIImageGallery; 