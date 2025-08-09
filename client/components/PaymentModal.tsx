import React, { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { post, get } from "../src/utils/api";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPackage: string | null;
  tokenPackages: Array<{
    id: string;
    tokens: number;
    price: number;
    image: string;
  }>;
  onPaymentSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  selectedPackage,
  tokenPackages,
  onPaymentSuccess,
}) => {
  const [selectedPayment, setSelectedPayment] = useState<"paypal" | "crypto" | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  if (!isOpen) return null;

  const selectedPkg = tokenPackages.find((p) => p.id === selectedPackage);

  const createOrder = async () => {
    if (!selectedPkg) return;
    try {
      setPaymentLoading(true);
      const response = await post<{ id: string }>("/paypal/create-order", {
        packageId: selectedPkg.id,
        amount: selectedPkg.price,
        currency: "USD",
      });
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
      onPaymentSuccess();
      onClose();
    } catch (error) {
      console.error("Error capturing PayPal order:", error);
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleContinue = () => {
    if (selectedPayment === "crypto") {
      // Handle crypto payment logic here
      console.log("Processing crypto payment...");
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-[#F4E4BC] rounded-[20px] p-8 w-full max-w-lg relative">
        {/* Price tag */}
        <div className="absolute top-4 right-6 text-[#813521] font-norwester text-lg font-bold">
          ${selectedPkg?.price || '0.00'}
        </div>
        
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-start gap-3">
            <button
              onClick={onClose}
              className="text-[#42100B] hover:text-[#42100B]/80 transition-colors mt-1"
            >
              <ChevronLeft size={20} strokeWidth={2} />
            </button>
            <div className="flex-1">
              <h2 className="font-norwester text-lg text-[#42100B] font-bold">
                Cambio de Paquete
              </h2>
              <p className="font-norwester text-sm text-[#CD8246] uppercase">
                Seleccionar método de pago
              </p>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="flex gap-4">
            {/* PayPal */}
            <button
              onClick={() => setSelectedPayment("paypal")}
              className={`flex-1 flex items-center justify-center h-20 rounded-xl border-2 transition-all ${
                selectedPayment === "paypal"
                  ? "border-[#42100B] bg-[#FCEDBC]"
                  : "border-[#CD8246]/30 bg-[#FCEDBC] hover:border-[#CD8246]"
              }`}
            >
              <div className="text-[#003087] font-bold text-xl italic">PayPal</div>
            </button>

            {/* Crypto */}
            <button
              onClick={() => setSelectedPayment("crypto")}
              className={`flex-1 flex items-center justify-center h-20 rounded-xl border-2 transition-all ${
                selectedPayment === "crypto"
                  ? "border-[#42100B] bg-[#FCEDBC]"
                  : "border-[#CD8246]/30 bg-[#FCEDBC] hover:border-[#CD8246]"
              }`}
            >
              <div className="flex flex-col items-center">
                <div className="text-[#42100B] font-bold text-sm mb-1">CRYPTO</div>
                <div className="flex gap-1">
                  <div className="w-3 h-3 bg-[#F7931A] rounded-full"></div>
                  <div className="w-3 h-3 bg-[#627EEA] rounded-full"></div>
                  <div className="w-3 h-3 bg-[#00D4AA] rounded-full"></div>
                  <div className="w-3 h-3 bg-[#1652F0] rounded-full"></div>
                </div>
                <div className="text-[10px] text-[#42100B]/70 font-medium mt-1">ACCEPTED HERE</div>
              </div>
            </button>
          </div>

          {/* PayPal Buttons */}
          {selectedPayment === "paypal" && (
            <div className="mt-4">
              <PayPalButtons
                style={{ layout: "vertical" }}
                createOrder={createOrder}
                onApprove={onApprove}
                disabled={paymentLoading}
              />
            </div>
          )}

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            disabled={!selectedPayment || paymentLoading}
            className="bg-[#813521] hover:bg-[#813521]/90 text-[#F4E4BC] font-norwester text-base font-bold px-8 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase w-full"
          >
            {paymentLoading ? "Processing..." : "Standard"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;