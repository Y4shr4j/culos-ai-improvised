import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../utils/api';
import { PencilIcon, TrashIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface Image {
  _id: string;
  url: string;
  title: string;
  isBlurred: boolean;
  blurIntensity: number;
  unlockPrice: number;
  category?: string;
  tags: string[];
}

const AdminPanel: React.FC = () => {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { user } = useAuth();

  // Fetch images
  useEffect(() => {
    if (user?.isAdmin) {
      fetchImages();
    }
  }, [user]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/images');
      setImages(response.data.images);
    } catch (err) {
      setError('Failed to load images');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleBlur = async (imageId: string, currentBlur: boolean) => {
    try {
      await api.put(`/api/images/${imageId}`, {
        isBlurred: !currentBlur
      });
      setImages(images.map(img => 
        img._id === imageId 
          ? { ...img, isBlurred: !currentBlur } 
          : img
      ));
    } catch (err) {
      console.error('Error toggling blur:', err);
      setError('Failed to update image');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('title', (e.currentTarget as any).elements.title?.value || selectedFile.name);
    formData.append('isBlurred', 'true');

    try {
      await api.post('/api/images/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await fetchImages();
      setIsUploadModalOpen(false);
      setSelectedFile(null);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload image');
    }
  };

  const deleteImage = async (imageId: string) => {
    if (!window.confirm('Delete this image?')) return;
    try {
      await api.delete(`/api/images/${imageId}`);
      setImages(images.filter(img => img._id !== imageId));
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete image');
    }
  };

  if (!user?.isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Upload Image
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div>Loading...</div>
        ) : (
          images.map((image) => (
            <div key={image._id} className="border rounded-lg overflow-hidden">
              <div className="relative">
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-48 object-cover"
                  style={{
                    filter: image.isBlurred ? `blur(${image.blurIntensity}px)` : 'none',
                  }}
                />
                <div className="absolute top-2 right-2 flex space-x-1">
                  <button
                    onClick={() => toggleBlur(image._id, image.isBlurred)}
                    className={`p-1 rounded ${
                      image.isBlurred ? 'bg-yellow-500' : 'bg-green-500'
                    } text-white`}
                  >
                    {image.isBlurred ? (
                      <EyeIcon className="w-4 h-4" />
                    ) : (
                      <EyeSlashIcon className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => deleteImage(image._id)}
                    className="p-1 rounded bg-red-500 text-white"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-semibold truncate">{image.title}</h3>
                <div className="text-sm text-gray-600">
                  Blur: {image.isBlurred ? 'Yes' : 'No'}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Upload Image</h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Image File <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full"
                  required
                />
              </div>
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  className="w-full p-2 border rounded"
                  placeholder="Image title"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsUploadModalOpen(false);
                    setSelectedFile(null);
                  }}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                  disabled={!selectedFile}
                >
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
