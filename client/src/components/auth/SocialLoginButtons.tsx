import React from 'react';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';

interface SocialLoginButtonsProps {
  disabled?: boolean;
  onError?: (error: string) => void;
}

const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({ 
  disabled = false,
  onError 
}) => {
  const navigate = useNavigate();

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    try {
      // This will redirect to the server's OAuth endpoint
      window.location.href = `${process.env.REACT_APP_API_URL}/api/auth/${provider}`;
    } catch (error) {
      console.error(`${provider} login error:`, error);
      onError?.(`Failed to sign in with ${provider}. Please try again.`);
    }
  };

  return (
    <div className="mt-6">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => handleSocialLogin('google')}
          disabled={disabled}
          className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FcGoogle className="h-5 w-5" />
          <span className="ml-2">Google</span>
        </button>

        <button
          type="button"
          onClick={() => handleSocialLogin('facebook')}
          disabled={disabled}
          className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaFacebook className="h-5 w-5 text-blue-600" />
          <span className="ml-2">Facebook</span>
        </button>
      </div>
    </div>
  );
};

export default SocialLoginButtons;
