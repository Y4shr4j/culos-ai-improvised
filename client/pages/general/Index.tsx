import React, { useState, useEffect } from "react";
import { User, ChevronLeft, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { post } from "../../src/utils/api";
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
      const response = await fetch(`${API_BASE_URL}/api/auth/tokens`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setTokens(data.tokens);
      }
      setShowPaymentModal(false);
    } catch (error) {
      console.error("Error capturing PayPal order:", error);
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
    setTokens(null);
    window.location.href = "/login";
  };

  const handleTokenPurchase = (packageId: string) => {
    setSelectedPackage(packageId);
    setShowPaymentModal(true);
  };

  const PaymentModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="bg-culosai-cream border border-culosai-brown rounded-[20px] md:rounded-[40px] p-4 md:p-8 w-full max-w-sm md:max-w-2xl">
        <div className="flex flex-col items-center gap-8 md:gap-16">
          {/* Header */}
          <div className="flex flex-col items-start gap-4 md:gap-8 w-full">
            <div className="flex flex-col items-center gap-3 w-full">
              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-culosai-brown hover:text-culosai-dark-brown transition-colors"
                >
                  <ChevronLeft
                    size={20}
                    strokeWidth={3}
                    className="md:w-6 md:h-6"
                  />
                </button>
                <h2 className="font-norwester text-lg md:text-xl text-culosai-brown text-center flex-1">
                  Cambio de Paquete
                </h2>
              </div>
              <p className="font-norwester text-sm md:text-base text-culosai-rust">
                Seleccionar metodo de pago
              </p>
            </div>

            {/* Payment Methods */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 md:gap-8 w-full">
              <div className="w-full">
                <PayPalButtons
                  style={{ layout: "vertical" }}
                  createOrder={createOrder}
                  onApprove={onApprove}
                  disabled={paymentLoading}
                />
              </div>
              <button
                onClick={() => setSelectedPayment("crypto")}
                className={`flex flex-col items-center justify-center w-full sm:w-[200px] md:w-[228px] h-[120px] md:h-[140px] rounded-xl border transition-all ${
                  selectedPayment === "crypto"
                    ? "border-culosai-dark-brown bg-culosai-selected border-2"
                    : "border-culosai-dark-brown/50 bg-culosai-light-cream hover:border-culosai-dark-brown"
                }`}
              >
                <img
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/39faec1ba29b02ea401235473c601b3758a75872?width=274"
                  alt="Crypto accepted"
                  className="w-[100px] h-[65px] md:w-[137px] md:h-[89px] rounded-[14px]"
                />
              </button>
            </div>
          </div>

          {/* Continue Button */}
          <button
            className="bg-culosai-dark-brown hover:bg-culosai-dark-brown/90 text-culosai-cream font-norwester text-xl md:text-2xl px-8 md:px-[70px] py-3 md:py-[14px] rounded-[10px] border border-black transition-all w-full sm:w-auto"
            onClick={() => {
              // Handle payment processing
              setShowPaymentModal(false);
              setSelectedPayment(null);
              setSelectedPackage(null);
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2A2A2A] via-[#2A2A2A] to-[#513238] font-norwester">
      {/* Navbar */}
      <Navbar user={user} tokens={tokens} onLogout={handleLogout} />
      {/* Header Navigation (old header removed) */}
      {/* Mobile Navigation Menu */}
      {showMobileMenu && (
        <div className="xl:hidden bg-culosai-card-dark border-t border-culosai-dark-brown">
          <nav className="flex flex-col gap-4 px-4 py-6 max-w-[1200px] mx-auto">
            <Link
              to="/dashboard"
              onClick={() => setShowMobileMenu(false)}
              className="text-culosai-gold font-norwester text-xl font-normal hover:text-culosai-accent-gold transition-colors py-2"
            >
              Dashboard
            </Link>
            <Link
              to="/ai-images"
              onClick={() => setShowMobileMenu(false)}
              className="text-culosai-gold font-norwester text-xl font-normal hover:text-culosai-accent-gold transition-colors py-2"
            >
              AI Images
            </Link>
            <a
              href="#"
              onClick={() => setShowMobileMenu(false)}
              className="text-culosai-gold font-norwester text-xl font-normal hover:text-culosai-accent-gold transition-colors py-2"
            >
              AI Videos
            </a>
            <a
              href="#"
              onClick={() => setShowMobileMenu(false)}
              className="text-culosai-gold font-norwester text-xl font-normal hover:text-culosai-accent-gold transition-colors py-2"
            >
              AI Character
            </a>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex flex-col items-center gap-6 md:gap-8 px-4 py-8 md:py-12 max-w-[857px] mx-auto">
        {/* Title */}
        <h2 className="font-norwester text-2xl md:text-3xl lg:text-[40px] font-normal text-center leading-normal px-4">
          <span className="text-culosai-cream">Need some </span>
          <span className="text-culosai-rust">Milk</span>
          <span className="text-culosai-cream">? Get more</span>
        </h2>

        {/* Token Cards */}
        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-6 md:gap-8 lg:gap-10 w-full">
          {tokenPackages.map((pkg) => (
            <button
              key={pkg.id}
              onClick={() => handleTokenPurchase(pkg.id)}
              className="group flex flex-col items-center justify-center w-full max-w-[280px] sm:max-w-[240px] lg:w-[259px] p-4 px-[20px] md:px-[30px] py-4 gap-[10px] rounded-xl border border-white/20 token-card-gradient shadow-[0px_6px_12px_0px_rgba(0,0,0,0.25)] hover:shadow-[0px_8px_16px_0px_rgba(0,0,0,0.35)] transition-all duration-300 hover:scale-105"
            >
              {/* Price */}
              <div className="w-full text-right text-culosai-accent-gold font-norwester text-lg md:text-xl font-normal">
                ${pkg.price}
              </div>

              {/* Content */}
              <div className="flex flex-col items-center gap-2">
                <img
                  src={pkg.image}
                  alt={`${pkg.tokens} tokens`}
                  className="w-[80px] h-[80px] md:w-[100px] md:h-[100px] object-contain"
                />

                <div className="flex flex-col items-center">
                  <div className="text-culosai-cream font-norwester text-3xl md:text-[40px] font-normal text-center leading-normal">
                    {pkg.tokens}
                  </div>
                  <div className="text-culosai-cream font-norwester text-xl md:text-2xl font-normal text-center leading-normal">
                    tokens
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </main>

      {/* Payment Modal */}
      {showPaymentModal && <PaymentModal />}
    </div>
  );
};

export default Index;
