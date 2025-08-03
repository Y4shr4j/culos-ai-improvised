import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { Link } from "react-router-dom";
import { Copy, Languages, X, Lock, Unlock } from "lucide-react";
import { get, post } from "../../src/utils/api";
import ImageGallery from "../../components/ImageGallery";
import { useAuth } from "../../src/contexts/AuthContext";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { OnApproveData, CreateOrderData } from "@paypal/paypal-js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

interface FilterOption {
  id: string;
  label: string;
  active: boolean;
}

interface Character {
  id: string;
  name: string;
  description: string;
  image: string;
  username: string;
}

const Dashboard: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null,
  );
  const [copyFeedback, setCopyFeedback] = useState("");
  const [filters, setFilters] = useState<FilterOption[]>([
    { id: "top", label: "Top", active: true },
    { id: "new", label: "New", active: false },
    { id: "all-style", label: "All Style", active: false },
    { id: "specific-style", label: "Specific Style", active: true },
  ]);

  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState<number | null>(null);
  const [isUserBoxOpen, setIsUserBoxOpen] = useState(false);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [unlockingImageId, setUnlockingImageId] = useState<string | null>(null);

  const { logout, user: authUser, token, loading: authLoading } = useAuth();

  // Fetch user data and tokens on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (token && !authLoading) {
          console.log('Fetching user data with token:', token);
          // Fetch user data (includes tokens)
          const userData = await get<any>('/auth/me');
          console.log('User data received:', userData);
          console.log('User tokens:', userData.tokens);
          setTokens(userData.tokens || 0);
          setUser(userData);
        } else {
          console.log('No token available or auth still loading');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [token, authUser, authLoading]);

  // Fetch images on component mount
  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        console.log('Fetching images...');
        const response = await get<any>('/images');
        console.log('Images data received:', response);
        // Handle the response structure: { images: [...] }
        const imagesArray = response.images || response || [];
        console.log('Images array:', imagesArray);
        setImages(imagesArray);
      } catch (error) {
        console.error('Error fetching images:', error);
        setImages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setTokens(null);
      localStorage.removeItem('token');
      window.location.href = "/login";
    } catch (error) {
      console.error('Error logging out:', error);
      localStorage.removeItem('token');
      window.location.href = "/login";
    }
  };

  const characters: Character[] = [
    {
      id: "1",
      name: "Antonio",
      description: "Best friend forever",
      image:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/4b3b8be6723ae33de272509ba68872736ca72896?width=240",
      username: "Username",
    },
    {
      id: "2",
      name: "Poalo",
      description: "Gotic girl",
      image:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/9252c568f666f8bcb0fc01d2edfd52e6a414e4fb?width=240",
      username: "Username",
    },
    {
      id: "3",
      name: "Antonio",
      description: "WW2 Wife",
      image:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/66334eb73fe953bc13cf5d5210370130008bae3f?width=240",
      username: "Username",
    },
    {
      id: "4",
      name: "Luisa",
      description: "Cousin",
      image:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/3541687975b1aa47c41b1a07e3ad590c45ea9b2f?width=240",
      username: "Username",
    },
  ];

  const handleFilterToggle = (filterId: string) => {
    setFilters(
      filters.map((filter) =>
        filter.id === filterId ? { ...filter, active: !filter.active } : filter,
      ),
    );
  };

  const handleCharacterClick = (character: Character) => {
    setSelectedCharacter(character);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCharacter(null);
  };

  const handleCopyPrompts = async () => {
    const promptText =
      "Teemo juega al futbol con una pelota redonda. Mejor calidad, arte digital superdetallado.";
    try {
      await navigator.clipboard.writeText(promptText);
      setCopyFeedback("Copied!");
      setTimeout(() => setCopyFeedback(""), 2000);
    } catch (err) {
      setCopyFeedback("Failed to copy");
      setTimeout(() => setCopyFeedback(""), 2000);
    }
  };

  const tagRows = [
    ["30+", "Looking at Viewer", "Flight Attendant"],
    ["Cheerleader", "Bedroom", "Rear view"],
    ["Smooth Body", "Full Body", "Rear view"],
  ];

  const similarImages = [
    "https://cdn.builder.io/api/v1/image/assets/TEMP/ac8b99854fa69d254d4905ace50eb9116f97e840?width=196",
    "https://cdn.builder.io/api/v1/image/assets/TEMP/2600715ba0f5d2c34105eda96d8a0a154bc61aa1?width=198",
    "https://cdn.builder.io/api/v1/image/assets/TEMP/048c2ee589095aeb762924749191569d7247c6d3?width=196",
  ];

  // Handler to toggle user info box
  const handleUserBoxToggle = () => {
    setIsUserBoxOpen((prev) => !prev);
  };

  // Handler to close user info box when clicking outside
  useEffect(() => {
    if (!isUserBoxOpen) return;
    const handleClick = (e: MouseEvent) => {
      const userBox = document.getElementById("user-info-box");
      const profileBtn = document.getElementById("profile-btn");
      if (
        userBox &&
        !userBox.contains(e.target as Node) &&
        profileBtn &&
        !profileBtn.contains(e.target as Node)
      ) {
        setIsUserBoxOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isUserBoxOpen]);

  // Token packages (same as Index.tsx)
  const tokenPackages = [
    {
      id: "20-tokens",
      tokens: 20,
      price: 1.00, // $1 for 20 tokens (1 token per image)
      image:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/e09c95510744d73cfc34946b0c0d258ff0f301bd?width=200",
    },
    {
      id: "50-tokens",
      tokens: 50,
      price: 2.50, // $2.50 for 50 tokens
      image:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/f62e9b0760abc723b722adfef447297f3c3c46a0?width=200",
    },
    {
      id: "100-tokens",
      tokens: 100,
      price: 5.00, // $5 for 100 tokens
      image:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/596554b5957d7af1cbe3bfc77e88d995b06ba5d8?width=200",
    },
  ];

  const handleTokenPurchase = (packageId: string) => {
    setSelectedPackage(packageId);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async () => {
    // Refresh tokens after successful payment
    const userData = await get<any>("/auth/me");
    setTokens(userData.tokens);
    // Close modal after a short delay
    setTimeout(() => {
      setShowPaymentModal(false);
      setSelectedPackage(null);
    }, 2000);
  };

  const handleUnlockImage = async (imageId: string) => {
    try {
      console.log('Unlocking image:', imageId);
      setUnlockingImageId(imageId);
      
      // Check if image is already unlocked
      const image = images.find(img => img._id === imageId);
      if (image && image.isUnlocked) {
        console.log('Image is already unlocked');
        setUnlockingImageId(null);
        return;
      }
      
      const response = await post(`/images/unlock/${imageId}`);
      console.log('Unlock response:', response);
      
      // Update the image's unlocked status in the local state
      setImages(prevImages =>
        prevImages.map(img =>
          img._id === imageId ? { 
            ...img, 
            isUnlocked: true, 
            isBlurred: false,
            unlockCount: (img.unlockCount || 0) + 1
          } : img
        )
      );
      
      // Refresh tokens
      const userData = await get<any>('/auth/me');
      console.log('Updated user data after unlock:', userData);
      setTokens(userData.tokens);
    } catch (error: any) {
      setUnlockingImageId(null);
      console.error('Error unlocking image:', error);
      
      // Handle specific error cases
      if (error.message && error.message.includes('already unlocked')) {
        // If image is already unlocked, update the local state
        setImages(prevImages =>
          prevImages.map(img =>
            img._id === imageId ? { 
              ...img, 
              isUnlocked: true, 
              isBlurred: false
            } : img
          )
        );
        console.log('Image was already unlocked, updated local state');
      } else if (error.message && error.message.includes('insufficient tokens')) {
        // Handle insufficient tokens error
        alert('You don\'t have enough tokens to unlock this image. Please purchase more tokens.');
      } else {
        // Show error message to user for other errors
        alert('Failed to unlock image. Please try again.');
      }
    } finally {
      setUnlockingImageId(null);
    }
  };

  const handleImageClick = (image: any) => {
    console.log('Image clicked:', image);
    setSelectedImage(image);
    setShowImagePreview(true);
  };

  const handleDownloadImage = async (imageUrl: string, fileName: string, imageId: string) => {
    try {
      // Use backend download endpoint to avoid CORS issues
      const response = await fetch(`${API_BASE_URL}/api/images/download/${imageId}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        // Fallback: open in new tab for manual download
        window.open(imageUrl, '_blank');
      }
    } catch (error) {
      console.error('Error downloading image:', error);
      // Fallback: open in new tab for manual download
      window.open(imageUrl, '_blank');
    }
  };

  const PaymentModal = ({ selectedPackage, onPaymentSuccess, onClose }: {
    selectedPackage: string | null;
    onPaymentSuccess: () => void;
    onClose: () => void;
  }) => {
    const [selectedPayment, setSelectedPayment] = useState("paypal");
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);

    const getSelectedPackageInfo = () => tokenPackages.find(pkg => pkg.id === selectedPackage);

    if (!selectedPackage) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-culosai-cream border border-culosai-brown rounded-[20px] md:rounded-[40px] p-4 md:p-8 w-full max-w-sm md:max-w-2xl">
          <div className="flex flex-col items-center gap-8 md:gap-16">
            {/* Header */}
            <div className="flex flex-col items-start gap-4 md:gap-8 w-full">
              <div className="flex flex-col items-center gap-3 w-full">
                <div className="flex items-center gap-3 w-full">
                  <button
                    onClick={onClose}
                    className="text-culosai-brown hover:text-culosai-dark-brown transition-colors"
                    disabled={paymentLoading}
                  >
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <h2 className="font-norwester text-lg md:text-xl text-culosai-brown text-center flex-1">
                    Buy Tokens
                  </h2>
                </div>
                <p className="font-norwester text-sm md:text-base text-culosai-rust">
                  Select payment method
                </p>
              </div>

              {/* Payment Methods */}
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 md:gap-8 w-full">
                {selectedPayment === "paypal" ? (
                  <div className="w-full">
                    <PayPalButtons
                      style={{ layout: "vertical", color: 'gold', shape: 'rect', label: 'paypal' }}
                      disabled={paymentLoading || !selectedPackage}
                      createOrder={async () => {
                        setPaymentLoading(true);
                        setPaymentError(null);
                        try {
                          const pkg = getSelectedPackageInfo();
                          if (!pkg) throw new Error("Package not found");
                          console.log('Creating PayPal order for package:', pkg);
                          const res = await post<{ id: string }>("/payment/paypal/create-order", {
                            packageId: pkg.id,
                            amount: pkg.price.toFixed(2),
                            currency: "USD"
                          });
                          console.log('PayPal order created:', res);
                          setPaymentLoading(false);
                          return res.id; // PayPal orderID
                        } catch (err: any) {
                          console.error('PayPal order creation failed:', err);
                          setPaymentLoading(false);
                          setPaymentError(err.message || "Failed to create PayPal order");
                          throw err;
                        }
                      }}
                      onApprove={async (data: any) => {
                        setPaymentLoading(true);
                        setPaymentError(null);
                        try {
                          const pkg = getSelectedPackageInfo();
                          if (!pkg) throw new Error("Package not found");
                          console.log('Capturing PayPal order:', data.orderID, 'for package:', pkg.id);
                          await post<any>(
                            "/payment/paypal/capture-order",
                            {
                              orderID: data.orderID,
                              packageId: pkg.id
                            }
                          );
                          console.log('PayPal order captured successfully');
                          setPaymentLoading(false);
                          setPaymentSuccess(true);
                          onPaymentSuccess();
                        } catch (err: any) {
                          console.error('PayPal order capture failed:', err);
                          setPaymentLoading(false);
                          setPaymentError(err.message || "Failed to capture PayPal payment");
                        }
                      }}
                      onError={(err: any) => {
                        setPaymentLoading(false);
                        setPaymentError("PayPal error: " + (err?.message || err));
                      }}
                      onCancel={() => {
                        setPaymentLoading(false);
                        setPaymentError("Payment cancelled");
                      }}
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedPayment("paypal")}
                    className={`flex flex-col items-center justify-center w-full sm:w-[200px] md:w-[228px] h-[120px] md:h-[140px] rounded-xl border-2 transition-all ${selectedPayment === "paypal"
                        ? "border-culosai-dark-brown bg-culosai-selected"
                        : "border-culosai-dark-brown/50 bg-culosai-light-cream hover:border-culosai-dark-brown"
                      }`}
                    disabled={paymentLoading}
                  >
                    {/* Paypal SVG */}
                    <svg width="121" height="34" viewBox="0 0 121 34" fill="none" className="flex-shrink-0">
                      <path
                        d="M14.5033 0.501953H5.10273C4.45933 0.501953 3.9123 0.980941 3.81192 1.63183L0.00987164 26.331C-0.0657482 26.8182 0.302717 27.2578 0.785116 27.2578H5.27312C5.91641 27.2578 6.46344 26.779 6.56381 26.1268L7.58923 19.4651C7.68824 18.8129 8.23663 18.334 8.87856 18.334H11.8545C18.047 18.334 21.6208 15.2637 22.5543 9.17933C22.9748 6.51739 22.572 4.42597 21.3555 2.96123C20.0195 1.35267 17.6497 0.501953 14.5033 0.501953ZM15.5879 9.52303C15.0738 12.9793 12.4965 12.9793 10.0044 12.9793H8.58583L9.58099 6.52454C9.64014 6.13437 9.96997 5.84706 10.3549 5.84706H11.005C12.7026 5.84706 14.3041 5.84706 15.1315 6.83848C15.625 7.4301 15.7762 8.30891 15.5879 9.52303Z"
                        fill="#283B82"
                      />
                      <path
                        d="M14.5033 0.501953H5.10273C4.45933 0.501953 3.9123 0.980941 3.81192 1.63183L0.00987164 26.331C-0.0657482 26.8182 0.302717 27.2578 0.785116 27.2578H5.27312C5.91641 27.2578 6.46344 26.779 6.56381 26.1268L7.58923 19.4651C7.68824 18.8129 8.23663 18.334 8.87856 18.334H11.8545C18.047 18.334 21.6208 15.2637 22.5543 9.17933C22.9748 6.51739 22.572 4.42597 21.3555 2.96123C20.0195 1.35267 17.6497 0.501953 14.5033 0.501953ZM15.5879 9.52303C15.0738 12.9793 12.4965 12.9793 10.0044 12.9793H8.58583L9.58099 6.52454C9.64014 6.13437 9.96997 5.84706 10.3549 5.84706H11.005C12.7026 5.84706 14.3041 5.84706 15.1315 6.83848C15.625 7.4301 15.7762 8.30891 15.5879 9.52303Z"
                        fill="#283B82"
                      />
                      <path
                        d="M14.5033 0.501953H5.10273C4.45933 0.501953 3.9123 0.980941 3.81192 1.63183L0.00987164 26.331C-0.0657482 26.8182 0.302717 27.2578 0.785116 27.2578H5.27312C5.91641 27.2578 6.46344 26.779 6.56381 26.1268L7.58923 19.4651C7.68824 18.8129 8.23663 18.334 8.87856 18.334H11.8545C18.047 18.334 21.6208 15.2637 22.5543 9.17933C22.9748 6.51739 22.572 4.42597 21.3555 2.96123C20.0195 1.35267 17.6497 0.501953 14.5033 0.501953ZM15.5879 9.52303C15.0738 12.9793 12.4965 12.9793 10.0044 12.9793H8.58583L9.58099 6.52454C9.64014 6.13437 9.96997 5.84706 10.3549 5.84706H11.005C12.7026 5.84706 14.3041 5.84706 15.1315 6.83848C15.625 7.4301 15.7762 8.30891 15.5879 9.52303Z"
                        fill="#283B82"
                      />
                    </svg>
                  </button>
                )}
                <button
                  onClick={() => setSelectedPayment("crypto")}
                  className={`flex flex-col items-center justify-center w-full sm:w-[200px] md:w-[228px] h-[120px] md:h-[140px] rounded-xl border transition-all ${selectedPayment === "crypto"
                      ? "border-culosai-dark-brown bg-culosai-selected border-2"
                      : "border-culosai-dark-brown/50 bg-culosai-light-cream hover:border-culosai-dark-brown"
                    }`}
                  disabled={paymentLoading}
                >
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/39faec1ba29b02ea401235473c601b3758a75872?width=274"
                    alt="Crypto accepted"
                    className="w-[100px] h-[65px] md:w-[137px] md:h-[89px] rounded-[14px]"
                  />
                </button>
              </div>
            </div>

            {/* Payment Status Messages */}
            <div className="w-full flex flex-col items-center mt-4 text-center">
              {paymentLoading && <div className="text-culosai-brown mb-2">Processing payment...</div>}
              {paymentSuccess && <div className="text-green-600 mb-2">Payment successful! Tokens credited.</div>}
              {paymentError && <div className="text-red-600 mb-2">{paymentError}</div>}
            </div>

          </div>
        </div>
      </div>
    );
  };

  const ImagePreviewModal = () => {
    console.log('Rendering ImagePreviewModal with selectedImage:', selectedImage);
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
        <div className="bg-culosai-dark-grey border border-culosai-accent-gold rounded-lg p-4 w-full max-w-5xl h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center mb-4 flex-shrink-0">
            <h3 className="text-culosai-cream font-norwester text-lg">
              {selectedImage?.title || 'Image Preview'}
            </h3>
          <button
            onClick={() => setShowImagePreview(false)}
            className="text-culosai-accent-gold hover:text-culosai-cream transition-colors"
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Image Container - Fixed height with scroll if needed */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-4">
          <img
            src={selectedImage?.url}
            alt={selectedImage?.title}
            className="max-w-full max-h-full object-contain"
            style={{
              filter: selectedImage?.isBlurred && !selectedImage?.isUnlocked 
                ? 'blur(8px)' 
                : 'none'
            }}
          />
        </div>
        
        {/* Actions - Always visible at bottom */}
        <div className="flex justify-center gap-4 mt-4 flex-shrink-0">
                      <button
              onClick={() => handleDownloadImage(selectedImage?.url, selectedImage?.title || 'image', selectedImage?._id)}
              className="bg-culosai-accent-gold hover:bg-culosai-accent-gold/80 text-culosai-dark-brown font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
            >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download
          </button>
          
          {selectedImage?.isBlurred && !selectedImage?.isUnlocked && (
            <button
              onClick={async () => {
                await handleUnlockImage(selectedImage._id);
                // Don't close the modal immediately, let the user see the unlocked image
                // The modal will update automatically when the image state changes
              }}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              disabled={unlockingImageId === selectedImage._id}
            >
              <Unlock className="w-4 h-4" />
              {unlockingImageId === selectedImage._id ? 'Unlocking...' : 'Unlock Image'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
  };

  // Show loading state while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2A2A2A] via-[#2A2A2A] to-[#513238] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-culosai-accent-gold mx-auto"></div>
          <p className="mt-4 text-culosai-cream">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2A2A2A] via-[#2A2A2A] to-[#513238] text-white">
      {/* Navbar */}
      <Navbar user={user} tokens={tokens} onLogout={handleLogout} />

      
      {/* Main Content */}
      <main className="px-4 md:px-10 py-8 md:py-20">
        <div className="max-w-6xl mx-auto">
          {/* Feature Cards */}
          <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8 mb-16 justify-center">
            {/* Generate Images Card */}
            <Link to="/aiimagegeneration" className="w-full lg:w-auto">
              <div className="flex flex-col items-center gap-3 p-6 md:p-8 bg-[#813521] rounded-[20px] hover:bg-[#913721] transition-colors w-full lg:w-auto">
                <h2 className="text-culosai-cream font-norwester text-2xl md:text-[32px] text-center">
                  Generate Images
                </h2>
                <div className="flex items-center gap-4">
                  <div className="px-6 py-2 bg-culosai-accent-gold rounded-[25px]">
                    <span className="text-culosai-dark-brown font-norwester text-xl md:text-2xl">
                      generate
                    </span>
                  </div>
                  <svg
                    width="37"
                    height="31"
                    viewBox="0 0 37 31"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M36 27.1V23.797C36 23.124 35.7455 22.4759 35.2876 21.9827L30.7787 17.1259C29.2016 15.4271 26.6446 15.4271 25.0675 17.1259L24.4928 17.7449C23.4377 18.8814 21.6392 18.8814 20.5842 17.7449L15.971 12.7759C14.3939 11.0771 11.8369 11.0771 10.2598 12.7759L1.71237 21.9827C1.25447 22.4759 1 23.124 1 23.797V27.1C1 28.7016 2.20539 30 3.69231 30H33.3077C34.7946 30 36 28.7016 36 27.1Z"
                      fill="#F5EDD0"
                    />
                    <path
                      d="M9.6917 9.75541C12.0567 9.63316 12.2591 12.3867 10.0725 12.716C7.82817 12.8876 7.40079 10.151 9.6917 9.75541Z"
                      fill="#F5EDD0"
                    />
                    <path
                      d="M18.0414 9.75647C20.6581 9.71171 20.9154 12.1247 18.8349 12.7171C16.5304 12.9486 15.8856 10.6584 18.0414 9.75647Z"
                      fill="#F5EDD0"
                    />
                    <path
                      d="M27.1142 9.75491C29.2978 9.53694 29.7267 12.1856 27.5732 12.7155C25.1569 12.8646 24.8049 10.0267 27.1142 9.75491Z"
                      fill="#F5EDD0"
                    />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Generate Videos Card */}
            <Link to="/aivideogeneration" className="w-full lg:w-auto">
              <div className="flex flex-col items-center gap-3 p-6 md:p-8 bg-[#42100B] rounded-[20px] cursor-pointer hover:bg-opacity-90 transition-colors w-full lg:w-auto">
                <h2 className="text-culosai-cream font-norwester text-2xl md:text-[32px] text-center">
                  Generate Videos
                </h2>
                <div className="flex items-center gap-4">
                  <div className="px-6 py-2 bg-culosai-accent-gold rounded-[25px]">
                    <span className="text-culosai-dark-brown font-norwester text-xl md:text-2xl">
                      generate
                    </span>
                  </div>
                  <svg
                    width="41"
                    height="27"
                    viewBox="0 0 41 27"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M27.8077 10.7222L37.005 1.98209C37.9257 1.10714 39.5 1.72682 39.5 2.96419V24.0358C39.5 25.2732 37.9257 25.8929 37.005 25.0179L27.8077 16.2778M5.88462 26H23.4231C25.8446 26 27.8077 24.1345 27.8077 21.8333V5.16667C27.8077 2.86548 25.8446 1 23.4231 1H5.88462C3.46306 1 1.5 2.86548 1.5 5.16667V21.8333C1.5 24.1345 3.46306 26 5.88462 26Z"
                      stroke="#F5EDD0"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Characters Card */}
            <Link to="/chat" className="w-full lg:w-auto">
              <div className="flex flex-col items-center gap-3 p-6 md:p-8 bg-[#463034] rounded-[20px] cursor-pointer hover:bg-opacity-90 transition-colors w-full lg:w-auto">
                <h2 className="text-culosai-cream font-norwester text-2xl md:text-[32px] text-center">
                  Characters
                </h2>
                <div className="flex items-center gap-4">
                  <div className="px-6 py-2 bg-culosai-accent-gold rounded-[25px]">
                    <span className="text-culosai-dark-brown font-norwester text-xl md:text-2xl">
                      generate
                    </span>
                  </div>
                  <svg
                    width="37"
                    height="29"
                    viewBox="0 0 37 29"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M28.9971 0.400391C30.0842 0.399948 31.0694 0.418928 31.9346 0.516602C32.7995 0.614244 33.5511 0.791116 34.1689 1.10742C34.789 1.4249 35.273 1.8825 35.6006 2.53711C35.927 3.18961 36.0954 4.03212 36.0986 5.11523L36.0996 17.1211C36.0996 18.3318 36.0277 19.5273 35.5098 20.5117C34.9876 21.504 34.0216 22.2668 32.2725 22.6348C31.0474 22.8924 29.636 22.7808 28.4014 22.7803L23.4316 22.7764H17.5039C16.8532 23.0916 14.4584 24.5222 12.1689 25.8887C11.0149 26.5774 9.88943 27.2486 9.0332 27.749C8.60544 27.999 8.24396 28.2064 7.97949 28.3525C7.8475 28.4255 7.73852 28.484 7.65723 28.5244C7.61676 28.5445 7.58182 28.5615 7.55371 28.5732C7.53976 28.5791 7.526 28.5839 7.51367 28.5879C7.50291 28.5914 7.48675 28.5964 7.46973 28.5977C7.16496 28.6198 6.9492 28.5019 6.80957 28.3008C6.67574 28.1078 6.61608 27.8451 6.5918 27.5791C6.56731 27.3107 6.57774 27.025 6.59375 26.7764C6.61012 26.5222 6.63179 26.3163 6.63184 26.1885L6.63477 22.7783C5.22404 22.8348 4.15504 22.6585 3.3457 22.2949C2.514 21.9212 1.96198 21.3554 1.59863 20.6621C1.23666 19.9713 1.06329 19.1572 0.979492 18.2891C0.895737 17.421 0.900787 16.4898 0.901367 15.5645L0.900391 6.31738C0.899846 4.46738 1.13451 3.02731 1.99512 2.0293C2.85774 1.02901 4.32709 0.495885 6.73145 0.401367H6.73535L28.9971 0.400391ZM23.6436 1.83008C17.6421 1.83043 11.6341 1.7668 5.63574 1.8291C4.75099 1.96893 4.11801 2.22583 3.66406 2.56152C3.21026 2.8972 2.9292 3.31747 2.75586 3.79395C2.58193 4.27219 2.51609 4.80873 2.49414 5.37695C2.47212 5.94739 2.4944 6.53712 2.49414 7.13184L2.49512 16.3525L2.48242 17.0654C2.47605 17.3054 2.46923 17.5461 2.46973 17.7861C2.47074 18.2668 2.49931 18.7396 2.60547 19.1836V19.1846C2.80715 20.0272 3.22843 20.5346 3.74707 20.8467C4.26992 21.1613 4.89981 21.282 5.52441 21.335C5.83626 21.3614 6.1448 21.3712 6.43555 21.3799C6.72473 21.3886 6.99923 21.3962 7.23828 21.4209C7.47595 21.4454 7.68985 21.4879 7.85449 21.5693C8.02363 21.653 8.14652 21.7816 8.18457 21.9746C8.22478 22.1784 8.22757 22.4061 8.22168 22.627C8.21563 22.8532 8.2009 23.0662 8.20215 23.2617L8.20312 26.4814L13.2539 23.543C14.0787 23.0548 14.644 22.6776 15.0928 22.3838C15.5405 22.0907 15.8781 21.8772 16.2412 21.7266C16.9696 21.4244 17.7913 21.3777 19.8145 21.3779L25.4238 21.3799L29.0332 21.3828C30.0788 21.3829 30.943 21.3606 31.6523 21.2637C32.3618 21.1668 32.9079 20.9969 33.3223 20.707C34.1436 20.1324 34.4884 19.0576 34.4902 16.9922L34.4912 14.2236C34.4923 11.2292 34.5481 8.23089 34.4844 5.24121C34.4661 4.37965 34.3456 3.74088 34.127 3.2666C33.9098 2.79572 33.5936 2.48195 33.1729 2.27051C32.7486 2.05742 32.2135 1.94583 31.5576 1.88867C30.9021 1.83157 30.1345 1.83003 29.2471 1.83008H23.6436Z"
                      fill="#FFEBB6"
                      stroke="#FFEBB6"
                      strokeWidth="0.2"
                    />
                    <path
                      d="M9.6917 9.75541C12.0567 9.63316 12.2591 12.3867 10.0725 12.716C7.82817 12.8876 7.40079 10.151 9.6917 9.75541Z"
                      fill="#FFEBB6"
                    />
                    <path
                      d="M18.0414 9.75647C20.6581 9.71171 20.9154 12.1247 18.8349 12.7171C16.5304 12.9486 15.8856 10.6584 18.0414 9.75647Z"
                      fill="#FFEBB6"
                    />
                    <path
                      d="M27.1142 9.75491C29.2978 9.53694 29.7267 12.1856 27.5732 12.7155C25.1569 12.8646 24.8049 10.0267 27.1142 9.75491Z"
                      fill="#FFEBB6"
                    />
                  </svg>
                </div>
              </div>
            </Link>

            
          </div>

          {/* Content Filters and Character Showcase */}
          <div className="space-y-10">
            {/* Filter Buttons */}
            <div className="flex justify-center">
              <div className="flex items-center gap-4 flex-wrap">
                {filters.map((filter, index) => (
                  <React.Fragment key={filter.id}>
                    <button
                      onClick={() => handleFilterToggle(filter.id)}
                      className={`px-6 py-2 rounded-xl font-norwester text-lg transition-colors ${
                        filter.active
                          ? "bg-culosai-accent-gold text-culosai-dark-brown"
                          : "bg-[#BDD8CD] text-culosai-dark-brown hover:bg-culosai-accent-gold/80"
                      }`}
                    >
                      {filter.label}
                    </button>
                    {index === 1 && (
                      <div className="w-1 h-6 bg-culosai-cream"></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Character Showcase */}
            <div className="flex justify-center">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-14">
                {characters.map((character) => (
                  <div
                    key={character.id}
                    className="flex flex-col items-start gap-4"
                  >
                    <img
                      src={character.image}
                      alt={character.name}
                      className="w-24 h-32 md:w-[120px] md:h-[158px] rounded-md object-cover cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => handleCharacterClick(character)}
                    />
                    <div className="space-y-2">
                      <div>
                        <h3 className="text-culosai-accent-gold font-norwester text-lg md:text-xl">
                          {character.name}
                        </h3>
                        <p className="text-culosai-accent-gold font-norwester text-xs">
                          {character.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <img
                          src="https://cdn.builder.io/api/v1/image/assets/TEMP/b7afd1efe815ab60d76dcb130a792122a7df15ee?width=32"
                          alt="User"
                          className="w-4 h-4 rounded-full"
                        />
                        <span className="text-[#F8C679] font-norwester text-xs">
                          {character.username}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Image Gallery Section */}
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-culosai-cream font-norwester text-2xl md:text-3xl mb-4">
                  Gallery Images
                </h2>
                <p className="text-culosai-accent-gold font-norwester text-sm md:text-base">
                  Unlock images with tokens to remove blur effect
                </p>
              </div>
              
              {loading ? (
                <div className="text-center text-culosai-cream">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-culosai-accent-gold mx-auto"></div>
                  <p className="mt-4">Loading images...</p>
                </div>
              ) : !Array.isArray(images) || images.length === 0 ? (
                <div className="text-center text-culosai-cream">
                  <p className="text-lg">No images found</p>
                  <p className="text-sm text-culosai-accent-gold">Upload some images from the admin panel</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {Array.isArray(images) && images.map((image) => {
                    console.log('Rendering image:', image);
                    console.log('Image data:', {
                      id: image._id,
                      title: image.title,
                      isBlurred: image.isBlurred,
                      isUnlocked: image.isUnlocked,
                      url: image.url,
                      unlockPrice: image.unlockPrice
                    });
                    return (
                    <div key={image._id} className={`relative group overflow-hidden rounded-lg shadow-lg bg-[#171717] ${(!image.isBlurred || image.isUnlocked) ? 'cursor-pointer' : 'cursor-default'}`} onClick={() => {
                      // Only allow clicking if image is unlocked or not blurred
                      if (!image.isBlurred || image.isUnlocked) {
                        handleImageClick(image);
                      }
                    }}>
                      <div 
                        className="relative aspect-square overflow-hidden"
                        style={{
                          filter: image.isBlurred && !image.isUnlocked 
                            ? `blur(8px)` // 80% blur effect
                            : 'none',
                          transition: 'filter 0.3s ease-in-out'
                        }}
                      >
                        <img
                          src={image.url}
                          alt={image.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                          onError={(e) => {
                            console.error('Image failed to load:', image.url);
                            console.error('Image element:', e.currentTarget);
                            console.error('Full image object:', image);
                            e.currentTarget.style.display = 'none';
                          }}
                          onLoad={() => {
                            console.log('Image loaded successfully:', image.url);
                          }}
                        />
                        
                        {image.isBlurred && !image.isUnlocked && (
                          <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center p-4 text-center text-white">
                            <Lock className="w-8 h-8 mb-2" />
                            <p className="font-semibold text-sm">Unlock for {image.unlockPrice || 1} token{(image.unlockPrice || 1) !== 1 ? 's' : ''}</p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent image click
                                handleUnlockImage(image._id);
                              }}
                              className="mt-2 bg-culosai-accent-gold hover:bg-culosai-accent-gold/80 text-culosai-dark-brown font-medium py-1 px-3 rounded-full text-xs transition-colors disabled:opacity-50"
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
                      
                      <div className="p-3">
                        <h3 className="text-culosai-cream font-norwester text-sm font-semibold truncate">
                          {image.title}
                        </h3>
                        <p className="text-culosai-accent-gold font-norwester text-xs">
                          {image.isBlurred ? 'Blurred' : 'Unlocked'}
                        </p>
                      </div>
                    </div>
                  );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Token Purchasing Section */}
      <section className="bg-gradient-to-b from-[#552934] to-[#2A2A2A] px-4 md:px-[217px] py-8 md:py-16">
        <div className="flex flex-col items-center gap-8">
          {/* Title */}
          <h2 className="text-center font-norwester text-2xl md:text-[40px] leading-normal">
            <span className="text-culosai-cream">Need some </span>
            <Link to="/general" className="w-full lg:w-auto">

            <span className="text-[#CD8246]">Milk</span>
            </Link>
            <span className="text-culosai-cream">? Get more</span>
          </h2>

          {/* Token Cards */}
          <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-10">
            {tokenPackages.map((pkg) => (
              <button
                key={pkg.id}
                onClick={() => handleTokenPurchase(pkg.id)}
                className="flex flex-col justify-center items-center gap-3 w-full max-w-[259px] px-8 py-4 rounded-[20px] border border-[#6D6D6D]/20 bg-gradient-to-b from-[#4A262F] to-[#382E30] shadow-[0px_6px_12px_0px_rgba(0,0,0,0.25)] hover:scale-105 transition-transform"
              >
                <div className="text-[#F8C679] font-norwester text-xl text-right w-full">
                  ${pkg.price}
                </div>
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={pkg.image}
                    alt={`${pkg.tokens} tokens`}
                    className="w-[100px] h-[100px]"
                  />
                  <div className="flex flex-col items-center">
                    <div className="text-culosai-cream font-norwester text-[40px] leading-normal text-center">
                      {pkg.tokens}
                    </div>
                    <div className="text-culosai-cream font-norwester text-2xl leading-normal text-center">
                      tokens
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Image Details Modal */}
      {isModalOpen && selectedCharacter && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
        <div className="bg-[#171717] rounded-[20px] w-full max-w-4xl h-auto max-h-[90vh] overflow-hidden flex flex-col lg:flex-row">
            {/* Left side - Character Image */}
            <div className="w-full lg:w-[270px] h-64 lg:h-[521px] flex-shrink-0">
              <img
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/e3647855dc42a41c822e0e00b4951d114a17f789?width=540"
                alt={selectedCharacter.name}
                className="w-full h-full object-cover rounded-t-[20px] lg:rounded-l-[20px] lg:rounded-tr-none"
              />
            </div>

            {/* Right side - Details */}
            <div className="flex-1 p-6 lg:p-8 flex flex-col gap-4 relative">
              {/* Close button */}
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 text-culosai-cream hover:text-culosai-accent-gold transition-colors"
              >
                <X size={24} />
              </button>

              {/* User info and Remix button */}
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <img
                      src="https://cdn.builder.io/api/v1/image/assets/TEMP/99cb9226ac87604e4ec84a80f6e923abb0665d10?width=100"
                      alt="User"
                      className="w-12 h-12 rounded-full"
                    />
                    <span className="text-culosai-cream font-norwester text-xl">
                      Mina Seo
                    </span>
                  </div>
                  <button className="px-8 py-2 bg-[#813521] rounded-[25px] hover:bg-[#913521] transition-colors">
                    <span className="text-culosai-accent-gold font-norwester text-xl">
                      Remix
                    </span>
                  </button>
                </div>
                <div className="w-full h-px bg-[#6D6D6D]/20"></div>
              </div>

              {/* Prompts section */}
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-6">
                    <span className="text-culosai-cream font-norwester text-sm">
                      Prompts
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleCopyPrompts}
                        className="flex items-center gap-1 text-culosai-accent-gold hover:opacity-80 transition-opacity"
                      >
                        <Copy size={16} />
                        <span className="font-norwester text-sm">
                          {copyFeedback || "Copiar prompts"}
                        </span>
                      </button>
                      <Languages
                        size={20}
                        className="text-culosai-accent-gold"
                      />
                    </div>
                  </div>
                  <div className="p-3 bg-[#2A2A2A] rounded-[10px]">
                    <p className="text-[#BCBCBC]/80 font-norwester text-xs leading-relaxed">
                      Teemo juega al futbol con una pelota redonda. Mejor
                      calidad, arte digital superdetallado.
                    </p>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-col gap-2 max-w-[291px]">
                  {tagRows.map((row, rowIndex) => (
                    <div
                      key={rowIndex}
                      className="flex items-center gap-8 p-3 rounded-[10px] bg-[#813521]/20"
                    >
                      {row.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="text-[#F8C679] font-norwester text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Similar images */}
                <div className="flex flex-col gap-3">
                  <span className="text-culosai-cream font-norwester text-base">
                    Similar images
                  </span>
                  <div className="flex items-center gap-4">
                    {similarImages.map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        alt={`Similar ${index + 1}`}
                        className="w-[98px] h-[129px] rounded-md object-cover cursor-pointer hover:opacity-80 transition-opacity"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {showPaymentModal && <PaymentModal 
        selectedPackage={selectedPackage}
        onPaymentSuccess={handlePaymentSuccess}
        onClose={() => setShowPaymentModal(false)}
      />}
      {showImagePreview && <ImagePreviewModal />}
    </div>
  );
};

export default Dashboard;
