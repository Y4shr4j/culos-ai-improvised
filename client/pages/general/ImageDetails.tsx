import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Copy, Languages } from "lucide-react";
import Navbar from "../../components/Navbar";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Tag {
  text: string;
}

interface ImageItem {
  _id: string;
  url: string;
  title?: string;
  description?: string;
  isBlurred: boolean;
  isUnlocked?: boolean;
  unlockPrice: number;
  category?: string;
  tags?: string[];
  prompt?: string;
}

const ImageDetails: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState<number | null>(null);
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null);
  const [image, setImage] = useState<ImageItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [similarImages, setSimilarImages] = useState<ImageItem[]>([]);

  useEffect(() => {
    const fetchUser = async () => {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchTokens = async () => {
      const response = await fetch(`${API_BASE_URL}/api/auth/tokens`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setTokens(data.tokens);
      }
    };
    fetchTokens();
  }, []);

  useEffect(() => {
    // Check if PayPal script is already loaded
    if (window.paypal) {
      setPaypalLoaded(true);
      return;
    }

    // If not, create and append the script
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=Af2oJrZa-VH7OnzF3pvNtHhVF044E-9MJ1xWBM6837eYXEN7X-YBfn2fE41vOCug7UwtTYRCnzzmWrVS&currency=USD&debug=true`;
    script.async = true;
    script.onload = () => setPaypalLoaded(true);
    document.body.appendChild(script);

    // Cleanup: remove script if component unmounts
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (paypalLoaded) {
      // Now you can safely use window.paypal
      window.paypal.Buttons({
        // ... your PayPal button config ...
      }).render("#paypal-button-container");
    }
  }, [paypalLoaded]);

  const handleLogout = async () => {
    await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
    setTokens(null);
    window.location.href = "/login";
  };

  const prompt =
    image?.prompt ||
    "Teemo juega al futbol con una pelota redonda. Mejor calidad, arte digital superdetallado.";

  const tagRows: Tag[][] = [
    [
      { text: "30+" },
      { text: "Looking at Viewer" },
      { text: "Flight Attendant" },
    ],
    [{ text: "Cheerleader" }, { text: "Bedroom" }, { text: "Rear view" }],
    [{ text: "Smooth Body" }, { text: "Full Body" }, { text: "Rear view" }],
  ];

  // Load current image details and similar images
  useEffect(() => {
    const loadImageAndSimilar = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams(window.location.search);
        const id = params.get("id");
        if (!id) {
          setImage(null);
          setSimilarImages([]);
          return;
        }

        // Fetch the current image details
        const imageRes = await fetch(`${API_BASE_URL}/api/images/${id}`, {
          credentials: "include",
        });
        if (imageRes.ok) {
          const img: ImageItem = await imageRes.json();
          setImage(img);

          // Fetch images and filter similar
          const listRes = await fetch(`${API_BASE_URL}/api/images?limit=50`, {
            credentials: "include",
          });
          if (listRes.ok) {
            const payload = await listRes.json();
            const all: ImageItem[] = payload.images || payload || [];

            const firstPromptWord = (img.prompt || "").split(/\s+/)[0]?.toLowerCase();
            const similar = all
              .filter((it) => it._id !== img._id)
              .filter((it) => {
                const matchesPrompt = firstPromptWord && it.prompt
                  ? it.prompt.toLowerCase().includes(firstPromptWord)
                  : false;
                const matchesCategory = img.category && it.category
                  ? it.category === img.category
                  : false;
                const matchesTags = img.tags && it.tags
                  ? img.tags.some((t) => it.tags?.includes(t))
                  : false;
                return Boolean(matchesPrompt || matchesCategory || matchesTags);
              })
              .slice(0, 6);

            setSimilarImages(similar);
          } else {
            setSimilarImages([]);
          }
        } else {
          setImage(null);
          setSimilarImages([]);
        }
      } catch (e) {
        setImage(null);
        setSimilarImages([]);
      } finally {
        setLoading(false);
      }
    };

    loadImageAndSimilar();
  }, []);

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setPromptCopied(true);
      setTimeout(() => setPromptCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy prompt:", err);
    }
  };

  const handleRemix = () => {
    console.log("Remixing image with prompt:", prompt);
    // Navigate to AI generation page with this prompt
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2A2A2A] via-[#2A2A2A] to-[#513238] text-white">
      {/* Navbar */}
      <Navbar user={user} tokens={tokens} onLogout={handleLogout} />

      {/* Main Content */}
      <main className="flex justify-center px-4 py-8 md:py-[74px]">
        <div className="w-full max-w-[756px] h-auto md:h-[521px] bg-[#171717] rounded-[20px] flex flex-col md:flex-row overflow-hidden">
          {/* Left side - Main Image */}
          <div className="w-full md:w-[270px] h-[300px] md:h-full">
            {loading ? (
              <div className="w-full h-full bg-[#222] animate-pulse" />
            ) : image ? (
              <img
                src={image.url}
                alt={image.title || "Generated image"}
                className={`w-full h-full object-cover rounded-t-[20px] md:rounded-l-[20px] md:rounded-tr-none ${
                  image.isBlurred && !image.isUnlocked ? "blur-md" : ""
                }`}
              />
            ) : (
              <div className="w-full h-full bg-[#222]" />
            )}
          </div>

          {/* Right side - Content */}
          <div className="flex-1 p-4 md:p-8 space-y-4">
            {/* Header section with character info and remix button */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/99cb9226ac87604e4ec84a80f6e923abb0665d10?width=100"
                    alt="Creator avatar"
                    className="w-12 h-12 rounded-full"
                  />
                  <h1 className="text-culosai-cream font-norwester text-xl">
                    Mina Seo
                  </h1>
                </div>
                <button
                  onClick={handleRemix}
                  className="px-8 py-2 bg-[#813521] rounded-[25px] text-culosai-accent-gold font-norwester text-xl hover:bg-[#913521] transition-colors"
                >
                  Remix
                </button>
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-gray-600/20"></div>
            </div>

            {/* Prompts Section */}
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
                          {promptCopied ? "Copied!" : "Copiar prompts"}
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
                    {prompt}
                  </p>
                </div>
              </div>

              {/* Tags Section */}
              <div className="space-y-2 max-w-[291px]">
                {tagRows.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex flex-wrap gap-2">
                    {row.map((tag, tagIndex) => (
                      <div
                        key={tagIndex}
                        className="px-3 py-2 bg-[#813521]/22 rounded-[10px] text-[#F8C679] font-norwester text-xs"
                      >
                        {tag.text}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Similar Images Section */}
              <div className="space-y-3">
                <h2 className="text-culosai-cream font-norwester text-base">
                  Similar images
                </h2>
                <div className="flex gap-4 overflow-x-auto">
                  {similarImages.map((sim) => (
                    <div key={sim._id} className="flex-shrink-0">
                      <img
                        src={sim.url}
                        alt={sim.title || "Similar image"}
                        className={`w-[98px] h-[129px] object-cover rounded-md hover:opacity-80 transition-opacity cursor-pointer ${
                          sim.isBlurred && !sim.isUnlocked ? "blur-md" : ""
                        }`}
                        onClick={() => {
                          window.location.href = `/imagedetails?id=${sim._id}`;
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ImageDetails;
