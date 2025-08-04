import { useState, useEffect } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { useToast } from "@/hooks/use-toast";
import { api } from "../../src/utils/api";
import { 
  Eye, 
  EyeOff, 
  Key, 
  Shield, 
  CreditCard, 
  MessageSquare, 
  Image, 
  Database,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface APISettings {
  aiProvider: 'gemini' | 'venice';
  geminiApiKey: string;
  veniceApiKey: string;
  stabilityApiKey: string;
  googleClientId: string;
  googleClientSecret: string;
  facebookAppId: string;
  facebookAppSecret: string;
  paypalClientId: string;
  paypalClientSecret: string;
  stripeSecretKey: string;
  stripePublishableKey: string;
  mongodbUri: string;
  jwtSecret: string;
  lastUpdated: string;
  updatedBy: {
    name: string;
    email: string;
  };
}

export default function ApiSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<APISettings>({
    aiProvider: 'gemini',
    geminiApiKey: '',
    veniceApiKey: '',
    stabilityApiKey: '',
    googleClientId: '',
    googleClientSecret: '',
    facebookAppId: '',
    facebookAppSecret: '',
    paypalClientId: '',
    paypalClientSecret: '',
    stripeSecretKey: '',
    stripePublishableKey: '',
    mongodbUri: '',
    jwtSecret: '',
    lastUpdated: '',
    updatedBy: { name: '', email: '' }
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/api-settings');
      setSettings(response.data.settings);
    } catch (error) {
      console.error('Error fetching API settings:', error);
      toast({
        title: "Error",
        description: "Failed to load API settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await api.post('/admin/api-settings', settings);
      
      toast({
        title: "Success",
        description: "API settings updated successfully",
      });
      
      // Refresh settings to get updated masked values
      await fetchSettings();
    } catch (error) {
      console.error('Error updating API settings:', error);
      toast({
        title: "Error",
        description: "Failed to update API settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof APISettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleSecretVisibility = (field: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const isFieldConfigured = (value: string) => {
    return value && value.length > 4 && !value.startsWith('***');
  };

  const getFieldStatus = (value: string) => {
    if (!value) return { status: 'empty', icon: AlertCircle, color: 'text-gray-400' };
    if (value.startsWith('***')) return { status: 'configured', icon: CheckCircle, color: 'text-green-500' };
    return { status: 'editing', icon: CheckCircle, color: 'text-blue-500' };
  };

  const renderField = (
    label: string,
    field: keyof APISettings,
    type: string = 'text',
    placeholder: string = '',
    icon?: React.ReactNode,
    description?: string
  ) => {
    const value = settings[field] as string;
    const fieldStatus = getFieldStatus(value);
    const isSecret = type === 'password';
    const showSecret = showSecrets[field];

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-[#1A1A1A] font-['Public_Sans'] text-sm font-medium">
            {icon}
            {label}
          </label>
          <div className="flex items-center gap-2">
            <fieldStatus.icon className={`w-4 h-4 ${fieldStatus.color}`} />
            {isSecret && (
              <button
                type="button"
                onClick={() => toggleSecretVisibility(field)}
                className="text-gray-500 hover:text-gray-700"
              >
                {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>
        
        <input
          type={isSecret && !showSecret ? 'password' : 'text'}
          value={value}
          onChange={(e) => handleInputChange(field, e.target.value)}
          className="w-full h-[40px] px-3 border border-[#E5E8F1] rounded-md bg-white text-[#1A1A1A] font-['Public_Sans'] text-sm focus:outline-none focus:ring-2 focus:ring-[#036BF2] focus:border-transparent"
          placeholder={placeholder}
        />
        
        {description && (
          <p className="text-xs text-gray-500">{description}</p>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex">
        <AdminSidebar />
        <div className="flex-1 ml-[260px] flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-[#036BF2] mx-auto mb-4" />
            <p className="text-gray-600">Loading API settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      <AdminSidebar />
      <div className="flex-1 ml-[260px]">
        <div className="p-6">
          {/* Header */}
          <div className="h-[66px] border-b border-[#E5E8F1] mb-6">
            <div className="h-[62px] px-0 py-3 rounded-md shadow-[0px_2px_4px_0px_rgba(165,163,174,0.30)] flex items-center justify-between">
              <h1 className="text-[#23272E] font-['Public_Sans'] text-2xl font-bold leading-[22px]">
                API Settings
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Last updated: {new Date(settings.lastUpdated).toLocaleString()}</span>
                <span>by {settings.updatedBy.name}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* AI Provider Configuration */}
            <div className="bg-white rounded-lg border border-[#E5E8F1] p-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-[#036BF2]" />
                <h2 className="text-[#1A1A1A] font-['Public_Sans'] text-lg font-semibold">
                  AI Provider Configuration
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[#1A1A1A] font-['Public_Sans'] text-sm font-medium mb-2">
                    Active AI Provider
                  </label>
                  <select
                    value={settings.aiProvider}
                    onChange={(e) => handleInputChange('aiProvider', e.target.value)}
                    className="w-full h-[40px] px-3 border border-[#E5E8F1] rounded-md bg-white text-[#1A1A1A] font-['Public_Sans'] text-sm focus:outline-none focus:ring-2 focus:ring-[#036BF2] focus:border-transparent"
                  >
                    <option value="gemini">Google Gemini</option>
                    <option value="venice">Venice AI</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Choose which AI provider to use for chat responses
                  </p>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-blue-800 font-semibold mb-2">Current Status</h3>
                  <p className="text-blue-700 text-sm">
                    <strong>Active Provider:</strong> {settings.aiProvider === 'gemini' ? 'Google Gemini' : 'Venice AI'}
                  </p>
                  <p className="text-blue-700 text-sm mt-1">
                    <strong>Status:</strong> {settings.aiProvider === 'gemini' ? 
                      (isFieldConfigured(settings.geminiApiKey) ? 'Gemini API Key Configured' : 'Gemini API Key Missing') :
                      (isFieldConfigured(settings.veniceApiKey) ? 'Venice API Key Configured' : 'Venice API Key Missing')
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* AI API Keys */}
            <div className="bg-white rounded-lg border border-[#E5E8F1] p-6">
              <div className="flex items-center gap-2 mb-4">
                <Key className="w-5 h-5 text-[#036BF2]" />
                <h2 className="text-[#1A1A1A] font-['Public_Sans'] text-lg font-semibold">
                  AI API Keys
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderField(
                  "Gemini API Key",
                  "geminiApiKey",
                  "password",
                  "Enter Gemini API key",
                  <Key className="w-4 h-4" />,
                  "Your Google Gemini API key for chat responses"
                )}
                
                {renderField(
                  "Venice API Key",
                  "veniceApiKey",
                  "password",
                  "Enter Venice API key",
                  <Key className="w-4 h-4" />,
                  "Your Venice AI API key for chat responses"
                )}
              </div>
            </div>

            {/* Image & Video Generation */}
            <div className="bg-white rounded-lg border border-[#E5E8F1] p-6">
              <div className="flex items-center gap-2 mb-4">
                <Image className="w-5 h-5 text-[#036BF2]" />
                <h2 className="text-[#1A1A1A] font-['Public_Sans'] text-lg font-semibold">
                  Image & Video Generation
                </h2>
              </div>
              
              {renderField(
                "Stability AI API Key",
                "stabilityApiKey",
                "password",
                "Enter Stability AI API key",
                <Key className="w-4 h-4" />,
                "Your Stability AI API key for image and video generation"
              )}
            </div>

            {/* OAuth Providers */}
            <div className="bg-white rounded-lg border border-[#E5E8F1] p-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-[#036BF2]" />
                <h2 className="text-[#1A1A1A] font-['Public_Sans'] text-lg font-semibold">
                  OAuth Providers
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-700">Google OAuth</h3>
                  {renderField("Google Client ID", "googleClientId", "text", "Enter Google Client ID")}
                  {renderField("Google Client Secret", "googleClientSecret", "password", "Enter Google Client Secret")}
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-700">Facebook OAuth</h3>
                  {renderField("Facebook App ID", "facebookAppId", "text", "Enter Facebook App ID")}
                  {renderField("Facebook App Secret", "facebookAppSecret", "password", "Enter Facebook App Secret")}
                </div>
              </div>
            </div>

            {/* Payment Providers */}
            <div className="bg-white rounded-lg border border-[#E5E8F1] p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-[#036BF2]" />
                <h2 className="text-[#1A1A1A] font-['Public_Sans'] text-lg font-semibold">
                  Payment Providers
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-700">PayPal</h3>
                  {renderField("PayPal Client ID", "paypalClientId", "text", "Enter PayPal Client ID")}
                  {renderField("PayPal Client Secret", "paypalClientSecret", "password", "Enter PayPal Client Secret")}
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-700">Stripe</h3>
                  {renderField("Stripe Secret Key", "stripeSecretKey", "password", "Enter Stripe Secret Key")}
                  {renderField("Stripe Publishable Key", "stripePublishableKey", "text", "Enter Stripe Publishable Key")}
                </div>
              </div>
            </div>

            {/* System Configuration */}
            <div className="bg-white rounded-lg border border-[#E5E8F1] p-6">
              <div className="flex items-center gap-2 mb-4">
                <Database className="w-5 h-5 text-[#036BF2]" />
                <h2 className="text-[#1A1A1A] font-['Public_Sans'] text-lg font-semibold">
                  System Configuration
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderField(
                  "MongoDB URI",
                  "mongodbUri",
                  "password",
                  "Enter MongoDB connection string",
                  <Database className="w-4 h-4" />,
                  "Your MongoDB database connection string"
                )}
                
                {renderField(
                  "JWT Secret",
                  "jwtSecret",
                  "password",
                  "Enter JWT secret key",
                  <Shield className="w-4 h-4" />,
                  "Secret key for JWT token generation"
                )}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-[#036BF2] text-white px-6 py-3 rounded-md hover:bg-[#0256CC] disabled:bg-gray-400 disabled:cursor-not-allowed font-['Public_Sans'] text-sm font-medium flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save All Settings
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
