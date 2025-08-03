import React from 'react';
import { useAuth } from '../src/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import GeneralNotFound from '../pages/general/NotFound';

interface AdminRouteProps {
  children: React.ReactNode;
}

function AdminRoute({ children }: AdminRouteProps) {
  const { user, loading } = useAuth();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-culosai-dark-grey flex items-center justify-center">
        <div className="text-center text-culosai-cream">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-culosai-accent-gold mx-auto"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If not admin, show 404 page
  if (!user.isAdmin) {
    return <GeneralNotFound />;
  }

  // If admin, render the protected content
  return <>{children}</>;
}

export default AdminRoute; 