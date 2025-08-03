import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../utils/api';

const TOKEN_PACKAGES = [
  { id: 1, tokens: 20, price: 1, bonus: 0, popular: false },
  { id: 2, tokens: 50, price: 2, bonus: 10, popular: false },
  { id: 3, tokens: 120, price: 5, bonus: 40, popular: true },
  { id: 4, tokens: 250, price: 10, bonus: 100, popular: false },
];

const TokenPurchase: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handlePurchase = async (pkg: typeof TOKEN_PACKAGES[0]) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // In a real app, this would integrate with a payment processor like Stripe
      // For now, we'll simulate a successful payment
      const response = await api.post('/api/transactions/purchase-tokens', {
        packageId: pkg.id,
        amount: pkg.price,
        tokens: pkg.tokens + pkg.bonus,
      });

      // Update user's token balance
      if (user) {
        updateUser({ tokens: user.tokens + pkg.tokens + pkg.bonus });
      }

      setSuccess(`Successfully purchased ${pkg.tokens + pkg.bonus} tokens!`);
      setSelectedPackage(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to process payment');
      console.error('Payment error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Buy Tokens</h1>
        <p className="text-gray-600">
          Purchase tokens to unlock exclusive content
        </p>
        {user && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg inline-block">
            <span className="font-medium">Your Balance:</span>{' '}
            <span className="font-bold text-blue-700">{user.tokens} tokens</span>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {TOKEN_PACKAGES.map((pkg) => (
          <div
            key={pkg.id}
            className={`relative rounded-xl border-2 ${
              pkg.popular
                ? 'border-blue-500 transform scale-105 shadow-lg'
                : 'border-gray-200 hover:border-blue-300'
            } bg-white p-6 flex flex-col`}
          >
            {pkg.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                POPULAR
              </div>
            )}

            <div className="flex-1">
              <h3 className="text-2xl font-bold text-center mb-2">
                {pkg.tokens} Tokens
              </h3>
              {pkg.bonus > 0 && (
                <p className="text-green-600 text-center text-sm mb-4">
                  + {pkg.bonus} bonus tokens!
                </p>
              )}
              <div className="text-center mb-6">
                <span className="text-4xl font-bold">${pkg.price}</span>
                <span className="text-gray-500">.00</span>
                <div className="text-sm text-gray-500 mt-1">
                  ${(pkg.price / (pkg.tokens + pkg.bonus)).toFixed(2)} per token
                </div>
              </div>
            </div>

            <button
              onClick={() => handlePurchase(pkg)}
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-medium ${
                pkg.popular
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              } transition-colors`}
            >
              {loading && selectedPackage === pkg.id ? 'Processing...' : 'Buy Now'}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">How it works</h2>
        <ul className="space-y-3">
          <li className="flex items-start">
            <div className="flex-shrink-0 h-6 w-6 text-blue-500">1</div>
            <p>Purchase tokens using any major credit card</p>
          </li>
          <li className="flex items-start">
            <div className="flex-shrink-0 h-6 w-6 text-blue-500">2</div>
            <p>Use tokens to unlock premium content</p>
          </li>
          <li className="flex items-start">
            <div className="flex-shrink-0 h-6 w-6 text-blue-500">3</div>
            <p>Unused tokens never expire</p>
          </li>
        </ul>
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Secure payment processing powered by our payment partner</p>
        <div className="mt-2 flex justify-center space-x-4">
          <span>🔒 256-bit SSL</span>
          <span>💳 All major cards accepted</span>
        </div>
      </div>
    </div>
  );
};

export default TokenPurchase;
