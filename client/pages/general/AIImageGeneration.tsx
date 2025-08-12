import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import {
  ChevronUp,
  ChevronDown,
  HelpCircle,
  Menu,
  X,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../../src/utils/api";
import { useAuth } from "../../src/contexts/AuthContext";
import { motion } from 'framer-motion';

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
  { id: "16:9", ratio: "16:9" },
  { id: "9:16", ratio: "9:16" },
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
  { id: "option5", label: "Option 5" },
  { id: "option6", label: "Option 6" },
  { id: "option7", label: "Option 7" },
  { id: "option8", label: "Option 8" },
  { id: "option9", label: "Option 9" },
  { id: "option10", label: "Option 10" },
  { id: "option11", label: "Option 11" },
  { id: "option12", label: "Option 12" },
  { id: "option13", label: "Option 13" },
  { id: "option14", label: "Option 14" },
  { id: "option15", label: "Option 15" },
  { id: "option16", label: "Option 16" },
  { id: "option17", label: "Option 17" },
  { id: "option18", label: "Option 18" },
  { id: "option19", label: "Option 19" },
  { id: "option20", label: "Option 20" },
];

export default function AIImageGeneration() {
  const { user, logout } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [advancedExpanded, setAdvancedExpanded] = useState(true);
  const [aspectRatioExpanded, setAspectRatioExpanded] = useState(true);
  const [categoryExpanded, setCategoryExpanded] = useState(true);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState("2:3");
  const [selectedCategory, setSelectedCategory] = useState("option1");
  const [promptText, setPromptText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [tokens, setTokens] = useState<number | null>(null);
  const [dynamicCategories, setDynamicCategories] = useState<DynamicCategory[]>([]);
  const [selectedCategoryItems, setSelectedCategoryItems] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setTokens(user.tokens);
    }
    fetchCategories();
    
    // Handle URL parameters for remix functionality
    const urlParams = new URLSearchParams(window.location.search);
    const remixPrompt = urlParams.get('prompt');
    if (remixPrompt) {
      setPromptText(remixPrompt);
    }
    
    // Handle category selections from URL
    const categoryParams = Array.from(urlParams.entries())
      .filter(([key]) => key.startsWith('category_'))
      .reduce((acc, [key, value]) => {
        const categoryName = key.replace('category_', '');
        acc[categoryName] = value;
        return acc;
      }, {} as Record<string, string>);
    
    if (Object.keys(categoryParams).length > 0) {
      setSelectedCategoryItems(categoryParams);
    }
  }, [user]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories?type=image');
      setDynamicCategories(response.data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleLogout = async () => {
    logout();
    window.location.href = "/login";
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setGeneratedImage(null);
    
    try {
      // Validate input
      if (!promptText.trim()) {
        setError("Please enter a prompt to generate an image");
        setLoading(false);
        return;
      }

      // Build category context from selected items
      const categoryContext = Object.entries(selectedCategoryItems)
        .map(([categoryName, itemValue]) => `${categoryName}: ${itemValue}`)
        .join(', ');
      
      const enhancedPrompt = categoryContext 
        ? `${promptText} ${categoryContext}`.trim()
        : promptText;

      console.log('Sending generation request with:', {
        prompt: enhancedPrompt,
        aspectRatio: selectedAspectRatio,
        category: selectedCategory,
        type: "image",
        categorySelections: selectedCategoryItems,
      });

      const response = await api.post("/generate", {
        prompt: enhancedPrompt,
        aspectRatio: selectedAspectRatio,
        category: selectedCategory,
        type: "image",
        categorySelections: selectedCategoryItems,
      });
      
      console.log('Generation response:', response.data);
      setGeneratedImage(response.data.imageUrl);
    } catch (err: any) {
      console.error('Generation error:', err);
      
      // Provide more specific error messages
      if (err.response?.status === 400) {
        if (err.response?.data?.message?.includes('tokens')) {
          setError("Not enough tokens. Please purchase more tokens to generate images.");
        } else if (err.response?.data?.message?.includes('Prompt')) {
          setError("Please enter a valid prompt to generate an image.");
        } else {
          setError(err.response?.data?.message || "Invalid request. Please check your input.");
        }
      } else if (err.response?.status === 401) {
        setError("Authentication failed. Please log in again.");
      } else if (err.response?.status === 500) {
        const errorMessage = err.response?.data?.message;
        if (errorMessage?.includes('API key')) {
          setError("AI service configuration error. Please contact support.");
        } else if (errorMessage?.includes('AWS')) {
          setError("Storage service error. Please contact support.");
        } else if (errorMessage?.includes('rate limit')) {
          setError("Service is busy. Please try again in a few minutes.");
        } else {
          setError(errorMessage || "Server error. Please try again later.");
        }
      } else {
        setError("Network error. Please check your connection and try again.");
      }
    }
    setLoading(false);
  };

  const handleClear = () => {
    setPromptText("");
    setGeneratedImage(null);
    setError(null);
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
            Generate Image
          </h1>
        </div>

        {/* Image Preview Area */}
        <div className="bg-[#171717] rounded-3xl p-8 md:p-12 lg:p-16 mb-8 md:mb-12">
          <div className="flex flex-col items-center justify-center min-h-[300px] md:min-h-[400px] lg:min-h-[470px] space-y-8 md:space-y-16">
            {loading && <div className="text-culosai-accent-gold text-xl">Generating...</div>}
            {error && <div className="text-red-500">{error}</div>}
            {generatedImage ? (
              <div className="flex flex-col items-center gap-4">
                <img src={generatedImage} alt="Generated" className="rounded-xl max-w-full max-h-[400px]" />
                <div className="flex gap-4">
                  <a
                    href={generatedImage}
                    download="generated-image.png"
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
                  Select from the options below and press "
                  <span className="text-culosai-rust">AI Generate</span>
                  ". The AI generated image will appear here.
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
                  placeholder="Enter what you want to see.&#10;Example:&#10;A beautiful landscape with mountains and sunset."
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
                  <motion.button
                    key={ratio.id}
                    onClick={() => setSelectedAspectRatio(ratio.id)}
                    className={`px-2 py-1.5 rounded-lg text-xs font-norwester border transition-colors ${
                      selectedAspectRatio === ratio.id
                        ? "bg-[#FCEDBC] text-[#42100B] border-[#42100B]"
                        : "bg-[#2A2A2A] text-gray-300 border-gray-600/40 hover:border-gray-400"
                    }`}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.12, ease: 'easeOut' }}
                  >
                    {ratio.ratio}
                  </motion.button>
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
                          <motion.button
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
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ duration: 0.12, ease: 'easeOut' }}
                          >
                            <span className="truncate">{item.name}</span>
                          </motion.button>
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
          <motion.button
            onClick={handleGenerate}
            className="px-10 md:px-12 py-3 md:py-4 rounded-[25px] text-xl md:text-2xl font-norwester border border-black"
            style={{ backgroundColor: '#FCEDBC', color: '#42100B' }}
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
          >
            {loading ? "Generating..." : "AI Generate"}
          </motion.button>
        </div>
      </main>
    </div>
  );
}
