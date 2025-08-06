import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../src/utils/api";

interface NavbarProps {
  user: any;
  tokens: number | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, tokens, onLogout }) => {
  const [isUserBoxOpen, setIsUserBoxOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [tokenFeedback, setTokenFeedback] = useState("");
  const [localTokens, setLocalTokens] = useState<number | null>(tokens);

  useEffect(() => {
    setLocalTokens(tokens);
  }, [tokens]);

  // Handler to close user info box when clicking outside
  useEffect(() => {
    if (!isUserBoxOpen) return;
    const handleClick = (e: MouseEvent) => {
      const userBox = document.getElementById("user-info-box");
      const profileBtn = document.getElementById("profile-btn");
      if (
        userBox &&
        !userBox.contains(e.target as Node) &&
        profileBtn &&
        !profileBtn.contains(e.target as Node)
      ) {
        setIsUserBoxOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isUserBoxOpen]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const handleClick = (e: MouseEvent) => {
      const mobileMenu = document.getElementById("mobile-menu");
      const mobileMenuBtn = document.getElementById("mobile-menu-btn");
      if (
        mobileMenu &&
        !mobileMenu.contains(e.target as Node) &&
        mobileMenuBtn &&
        !mobileMenuBtn.contains(e.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isMobileMenuOpen]);

  const handleAddTokens = async () => {
    setTokenLoading(true);
    setTokenFeedback("");
    try {
      // This endpoint doesn't exist, so we'll just show a message
      setTokenFeedback("Feature coming soon!");
      setTimeout(() => setTokenFeedback(""), 1500);
    } catch (error) {
      console.error("Error adding tokens:", error);
      setTokenFeedback("Error");
      setTimeout(() => setTokenFeedback(""), 1500);
    }
    setTokenLoading(false);
  };

  return (
    <header className="relative z-50">
      <div className="flex justify-between items-center px-4 sm:px-6 lg:px-10 py-4 sm:py-5">
        {/* Logo and Navigation */}
        <div className="flex items-center gap-4 lg:gap-8 xl:gap-[277px]">
          <Link
            to="/"
            className="flex items-center gap-1 hover:opacity-80 transition-opacity min-w-0"
          >
            <span className="text-culosai-gold font-norwester text-xl sm:text-2xl lg:text-[32px] truncate">
              CulosAI
            </span>
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/4fb596f0bfff741645e7ef0e554161c9bea1e0ee?width=74"
              alt="CulosAI Logo"
              className="w-6 h-6 sm:w-8 sm:h-8 lg:w-[37px] lg:h-[34px] flex-shrink-0"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8 xl:gap-20 justify-center">
            <Link
              to="/"
              className="text-culosai-gold font-norwester text-lg xl:text-xl hover:opacity-80 transition-opacity whitespace-nowrap"
            >
              AI Images
            </Link>
            <Link
              to="/ai-videos"
              className="text-culosai-gold font-norwester text-lg xl:text-xl hover:opacity-80 transition-opacity whitespace-nowrap"
            >
              AI Videos
            </Link>
            <Link
              to="/ai-characters"
              className="text-culosai-gold font-norwester text-lg xl:text-xl hover:opacity-80 transition-opacity whitespace-nowrap"
            >
              AI Character
            </Link>
          </nav>
        </div>

        {/* Right side - Admin Button, Tokens and Profile */}
        <div className="flex items-center gap-2 sm:gap-4 relative">
          {/* Admin Button - Only visible to admin users */}
          {user?.isAdmin && (
            <Link
              to="/admin"
              className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-2 bg-culosai-dark-brown hover:bg-culosai-dark-brown/80 rounded-[20px] border border-culosai-accent-gold transition-colors"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="text-culosai-accent-gold sm:w-5 sm:h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <span className="text-culosai-accent-gold font-norwester text-sm sm:text-lg hidden sm:block">
                Admin
              </span>
            </Link>
          )}

          {/* Token Status - Responsive */}
          <Link to="/general" className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#FFEBC2] rounded-[20px] border border-[#42100B] hover:opacity-80 transition-opacity min-w-0">
            <span className="text-[#42100B] font-norwester text-sm sm:text-base hidden sm:block">+ More Milk</span>
            <span className="text-[#42100B] font-norwester text-sm sm:text-base sm:hidden">+ Milk</span>

            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/e44d41b73fa6bfbbaecc890861b13d59e2f1990b?width=68"
              alt="Tokens"
              className="w-6 h-6 sm:w-8 sm:h-8 lg:w-[34px] lg:h-[35px] flex-shrink-0"
            />
            <span className="text-[#42100B] font-norwester text-sm sm:text-base">
              ({tokens !== null ? tokens : 0})
            </span>
          </Link>

          {/* Profile/Logo Button */}
          <button
            id="profile-btn"
            className="w-10 h-10 sm:w-12 sm:h-12 lg:w-[51px] lg:h-[51px] bg-[#FFEBC2] rounded-full flex items-center justify-center hover:opacity-90 transition-opacity flex-shrink-0"
            onClick={() => setIsUserBoxOpen((prev) => !prev)}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 25 25"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="sm:w-6 sm:h-6"
            >
              <path
                d="M16.2508 6.5C16.2508 8.57107 14.5719 10.25 12.5008 10.25C10.4298 10.25 8.75082 8.57107 8.75082 6.5C8.75082 4.42893 10.4298 2.75 12.5008 2.75C14.5719 2.75 16.2508 4.42893 16.2508 6.5Z"
                stroke="#42100B"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5.00195 20.6182C5.07226 16.5369 8.40269 13.25 12.5008 13.25C16.599 13.25 19.9295 16.5371 19.9997 20.6185C17.7169 21.666 15.1772 22.25 12.5011 22.25C9.82481 22.25 7.28491 21.6659 5.00195 20.6182Z"
                stroke="#42100B"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* User Info Box */}
          {isUserBoxOpen && (
            <div
              id="user-info-box"
              className="absolute right-0 top-16 z-50 w-64 sm:w-72 p-4 rounded-xl bg-black bg-opacity-50 backdrop-blur-md shadow-lg flex flex-col gap-2"
            >
              {user ? (
                <>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-culosai-accent-gold flex items-center justify-center text-lg sm:text-2xl font-bold text-culosai-dark-brown flex-shrink-0">
                      {user.name ? user.name.charAt(0) : "U"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-culosai-gold font-norwester text-base sm:text-lg truncate">
                        {user.name || user.username || "User"}
                      </div>
                      {user.username && (
                        <div className="text-culosai-gold text-xs opacity-80 truncate">@{user.username}</div>
                      )}
                      <div className="text-culosai-gold text-xs truncate">
                        {user.email || "-"}
                      </div>
                    </div>
                  </div>
                  <div className="text-culosai-gold text-sm flex items-center gap-2">
                    Tokens: <span className="text-culosai-gold font-bold">{localTokens !== null ? localTokens : 0}</span>
                    <button
                      className="ml-2 px-2 py-1 bg-culosai-accent-gold text-culosai-dark-brown font-norwester rounded hover:bg-culosai-accent-gold/80 transition-colors text-xs disabled:opacity-60"
                      onClick={handleAddTokens}
                      disabled={tokenLoading}
                    >
                      +10
                    </button>
                    {tokenFeedback && <span className="text-green-400 text-xs ml-1">{tokenFeedback}</span>}
                  </div>
                  
                  <button
                    className="mt-4 px-4 py-2 bg-culosai-accent-gold text-culosai-dark-brown font-norwester rounded-lg hover:bg-culosai-accent-gold/80 transition-colors"
                    onClick={onLogout}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <div className="text-culosai-gold font-norwester text-base sm:text-lg mb-4">
                    Welcome Guest!
                  </div>
                  <div className="text-culosai-gold text-sm mb-4">
                    Login to access AI features and unlock images
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to="/login"
                      className="flex-1 px-4 py-2 bg-culosai-accent-gold text-culosai-dark-brown font-norwester rounded-lg hover:bg-culosai-accent-gold/80 transition-colors text-center text-sm"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="flex-1 px-4 py-2 bg-culosai-dark-brown text-culosai-cream font-norwester rounded-lg hover:bg-culosai-dark-brown/80 transition-colors text-center text-sm"
                    >
                      Register
                    </Link>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            id="mobile-menu-btn"
            className="lg:hidden p-2 min-w-[44px] min-h-[44px] flex items-center justify-center z-50"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
            style={{ background: 'none', border: 'none' }}
          >
            {/* Standard Hamburger Icon */}
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FCEDBC" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    
      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div 
          id="mobile-menu"
          className="lg:hidden bg-culosai-dark-brown/95 backdrop-blur-sm absolute top-full left-0 right-0 border-t border-culosai-accent-gold/20"
        >
          <nav className="flex flex-col space-y-2 px-4 py-6">
            <Link
              to="/"
              className="text-culosai-gold font-norwester text-lg sm:text-xl py-3 px-4 rounded-lg hover:bg-culosai-accent-gold/10 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-culosai-gold font-norwester text-lg sm:text-xl py-3 px-4 rounded-lg hover:bg-culosai-accent-gold/10 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  AI Images
                </Link>
                <Link
                  to="/ai-videos"
                  className="text-culosai-gold font-norwester text-lg sm:text-xl py-3 px-4 rounded-lg hover:bg-culosai-accent-gold/10 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  AI Videos
                </Link>
                <Link
                  to="/ai-characters"
                  className="text-culosai-gold font-norwester text-lg sm:text-xl py-3 px-4 rounded-lg hover:bg-culosai-accent-gold/10 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  AI Character
                </Link>
              </>
            ) : (
              <>
                <span
                  className="text-culosai-gold font-norwester text-lg sm:text-xl py-3 px-4 rounded-lg opacity-50 cursor-not-allowed"
                  title="Login Required"
                >
                  AI Images
                </span>
                <span
                  className="text-culosai-gold font-norwester text-lg sm:text-xl py-3 px-4 rounded-lg opacity-50 cursor-not-allowed"
                  title="Login Required"
                >
                  AI Videos
                </span>
                <span
                  className="text-culosai-gold font-norwester text-lg sm:text-xl py-3 px-4 rounded-lg opacity-50 cursor-not-allowed"
                  title="Login Required"
                >
                  AI Character
                </span>
              </>
            )}
            {/* Admin Link - Only visible to admin users */}
            {user?.isAdmin && (
              <Link
                to="/admin"
                className="text-culosai-accent-gold font-norwester text-lg sm:text-xl py-3 px-4 rounded-lg hover:bg-culosai-accent-gold/10 transition-colors flex items-center gap-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                Admin Panel
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
