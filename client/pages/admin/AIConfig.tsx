import { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { useToast } from "@/hooks/use-toast";
import { api } from "../../src/utils/api";

interface AIConfig {
  provider: 'gemini' | 'venice';
  geminiApiKey: string;
  veniceApiKey: string;
}

export default function AIConfig() {
  const { toast } = useToast();
  const [config, setConfig] = useState<AIConfig>({
    provider: 'gemini',
    geminiApiKey: '',
    veniceApiKey: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await api.get('/admin/ai-config');
      setConfig({
        provider: response.data.provider,
        geminiApiKey: response.data.geminiApiKey,
        veniceApiKey: response.data.veniceApiKey
      });
    } catch (error) {
      console.error('Error fetching AI config:', error);
      toast({
        title: "Error",
        description: "Failed to load AI configuration",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/admin/ai-config', config);
      
      toast({
        title: "Success",
        description: response.data.message,
      });
      
      // Refresh config to get updated masked keys
      await fetchConfig();
    } catch (error) {
      console.error('Error updating AI config:', error);
      toast({
        title: "Error",
        description: "Failed to update AI configuration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof AIConfig, value: string) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      <AdminSidebar />
      <div className="flex-1 ml-[260px]">
        <div className="p-2 pt-2">
          <div className="h-[66px] border-b border-[#E5E8F1] mb-4">
            <div className="h-[62px] px-0 py-3 rounded-md shadow-[0px_2px_4px_0px_rgba(165,163,174,0.30)] flex items-center">
              <h1 className="text-[#23272E] font-['Public_Sans'] text-2xl font-bold leading-[22px]">
                AI Configuration
              </h1>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#E5E8F1] p-6">
            <h2 className="text-[#23272E] font-['Public_Sans'] text-lg font-semibold mb-6">
              Configure AI Provider
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[#23272E] font-['Public_Sans'] text-sm font-medium mb-2">
                  AI Provider
                </label>
                <select
                  value={config.provider}
                  onChange={(e) => handleInputChange('provider', e.target.value)}
                  className="w-full h-[40px] px-3 border border-[#E5E8F1] rounded-md bg-white text-[#23272E] font-['Public_Sans'] text-sm focus:outline-none focus:ring-2 focus:ring-[#036BF2] focus:border-transparent"
                >
                  <option value="gemini">Google Gemini</option>
                  <option value="venice">Venice AI</option>
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  Choose which AI provider to use for chat responses
                </p>
              </div>

              <div>
                <label className="block text-[#23272E] font-['Public_Sans'] text-sm font-medium mb-2">
                  Gemini API Key
                </label>
                <input
                  type="password"
                  value={config.geminiApiKey}
                  onChange={(e) => handleInputChange('geminiApiKey', e.target.value)}
                  className="w-full h-[40px] px-3 border border-[#E5E8F1] rounded-md bg-white text-[#23272E] font-['Public_Sans'] text-sm focus:outline-none focus:ring-2 focus:ring-[#036BF2] focus:border-transparent"
                  placeholder="Enter Gemini API key"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Your Gemini API key (will be masked for security)
                </p>
              </div>

              <div>
                <label className="block text-[#23272E] font-['Public_Sans'] text-sm font-medium mb-2">
                  Venice API Key
                </label>
                <input
                  type="password"
                  value={config.veniceApiKey}
                  onChange={(e) => handleInputChange('veniceApiKey', e.target.value)}
                  className="w-full h-[40px] px-3 border border-[#E5E8F1] rounded-md bg-white text-[#23272E] font-['Public_Sans'] text-sm focus:outline-none focus:ring-2 focus:ring-[#036BF2] focus:border-transparent"
                  placeholder="Enter Venice API key"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Your Venice API key (will be masked for security)
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-blue-800 font-semibold mb-2">Current Configuration</h3>
                <p className="text-blue-700 text-sm">
                  <strong>Active Provider:</strong> {config.provider === 'gemini' ? 'Google Gemini' : 'Venice AI'}
                </p>
                <p className="text-blue-700 text-sm mt-1">
                  <strong>Status:</strong> {config.provider === 'gemini' ? 
                    (config.geminiApiKey ? 'Gemini API Key Configured' : 'Gemini API Key Missing') :
                    (config.veniceApiKey ? 'Venice API Key Configured' : 'Venice API Key Missing')
                  }
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#036BF2] text-white px-6 py-2 rounded-md hover:bg-[#0256CC] disabled:bg-gray-400 disabled:cursor-not-allowed font-['Public_Sans'] text-sm font-medium"
                >
                  {loading ? "Updating..." : "Update Configuration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 