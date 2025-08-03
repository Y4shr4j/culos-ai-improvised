import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AgeVerification: React.FC = () => {
  const { user, verifyAge } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = React.useState<string | null>(null);

  // Redirect if already verified
  useEffect(() => {
    if (user?.ageVerified) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleVerification = async (isOver18: boolean) => {
    try {
      const success = await verifyAge();
      if (success) {
        navigate('/');
      } else {
        setError('Failed to verify age. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Age verification error:', err);
    }
  };

  if (user?.ageVerified) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Age Verification Required</h2>
          <p className="mb-6 text-gray-700">
            This website contains adult content and is only suitable for those who are 18 years or older.
            By entering, you confirm that you are at least 18 years of age.
          </p>
          
          {error && (
            <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}
          
          <div className="flex flex-col space-y-3">
            <button
              onClick={() => handleVerification(true)}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              I am 18 or older - Enter
            </button>
            
            <button
              onClick={() => handleVerification(false)}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              I am under 18 - Leave
            </button>
          </div>
          
          <p className="mt-4 text-xs text-gray-500">
            By entering this site, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AgeVerification;
