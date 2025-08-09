import React, { useMemo, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { post } from "../src/utils/api";

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
      const response = await post<{ id: string }>("/payment/paypal/create-order", {
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
      await post("/payment/paypal/capture-order", {
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

  const [paypalSrc, setPaypalSrc] = useState(
    "https://www.paypalobjects.com/images/checkout/clearLogos/PayPal.svg"
  );

  const fallbackPaypalSrc = useMemo(
    () => "https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg",
    []
  );

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
          <div className="flex gap-6">
            {/* PayPal */}
            <button
              onClick={() => setSelectedPayment("paypal")}
              className={`flex-1 flex items-center justify-center h-40 md:h-44 rounded-2xl border transition-all p-4 ${
                selectedPayment === "paypal"
                  ? "border-[#42100B] bg-[#FCEDBC] shadow-sm"
                  : "border-[#CD8246]/40 bg-[#FCEDBC] hover:border-[#CD8246]"
              }`}
            >
              <img
                src={paypalSrc}
                alt="PayPal"
                className="h-10 md:h-12 object-contain"
                draggable={false}
                onError={() => {
                  if (paypalSrc !== fallbackPaypalSrc) {
                    setPaypalSrc(fallbackPaypalSrc);
                  }
                }}
              />
            </button>

            {/* Crypto */}
            <button
              onClick={() => setSelectedPayment("crypto")}
              className={`flex-1 flex items-center justify-center h-40 md:h-44 rounded-2xl border transition-all p-4 ${
                selectedPayment === "crypto"
                  ? "border-[#42100B] bg-[#FCEDBC] shadow-sm"
                  : "border-[#CD8246]/40 bg-[#FCEDBC] hover:border-[#CD8246]"
              }`}
            >
              <img
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/39faec1ba29b02ea401235473c601b3758a75872?width=274"
                alt="Crypto accepted"
                className="h-16 md:h-20 object-contain"
                draggable={false}
              />
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
            {paymentLoading ? "Processing..." : "STANDARD"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;