import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Edit, Trash2, Play, Eye, EyeOff } from "lucide-react";
import React, { useRef, useState, useEffect } from "react";
import { api } from "../../src/utils/api";

interface Video {
  _id: string;
  url: string;
  thumbnailUrl?: string;
  title: string;
  description?: string;
  isBlurred: boolean;
  blurIntensity: number;
  category?: string;
  tags: string[];
  duration: number;
  size: number;
  mimeType: string;
  unlockPrice: number;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export default function UploadVideos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [isBlurred, setIsBlurred] = useState(true);
  const [blurIntensity, setBlurIntensity] = useState(80);
  const [unlockPrice, setUnlockPrice] = useState(1);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch videos on mount
  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/videos");
      setVideos(res.data.videos || []);
    } catch (err: any) {
      setError("Failed to fetch videos");
      console.error("Fetch videos error:", err);
    }
    setLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validate file type
      if (!selectedFile.type.startsWith('video/')) {
        setError('Please select a valid video file');
        return;
      }
      
      // Validate file size (100MB limit)
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (selectedFile.size > maxSize) {
        setError('File size must be less than 100MB');
        return;
      }
      
      setFile(selectedFile);
      setError(null);
      
      // Try to get video duration
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        setDuration(Math.round(video.duration));
        window.URL.revokeObjectURL(video.src);
      };
      video.src = URL.createObjectURL(selectedFile);
    }
  };

  const toggleBlur = async (videoId: string, currentBlur: boolean) => {
    try {
      await api.patch(`/videos/${videoId}/blur`, {
        isBlurred: !currentBlur
      });
      setVideos(videos.map(video => 
        video._id === videoId 
          ? { ...video, isBlurred: !currentBlur } 
          : video
      ));
      setSuccess('Video blur status updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Toggle blur error:', err);
      setError('Failed to update video');
    }
  };

  const deleteVideo = async (videoId: string) => {
    if (!window.confirm('Are you sure you want to delete this video? This action cannot be undone.')) return;
    
    try {
      await api.delete(`/videos/${videoId}`);
      setVideos(videos.filter(video => video._id !== videoId));
      setSuccess('Video deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete video');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a video file');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title || file.name);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("tags", tags);
      formData.append("isBlurred", String(isBlurred));
      formData.append("blurIntensity", String(blurIntensity));
      formData.append("unlockPrice", String(unlockPrice));
      formData.append("duration", String(duration));
      
      await api.post("/videos/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      // Reset form
      setFile(null);
      setTitle("");
      setDescription("");
      setCategory("");
      setTags("");
      setIsBlurred(true);
      setBlurIntensity(80);
      setUnlockPrice(1);
      setDuration(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
      
      // Refresh videos list
      fetchVideos();
      setSuccess('Video uploaded successfully!');
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || "Failed to upload video");
    }
    setLoading(false);
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      <AdminSidebar />
      
      <div className="flex-1 p-8 ml-64">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Upload Videos</h1>
          
          {/* Upload Form */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Upload New Video</h2>
            
            {error && (
              <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded mb-4">
                {success}
              </div>
            )}
            
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video File *
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="video/*"
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    required
                  />
                  {file && (
                    <p className="text-sm text-gray-600 mt-1">
                      Selected: {file.name} ({formatFileSize(file.size)})
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter video title"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter video description"
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g., Entertainment, Educational"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="tag1, tag2, tag3"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unlock Price (tokens)
                  </label>
                  <input
                    type="number"
                    value={unlockPrice}
                    onChange={(e) => setUnlockPrice(parseInt(e.target.value) || 1)}
                    min="0"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={isBlurred}
                      onChange={(e) => setIsBlurred(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Blur video (requires unlock)
                    </span>
                  </label>
                </div>
                
                {isBlurred && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Blur Intensity ({blurIntensity}%)
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={blurIntensity}
                      onChange={(e) => setBlurIntensity(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
              
              {duration > 0 && (
                <div className="text-sm text-gray-600">
                  Duration: {formatDuration(duration)}
                </div>
              )}
              
              <button
                type="submit"
                disabled={loading || !file}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                {loading ? "Uploading..." : "Upload Video"}
              </button>
            </form>
          </div>
          
          {/* Videos List */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Uploaded Videos</h2>
            </div>
            
            <div className="p-6">
              {loading && videos.length === 0 ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading videos...</p>
                </div>
              ) : videos.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No videos uploaded yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videos.map((video) => (
                    <div key={video._id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="relative aspect-video bg-gray-100">
                        <video
                          src={video.url}
                          className="w-full h-full object-cover"
                          preload="metadata"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                          <Play className="w-12 h-12 text-white opacity-80" />
                        </div>
                        {video.isBlurred && (
                          <div className="absolute top-2 left-2">
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                              Blurred
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 truncate">
                          {video.title}
                        </h3>
                        
                        <div className="space-y-1 text-sm text-gray-600 mb-3">
                          <p>Duration: {formatDuration(video.duration)}</p>
                          <p>Size: {formatFileSize(video.size)}</p>
                          <p>Price: {video.unlockPrice} token{video.unlockPrice !== 1 ? 's' : ''}</p>
                          <p>Views: {video.views}</p>
                        </div>
                        
                        {video.category && (
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mb-2">
                            {video.category}
                          </span>
                        )}
                        
                        <div className="flex justify-between items-center">
                          <button
                            onClick={() => toggleBlur(video._id, video.isBlurred)}
                            className={`flex items-center space-x-1 px-3 py-1 rounded text-sm ${
                              video.isBlurred 
                                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {video.isBlurred ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            <span>{video.isBlurred ? 'Blurred' : 'Visible'}</span>
                          </button>
                          
                          <button
                            onClick={() => deleteVideo(video._id)}
                            className="flex items-center space-x-1 px-3 py-1 rounded text-sm bg-red-100 text-red-700 hover:bg-red-200"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}