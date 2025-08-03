import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';
import { Lock, Unlock } from 'lucide-react';

interface Image {
  _id: string;
  url: string;
  title: string;
  description?: string;
  isBlurred: boolean;
  blurIntensity: number;
  isUnlocked?: boolean;
  unlockPrice: number;
}

const ImageGallery: React.FC = () => {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { user } = useAuth();

  const fetchImages = async (pageNum: number) => {
    try {
      setLoading(true);
      const response = await api.get(`/api/images?page=${pageNum}&limit=12`);
      setImages(prev => [...prev, ...response.data.images]);
      setHasMore(response.data.hasMore);
    } catch (err) {
      setError('Failed to load images');
      console.error('Error fetching images:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages(page);
  }, [page]);

  const handleUnlockImage = async (imageId: string) => {
    try {
      await api.post(`/api/images/unlock/${imageId}`);
      // Update the image's unlocked status in the local state
      setImages(prevImages =>
        prevImages.map(img =>
          img._id === imageId ? { ...img, isUnlocked: true, isBlurred: false } : img
        )
      );
    } catch (err) {
      console.error('Error unlocking image:', err);
      // Handle error (e.g., show a notification)
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Image Gallery</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {images.map((image) => (
          <div key={image._id} className="relative group overflow-hidden rounded-lg shadow-lg">
            <div 
              className="relative aspect-square overflow-hidden"
              style={{
                filter: image.isBlurred && !image.isUnlocked 
                  ? `blur(${image.blurIntensity}px)` 
                  : 'none',
                transition: 'filter 0.3s ease-in-out'
              }}
            >
              <img
                src={image.url}
                alt={image.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                style={{
                  filter: image.isBlurred && !image.isUnlocked 
                    ? `blur(8px)` // 80% blur effect
                    : 'none',
                  transition: 'filter 0.3s ease-in-out'
                }}
                loading="lazy"
              />
              
              {image.isBlurred && !image.isUnlocked && (
                <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center p-4 text-center text-white">
                  <Lock className="w-12 h-12 mb-2" />
                  <p className="font-semibold">Unlock for {image.unlockPrice} token{image.unlockPrice !== 1 ? 's' : ''}</p>
                  <button
                    onClick={() => handleUnlockImage(image._id)}
                    className="mt-3 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-full text-sm transition-colors"
                    disabled={!user}
                  >
                    {user ? 'Unlock Image' : 'Login to Unlock'}
                  </button>
                </div>
              )}
              
              {image.isUnlocked && (
                <div className="absolute bottom-2 right-2 bg-green-500 text-white p-1 rounded-full">
                  <Unlock className="w-4 h-4" />
                </div>
              )}
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-1 truncate">{image.title}</h3>
              {image.description && (
                <p className="text-gray-600 text-sm line-clamp-2">{image.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {!loading && hasMore && (
        <div className="text-center mt-8">
          <button
            onClick={loadMore}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-full transition-colors"
            disabled={loading}
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
