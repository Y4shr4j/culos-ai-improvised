// client/pages/auth/Callback.tsx
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../src/contexts/AuthContext';

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuthData } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const userParam = params.get('user');

    if (token && userParam) {
      try {
        const user = JSON.parse(userParam);
        setAuthData(token, user);
        navigate('/dashboard');
      } catch (error) {
        console.error('Failed to parse user data:', error);
        navigate('/login?error=auth_failed');
      }
    } else {
      console.error('Missing token or user data in callback');
      navigate('/login?error=auth_failed');
    }
  }, [location, setAuthData, navigate]);

  return <div>Loading...</div>;
};

export default AuthCallback;
