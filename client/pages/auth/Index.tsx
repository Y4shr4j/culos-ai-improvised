import { useState, useEffect } from "react";
import Header from "../../components/Header";
import SocialButton from "../../components/SocialButton";
import GoogleIcon from "../../components/icons/GoogleIcon";
import FacebookIcon from "../../components/icons/FacebookIcon";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Index() {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  // Clear any existing tokens for testing
  useEffect(() => {
    localStorage.removeItem('token');
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        alert("Registration successful! Please log in.");
        // Fetch user profile to trigger cookie/session
        await fetch(`${API_BASE_URL}/api/auth/me`, {
          credentials: "include"
        });
        navigate("/login"); // Redirect to login page
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (err) {
      alert("Network error");
    }
  };

  return (
    <div className="min-h-screen bg-culosai-gradient">
      <Header />

      {/* Main Content Container */}
      <div className="container mx-auto px-4 lg:px-10">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between pt-8 lg:pt-[119px] pb-10 gap-12 lg:gap-0">
          {/* Registration Form */}
          <div className="w-full lg:w-[486px] lg:ml-[96px]">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-8 lg:gap-12"
            >
              {/* Name Field */}
              <div className="flex flex-col gap-1">
                <label className="text-culosai-form-text font-norwester text-lg lg:text-xl font-normal">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="h-10 w-full rounded-[15px] border-[0.5px] border-black bg-culosai-form-bg px-4 focus:outline-none focus:ring-2 focus:ring-culosai-gold/50 text-black"
                  required
                />
              </div>

              {/* Username Field */}
              <div className="flex flex-col gap-1">
                <label className="text-culosai-form-text font-norwester text-lg lg:text-xl font-normal">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="h-10 w-full rounded-[15px] border-[0.5px] border-black bg-culosai-form-bg px-4 focus:outline-none focus:ring-2 focus:ring-culosai-gold/50 text-black"
                  required
                />
              </div>

              {/* Email Field */}
              <div className="flex flex-col gap-1">
                <label className="text-culosai-form-text font-norwester text-lg lg:text-xl font-normal">
                  Mail
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="h-10 w-full rounded-[15px] border-[0.5px] border-black bg-culosai-form-bg px-4 focus:outline-none focus:ring-2 focus:ring-culosai-gold/50 text-black"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-1">
                <label className="text-culosai-form-text font-norwester text-lg lg:text-xl font-normal">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="h-10 w-full rounded-[15px] border-[0.5px] border-black bg-culosai-form-bg px-4 focus:outline-none focus:ring-2 focus:ring-culosai-gold/50 text-black"
                  required
                />
              </div>

              {/* Mobile Create Account Button */}
              <button
                type="submit"
                className="lg:hidden w-full h-[66px] flex items-center justify-center gap-[10px] rounded-[10px] border border-black bg-culosai-create-btn hover:bg-culosai-create-btn/90 transition-colors px-8 py-4"
              >
                <span className="text-culosai-create-btn-text font-norwester text-2xl lg:text-[32px] font-normal">
                  Create Account
                </span>
              </button>
            </form>
          </div>

          {/* Social Login and Create Account Section */}
          <div className="w-full lg:w-[356px] lg:ml-[166px] lg:mt-[92px] flex flex-col gap-8 lg:gap-[74px]">
            {/* Social Login Buttons */}
            <div className="flex flex-col gap-4 items-center">
              <SocialButton type="google" icon={<GoogleIcon />}>
                Sign In with Google
              </SocialButton>
              <SocialButton type="facebook" icon={<FacebookIcon />}>
                Sign In with Facebook
              </SocialButton>
            </div>

            {/* Desktop Create Account Button */}
            <button
              type="submit"
              className="hidden lg:flex w-full h-[66px] items-center justify-center gap-[10px] rounded-[10px] border border-black bg-culosai-create-btn hover:bg-culosai-create-btn/90 transition-colors px-[70px] py-[14px]"
              onClick={handleSubmit}
            >
              <span className="text-culosai-create-btn-text font-norwester text-[32px] font-normal">
                Create Account
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
