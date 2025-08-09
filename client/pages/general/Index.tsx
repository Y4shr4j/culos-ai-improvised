import React, { useState, useEffect } from "react";
import { User, ChevronLeft, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { get, post } from "../../src/utils/api";
import PaymentModal from "../../components/PaymentModal";
import { PayPalButtons } from "@paypal/react-paypal-js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface TokenPackage {
  id: string;
  tokens: number;
  price: number;
  image: string;
}

const tokenPackages: TokenPackage[] = [
  {
    id: "20-tokens",
    tokens: 20,
    price: 9.99,
    image:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/e09c95510744d73cfc34946b0c0d258ff0f301bd?width=200",
  },
  {
    id: "50-tokens",
    tokens: 50,
    price: 24.99,
    image:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/f62e9b0760abc723b722adfef447297f3c3c46a0?width=200",
  },
  {
    id: "100-tokens",
    tokens: 100,
    price: 49.99,
    image:
      "https://cdn.builder.io/api/v1/image/assets/TEMP/596554b5957d7af1cbe3bfc77e88d995b06ba5d8?width=200",
  },
];

const Index: React.FC = () => {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<
    "paypal" | "crypto" | null
  >(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState<number | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await get<any>('/auth/me');
        setUser(userData);
      } catch (error) {
        console.warn('Failed to fetch user:', error);
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const tokenData = await get<any>('/auth/tokens');
        setTokens(tokenData.tokens);
      } catch (error) {
        console.warn('Failed to fetch tokens:', error);
        setTokens(0);
      }
    };
    fetchTokens();
  }, []);

  const createOrder = async () => {
    if (!selectedPackage) return;
    try {
      setPaymentLoading(true);
      const pkg = tokenPackages.find((p) => p.id === selectedPackage);
      if (!pkg) return;

      const response = await post<{ id: string }>("/paypal/create-order", {
        packageId: pkg.id,
        amount: pkg.price,
        currency: "USD",
      });
      setPaypalOrderId(response.id);
      return response.id;
    } catch (error) {
      console.error("Error creating PayPal order:", error);
    } finally {
      setPaymentLoading(false);
    }
  };

  const onApprove = async (data: any) => {
    if (!selectedPackage) return;
    try {
      setPaymentLoading(true);
      await post("/paypal/capture-order", {
        orderID: data.orderID,
        packageId: selectedPackage,
      });
      // Refresh tokens or update UI
      try {
        const tokenData = await get<any>('/auth/tokens');
        setTokens(tokenData.tokens);
      } catch (error) {
        console.warn('Failed to refresh tokens:', error);
      }
      setShowPaymentModal(false);
    } catch (error) {
      console.error("Error capturing PayPal order:", error);
    } finally {
      setPaymentLoading(false);
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
      window.location.href = "/login";
    }
  };

  const handleTokenPurchase = (packageId: string) => {
    setSelectedPackage(packageId);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async () => {
    try {
      const tokenData = await get<any>("/auth/tokens");
      setTokens(tokenData.tokens);
    } catch {
      // ignore
    }
    setShowPaymentModal(false);
    setSelectedPackage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1D1D1D] via-[#1D1D1D] to-[#3E1F24] font-norwester">
      {/* Navbar */}
      <Navbar user={user} tokens={tokens} onLogout={handleLogout} />

      {/* Main Content */}
      <div className="flex flex-col items-center gap-10 mt-16 px-4">
        {/* Title */}
        <h2 className="text-center text-2xl sm:text-3xl lg:text-4xl leading-snug font-norwester">
          <span className="text-[#F4E4BC]">Need some </span>
          <span className="text-[#CD8246]">MILK</span>
          <span className="text-[#F4E4BC]">? Get more</span>
        </h2>

        {/* Token Cards */}
        <div className="flex flex-wrap justify-center gap-8">
          {tokenPackages.map((pkg) => (
            <button
              key={pkg.id}
              onClick={() => handleTokenPurchase(pkg.id)}
              className="flex flex-col items-center w-[220px] sm:w-[240px] md:w-[260px] rounded-2xl bg-gradient-to-b from-[#4A262F] to-[#382E30] shadow-lg p-6 relative hover:scale-105 transition-transform cursor-pointer"
            >
              {/* Price */}
              <div className="absolute top-4 right-4 text-[#F8C679] font-bold text-lg">
                ${pkg.price}
              </div>

              {/* Token Image */}
              <img
                src={pkg.image}
                alt={`${pkg.tokens} tokens`}
                className="w-[80px] h-[80px] sm:w-[90px] sm:h-[90px]"
              />

              {/* Token Amount */}
              <div className="mt-4 text-culosai-cream text-3xl sm:text-4xl">
                {pkg.tokens}
              </div>

              {/* Tokens Label */}
              <div className="text-culosai-cream text-lg tracking-wider uppercase">
                Tokens
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          selectedPackage={selectedPackage}
          tokenPackages={tokenPackages}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default Index;
