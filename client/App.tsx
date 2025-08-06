import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./src/contexts/AuthContext";
import { motion, AnimatePresence } from 'framer-motion';
import AdminIndex from "./pages/admin/Index";
import AdminAiCharacters from "./pages/admin/AiCharacters";
import AdminApiSettings from "./pages/admin/ApiSettings";
import AdminCategories from "./pages/admin/Categories";
import AdminCharacters from "./pages/admin/Characters";
import AdminImages from "./pages/admin/Images";
import AdminUploadImages from "./pages/admin/UploadImages";
import AdminUploadVideos from "./pages/admin/UploadVideos";
import AdminNotFound from "./pages/admin/NotFound";
import AdminPosts from "./pages/admin/Posts";
import AdminTokenSettings from "./pages/admin/TokenSettings";
import AdminTransactions from "./pages/admin/Transactions";
import AdminVideos from "./pages/admin/Videos";
import AdminAIConfig from "./pages/admin/AIConfig";

import AuthIndex from "./pages/auth/Index";
import AuthLogin from "./pages/auth/Login";
import AuthNotFound from "./pages/auth/NotFound";
import AuthCallback from "./pages/auth/Callback";

import Chat from "./pages/chat/chat";
import ChatNotFound from "./pages/chat/NotFound";

import GeneralAIImageGeneration from "./pages/general/AIImageGeneration";
import GeneralAIVideoGeneration from "./pages/general/AIVideoGeneration";
import GeneralAIVideoGallery from "./pages/general/AIVideoGallery";
import GeneralAICharacterGallery from "./pages/general/AICharacterGallery";
import GeneralDashboard from "./pages/general/Dashboard";
import GeneralImageDetails from "./pages/general/ImageDetails";
import GeneralIndex from "./pages/general/Index";
import GeneralNotFound from "./pages/general/NotFound";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import AgeVerificationModal from "./components/AgeVerificationModal";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

// Page transition component
const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

const App = () => {
  const initialOptions = {
    clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || "test",
    currency: "USD",
    intent: "capture",
  };

  return (
    <PayPalScriptProvider options={initialOptions}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <AgeVerificationModal />
              <PageTransition>
                <Routes>
                  <Route path="/" element={<GeneralDashboard />} />
                  <Route path="/login" element={<AuthLogin />} />
                  <Route path="/register" element={<AuthIndex />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />

                  {/* Admin Panel Routes */}
                  <Route path="/admin" element={
                    <AdminRoute>
                      <AdminIndex />
                    </AdminRoute>
                  } />
                  <Route path="/admin/ai-characters" element={
                    <AdminRoute>
                      <AdminAiCharacters />
                    </AdminRoute>
                  } />
                  <Route path="/admin/ai-config" element={
                    <AdminRoute>
                      <AdminAIConfig />
                    </AdminRoute>
                  } />
                  <Route path="/admin/api-settings" element={
                    <AdminRoute>
                      <AdminApiSettings />
                    </AdminRoute>
                  } />
                  <Route path="/admin/categories" element={
                    <AdminRoute>
                      <AdminCategories />
                    </AdminRoute>
                  } />
                  <Route path="/admin/characters" element={
                    <AdminRoute>
                      <AdminCharacters />
                    </AdminRoute>
                  } />
                  <Route path="/admin/images" element={
                    <AdminRoute>
                      <AdminImages />
                    </AdminRoute>
                  } />
                  <Route path="/admin/upload-images" element={
                    <AdminRoute>
                      <AdminUploadImages />
                    </AdminRoute>
                  } />
                  <Route path="/admin/upload-videos" element={
                    <AdminRoute>
                      <AdminUploadVideos />
                    </AdminRoute>
                  } />
                  <Route path="/admin/posts" element={
                    <AdminRoute>
                      <AdminPosts />
                    </AdminRoute>
                  } />
                  <Route path="/admin/token-settings" element={
                    <AdminRoute>
                      <AdminTokenSettings />
                    </AdminRoute>
                  } />
                  <Route path="/admin/transactions" element={
                    <AdminRoute>
                      <AdminTransactions />
                    </AdminRoute>
                  } />
                  <Route path="/admin/videos" element={
                    <AdminRoute>
                      <AdminVideos />
                    </AdminRoute>
                  } />
                  <Route path="/admin/*" element={
                    <AdminRoute>
                      <AdminNotFound /> 
                    </AdminRoute>
                  } />

                  {/* Chat Routes */}
                  <Route path="/chat" element={
                    <ProtectedRoute>
                      <Chat />
                    </ProtectedRoute>
                  } />
                  <Route path="/chat/*" element={<ChatNotFound />} />

                  {/* General Pages */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <GeneralDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/aiimagegeneration" element={
                    <ProtectedRoute>
                      <GeneralAIImageGeneration />
                    </ProtectedRoute>
                  } />
                  <Route path="/aivideogeneration" element={
                    <ProtectedRoute>
                      <GeneralAIVideoGeneration />
                    </ProtectedRoute>
                  } />
                  <Route path="/ai-videos" element={<GeneralAIVideoGallery />} />
                  <Route path="/ai-characters" element={<GeneralAICharacterGallery />} />
                  <Route path="/imagedetails" element={<GeneralImageDetails />} />
                  <Route path="/general" element={<GeneralIndex />} />
                  <Route path="/general/*" element={<GeneralNotFound />} />



                  {/* Catch-all NotFound */}
                  <Route path="*" element={<AuthNotFound />} />
                </Routes>
              </PageTransition>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </PayPalScriptProvider>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
