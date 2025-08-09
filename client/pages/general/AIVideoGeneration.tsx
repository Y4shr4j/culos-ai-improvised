import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import {
  ChevronUp,
  ChevronDown,
  HelpCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../src/contexts/AuthContext";
import { api } from "../../src/utils/api";

interface AspectRatio {
  id: string;
  ratio: string;
}

interface CategoryOption {
  id: string;
  label: string;
}

const aspectRatios: AspectRatio[] = [
  { id: "2:3", ratio: "2:3" },
  { id: "3:2", ratio: "3:2" },
  { id: "3:4", ratio: "3:4" },
  { id: "4:3", ratio: "4:3" },
];

interface DynamicCategory {
  _id: string;
  name: string;
  description?: string;
  items: {
    _id: string;
    name: string;
    value: string;
    description?: string;
  }[];
}

const categoryOptions: CategoryOption[] = [
  { id: "option1", label: "Option 1" },
  { id: "option2", label: "Option 2" },
  { id: "option3", label: "Option 3" },
  { id: "option4", label: "Option 4" },
];

function resizeImage(file: File, width: number, height: number): Promise<File> {
  return new Promise((resolve) => {
    const img = new window.Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx!.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          resolve(new File([blob!], file.name, { type: file.type }));
        }, file.type);
      };
      img.src = e.target!.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function AIVideoGeneration() {
  const { user, logout } = useAuth();
  const [advancedExpanded, setAdvancedExpanded] = useState(true);
  const [aspectRatioExpanded, setAspectRatioExpanded] = useState(true);
  const [categoryExpanded, setCategoryExpanded] = useState(true);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState("2:3");
  const [selectedCategory, setSelectedCategory] = useState("option1");
  const [promptText, setPromptText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [tokens, setTokens] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dynamicCategories, setDynamicCategories] = useState<DynamicCategory[]>([]);
  const [selectedCategoryItems, setSelectedCategoryItems] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const response = await api.get('/auth/tokens');
        setTokens(response.data.tokens);
      } catch (error) {
        console.error('Failed to fetch tokens:', error);
      }
    };
    
    if (user) {
      setTokens(user.tokens);
      fetchTokens();
    }
    fetchCategories();
  }, [user]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories?type=video');
      setDynamicCategories(response.data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleLogout = async () => {
    logout();
    window.location.href = "/login";
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      // Always resize to 1024x576 for Stability video API
      const resizedFile = await resizeImage(file, 1024, 576);
      setSelectedImage(resizedFile);
      setImagePreview(URL.createObjectURL(resizedFile));
    } else {
      setSelectedImage(null);
      setImagePreview(null);
    }
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPromptText(e.target.value);
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setGeneratedVideo(null);
    try {
      let imageFile = selectedImage;
      // If no image is uploaded but prompt is provided, generate image first
      if (!imageFile && promptText) {
        // 1. Generate image from prompt
        const imgRes = await api.post('/generate', { prompt: promptText });
        if (!imgRes.data.imageUrl) {
          setError("Failed to generate image from prompt");
          setLoading(false);
          return;
        }
        // Convert base64 to File
        const res = await fetch(imgRes.data.imageUrl);
        const blob = await res.blob();
        imageFile = new File([blob], "generated.png", { type: "image/png" });
        setImagePreview(imgRes.data.imageUrl);
      }
      if (!imageFile) {
        setError("Please upload an image or enter a prompt.");
        setLoading(false);
        return;
      }
      // 2. Send image to /api/generate-video
      const formData = new FormData();
      formData.append("image", imageFile, imageFile.name);
      
      // Add category context to form data
      const categoryContext = Object.entries(selectedCategoryItems)
        .map(([categoryName, itemValue]) => `${categoryName}: ${itemValue}`)
        .join(', ');
      
      if (categoryContext) {
        formData.append("categoryContext", categoryContext);
      }
      
      const response = await api.post('/generate-video', formData);
      if (response.data.videoUrl) {
        setGeneratedVideo(response.data.videoUrl);
      } else {
        setError("Failed to generate video");
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    }
    setLoading(false);
  };

  const handleClear = () => {
    setPromptText("");
    setGeneratedVideo(null);
    setError(null);
    setSelectedImage(null);
    setImagePreview(null);
  };

  return (
<div className="min-h-screen bg-gradient-to-b from-[#2A2A2A] from-[17%] to-[#513238] to-[25%] text-culosai-gold font-norwester text-xl">
{/* Navbar */}
      <Navbar user={user} tokens={tokens} onLogout={handleLogout} />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-28">
        {/* Page Title */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-culosai-cream text-3xl md:text-4xl lg:text-5xl font-norwester">
            Generate Video
          </h1>
        </div>

        {/* Prompt Input */}
        <div className="flex flex-col items-center mb-4">
          <label className="block mb-2 text-culosai-cream text-lg">Prompt (optional):</label>
          <input
            type="text"
            value={promptText}
            onChange={handlePromptChange}
            placeholder="Enter a prompt to generate an image"
            className="mb-4 px-4 py-2 rounded border border-culosai-accent-gold bg-[#171717] text-culosai-cream w-full max-w-md"
          />
        </div>

        {/* Image Upload Area */}
        <div className="flex flex-col items-center mb-8">
          <label className="block mb-2 text-culosai-cream text-lg">Or upload an image to animate:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="mb-4"
          />
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              className="rounded-xl max-w-xs max-h-64 mb-4 border border-culosai-accent-gold"
            />
          )}
        </div>

        {/* Video Preview Area */}
        <div className="bg-[#171717] rounded-3xl p-8 md:p-12 lg:p-16 mb-8 md:mb-12">
          <div className="flex flex-col items-center justify-center min-h-[300px] md:min-h-[400px] lg:min-h-[470px] space-y-8 md:space-y-16">
            {loading && <div className="text-culosai-accent-gold text-xl">Generating...</div>}
            {error && <div className="text-red-500">{error}</div>}
            {generatedVideo ? (
              <div className="flex flex-col items-center gap-4">
                <video controls className="rounded-xl max-w-full max-h-[400px]">
                  <source src={generatedVideo} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <div className="flex gap-4">
                  <a
                    href={generatedVideo}
                    download="generated-video.mp4"
                    className="bg-culosai-accent-gold text-culosai-dark-brown px-6 py-2 rounded-lg font-norwester hover:bg-culosai-accent-gold/80 transition-colors"
                  >
                    Download
                  </a>
                  <button
                    onClick={handleClear}
                    className="bg-gray-700 text-white px-6 py-2 rounded-lg font-norwester hover:bg-gray-600 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center max-w-2xl">
                <p className="text-culosai-cream text-lg md:text-xl lg:text-2xl leading-relaxed">
                  Enter a prompt or upload an image and press "<span className="text-culosai-rust">AI Generate</span>". The AI generated video will appear here.
                </p>
              </div>
            )}
            <div className="flex flex-col items-center gap-2">
              <ChevronDown
                className="text-culosai-cream w-6 h-6"
                strokeWidth={1.5}
              />
              <span className="text-culosai-cream text-sm font-norwester">
                Scroll
              </span>
            </div>
          </div>
        </div>

        {/* Advanced Options */}
        <div className="bg-[#171717] rounded-3xl p-6 md:p-8 mb-6 md:mb-8">
          <div className="space-y-6">
            {/* Advanced Header */}
            <button
              onClick={() => setAdvancedExpanded(!advancedExpanded)}
              className="w-full flex justify-between items-center"
            >
              <h3 className="text-culosai-cream text-base md:text-lg font-norwester">
                Advanced
              </h3>
              <ChevronUp
                className="text-culosai-cream w-6 h-6"
                strokeWidth={2}
              />
            </button>

            {/* Advanced Content */}
            {advancedExpanded && (
              <div className="bg-[#2A2A2A] rounded-xl p-3 md:p-4">
                <textarea
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  className="w-full bg-transparent text-culosai-cream text-sm md:text-base font-norwester placeholder-gray-500 border-none outline-none resize-none min-h-[80px]"
                  placeholder="Enter what you want to see in the video.\nExample:\nA cat playing piano in a jazz bar."
                />
              </div>
            )}

            {/* Divider */}
            <div className="h-px bg-gray-600/30"></div>

            {/* Aspect Ratio */}
            <button
              onClick={() => setAspectRatioExpanded(!aspectRatioExpanded)}
              className="w-full flex justify-between items-center"
            >
              <h3 className="text-culosai-cream text-base md:text-lg font-norwester">
                Aspect Ratio
              </h3>
              <ChevronUp
                className="text-culosai-cream w-6 h-6"
                strokeWidth={2}
              />
            </button>

            {aspectRatioExpanded && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {aspectRatios.map((ratio) => (
                  <button
                    key={ratio.id}
                    onClick={() => setSelectedAspectRatio(ratio.id)}
                    className={`px-2 py-1.5 rounded-lg text-xs md:text-sm font-norwester border transition-colors ${
                      selectedAspectRatio === ratio.id
                        ? "bg-[#FCEDBC] text-[#42100B] border-[#42100B]"
                        : "bg-[#2A2A2A] text-gray-300 border-gray-600/40 hover:border-gray-400"
                    }`}
                  >
                    {ratio.ratio}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Categories Selection */}
        {dynamicCategories.length > 0 && (
          <div className="bg-[#171717] rounded-3xl p-6 md:p-8 mb-8 md:mb-12">
            <div className="space-y-6">
              {/* Category Header */}
              <button
                onClick={() => setCategoryExpanded(!categoryExpanded)}
                className="w-full flex justify-between items-center"
              >
                <h3 className="text-culosai-cream text-base md:text-lg font-norwester">
                  Categories
                </h3>
                <ChevronUp
                  className="text-culosai-cream w-6 h-6"
                  strokeWidth={2}
                />
              </button>

              {/* Dynamic Categories */}
              {categoryExpanded && (
                <div className="space-y-6">
                  {dynamicCategories.map((category) => (
                    <div key={category._id} className="space-y-3">
                      <h4 className="text-culosai-cream text-sm font-norwester">
                        {category.name}
                        {category.description && (
                          <span className="text-gray-400 ml-2">({category.description})</span>
                        )}
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                        {category.items.map((item) => (
                          <button
                            key={item._id}
                            onClick={() => {
                              setSelectedCategoryItems(prev => ({
                                ...prev,
                                [category.name]: item.value
                              }));
                            }}
                            className={`px-2 py-1.5 rounded-lg text-xs font-norwester border transition-colors ${
                              selectedCategoryItems[category.name] === item.value
                                ? "bg-[#FCEDBC] text-[#42100B] border-[#42100B]"
                                : "bg-[#2A2A2A] text-gray-300 border-gray-600/40 hover:border-gray-400"
                            }`}
                          >
                            <span className="truncate">{item.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Floating Generate Button */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={handleGenerate}
            className="px-10 md:px-12 py-3 md:py-4 rounded-[25px] text-xl md:text-2xl font-norwester border border-black"
            style={{ backgroundColor: '#FCEDBC', color: '#42100B' }}
            disabled={loading || (!selectedImage && !promptText)}
          >
            {loading ? "Generating..." : "AI Generate"}
          </button>
        </div>
      </main>
    </div>
  );
}
