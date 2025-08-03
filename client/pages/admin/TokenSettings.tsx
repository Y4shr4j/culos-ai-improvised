import { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { api } from "../../src/utils/api";

interface TokenConfig {
  tokenPrice: number;
}

export default function TokenSettings() {
  const [tokenPrice, setTokenPrice] = useState<number>(0.05);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Load current token configuration
  useEffect(() => {
    loadTokenConfig();
  }, []);

  const loadTokenConfig = async () => {
    try {
      const response = await api.get('/admin/token-config');
      setTokenPrice(response.data.tokenPrice);
    } catch (error) {
      console.error('Error loading token config:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await api.post('/admin/token-config', { tokenPrice });
      setTokenPrice(response.data.tokenPrice);
      setMessage({ type: 'success', text: 'Token price updated successfully!' });
    } catch (error) {
      console.error('Error updating token price:', error);
      setMessage({ type: 'error', text: 'Failed to update token price' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      <AdminSidebar />
      <div className="flex-1 ml-[260px]">
        <div className="p-2 pt-2">
          <div className="h-[66px] border-b border-[#E5E8F1] mb-4">
            <div className="h-[62px] px-0 py-3 rounded-md shadow-[0px_2px_4px_0px_rgba(165,163,174,0.30)] flex items-center">
              <h1 className="text-[#23272E] font-['Public_Sans'] text-2xl font-bold leading-[22px]">
                Token Settings
              </h1>
            </div>
          </div>

          {/* Token Configuration Card */}
          <div className="bg-white rounded-lg border border-[#E5E8F1] p-6 shadow-sm">
            <h2 className="text-[#23272E] font-['Public_Sans'] text-lg font-semibold mb-6">
              Token Configuration
            </h2>

            {message && (
              <div className={`mb-4 p-3 rounded-md ${
                message.type === 'success' 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'bg-red-100 text-red-700 border border-red-200'
              }`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="tokenPrice"
                  className="block text-[#23272E] font-['Public_Sans'] text-sm font-medium mb-2"
                >
                  Tokens price
                </label>
                <input
                  type="number"
                  id="tokenPrice"
                  value={tokenPrice}
                  onChange={(e) => setTokenPrice(parseFloat(e.target.value) || 0)}
                  step="0.01"
                  min="0"
                  className="w-full h-[40px] px-3 border border-[#E5E8F1] rounded-md bg-white text-[#23272E] font-['Public_Sans'] text-sm focus:outline-none focus:ring-2 focus:ring-[#036BF2] focus:border-transparent"
                  placeholder="0.05"
                />
              </div>

              <div className="flex justify-start">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#036BF2] text-white px-6 py-2 rounded-md font-['Public_Sans'] text-sm font-medium hover:bg-[#0256d1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Changing..." : "Change"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
