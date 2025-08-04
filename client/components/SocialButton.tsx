import { ReactNode } from "react";

interface SocialButtonProps {
  type: "google" | "facebook";
  children: ReactNode;
  icon: ReactNode;
}

export default function SocialButton({
  type,
  children,
  icon,
}: SocialButtonProps) {
  const baseClasses =
    "flex items-center justify-center gap-[10px] px-8 py-2 rounded-[20px] border-[0.5px] border-black transition-all hover:scale-[0.98]";

  const typeClasses = {
    google: "bg-culosai-google-bg text-black",
    facebook: "bg-culosai-facebook-bg text-white",
  };

  const handleSocialLogin = () => {
    const getBackendURL = () => {
      const envURL = import.meta.env.VITE_API_BASE_URL;
      if (!envURL) return "http://localhost:5000/api";
      
      // If the URL already ends with /api, use it as is
      if (envURL.endsWith('/api')) return envURL;
      
      // If it doesn't end with /api, add it
      return `${envURL}/api`;
    };
    
    const BACKEND_URL = getBackendURL();
    
    if (type === "google") {
      window.location.href = `${BACKEND_URL}/auth/google`;
    } else if (type === "facebook") {
      window.location.href = `${BACKEND_URL}/auth/facebook`;
    }
  };

  return (
    <button
      className={`${baseClasses} ${typeClasses[type]} w-full max-w-[266px] h-[37px]`}
      onClick={handleSocialLogin}
    >
      {icon}
      <span className="font-dm-sans text-sm lg:text-base font-medium">
        {children}
      </span>
    </button>
  );
}
