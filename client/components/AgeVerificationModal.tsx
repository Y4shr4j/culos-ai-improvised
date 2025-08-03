import React, { useState, useEffect } from 'react';
import { useAuth } from '../src/contexts/AuthContext';

const AgeVerificationModal: React.FC = () => {
  const { user, verifyAge } = useAuth();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Show modal if user is logged in but hasn't verified age
    if (user && !user.ageVerified) {
      setShowModal(true);
    }
  }, [user]);

  const handleConfirm = async () => {
    try {
      await verifyAge();
      setShowModal(false);
    } catch (error) {
      console.error('Error verifying age:', error);
    }
  };

  const handleDecline = () => {
    // Redirect to a safe page
    window.location.href = 'https://www.google.com';
  };

  if (!showModal) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-culosai-dark-grey border border-yellow-400 rounded-lg p-6 w-full max-w-md">
        <div className="text-center">
          {/* Warning Icon */}
          <div className="mb-4">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="text-yellow-400 mx-auto"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          {/* Title */}
          <h2 className="text-yellow-400 font-norwester text-2xl mb-4">
            Age Verification Required
          </h2>

          {/* Content */}
          <div className="text-yellow-400 font-norwester text-base mb-6 space-y-3">
            <p>
              This website contains content that may not be suitable for
              individuals under 18 years of age.
            </p>
            <p className="text-yellow-400 font-semibold">
              You must be at least 18 years old to access this site.
            </p>
            <p>
              By clicking "I am 18 or older", you confirm that you are of legal
              age to view adult content.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleConfirm}
              className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-norwester py-3 px-6 rounded-lg transition-colors font-semibold"
            >
              I am 18 or older
            </button>
            <button
              onClick={handleDecline}
              className="flex-1 bg-culosai-dark-brown hover:bg-culosai-dark-brown/80 text-yellow-400 font-norwester py-3 px-6 rounded-lg transition-colors border border-yellow-400"
            >
              I am under 18
            </button>
          </div>

          {/* Disclaimer */}
          <p className="text-yellow-400 text-xs mt-4 opacity-80">
            By proceeding, you acknowledge that you are of legal age and
            consent to viewing adult content.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AgeVerificationModal;