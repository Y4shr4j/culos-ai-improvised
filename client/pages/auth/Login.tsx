import { useState } from "react";
import Header from "../../components/Header";
import SocialButton from "../../components/SocialButton";
import GoogleIcon from "../../components/icons/GoogleIcon";
import FacebookIcon from "../../components/icons/FacebookIcon";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../src/contexts/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const { login } = useAuth();
  console.log("VITE_API_BASE_URL from import.meta.env:", import.meta.env.VITE_API_BASE_URL);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
      navigate("/dashboard");
    } catch (err: any) {
      alert(err.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-culosai-gradient">
      <Header />

      {/* Main Content Container */}
      <div className="container mx-auto px-4 lg:px-10">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between pt-8 lg:pt-[119px] pb-10 gap-12 lg:gap-0">
          {/* Login Form */}
          <div className="w-full lg:w-[486px] lg:ml-[96px]">
            <div className="mb-8">
              <h1 className="text-culosai-form-text font-norwester text-3xl lg:text-4xl font-normal mb-2">
                Welcome Back
              </h1>
              <p className="text-culosai-form-text/80 font-dm-sans text-lg">
                Sign in to your CulosAI account
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-8 lg:gap-12"
            >
              {/* Email Field */}
              <div className="flex flex-col gap-1">
                <label className="text-culosai-form-text font-norwester text-lg lg:text-xl font-normal">
                  Email
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

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <a
                  href="#"
                  className="text-culosai-gold font-dm-sans text-sm hover:opacity-80 transition-opacity"
                >
                  Forgot Password?
                </a>
              </div>

              {/* Mobile Login Button */}
              <button
                type="submit"
                className="lg:hidden w-full h-[66px] flex items-center justify-center gap-[10px] rounded-[10px] border border-black bg-culosai-create-btn hover:bg-culosai-create-btn/90 transition-colors px-8 py-4"
              >
                <span className="text-culosai-create-btn-text font-norwester text-2xl lg:text-[32px] font-normal">
                  Sign In
                </span>
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-8 text-center">
              <p className="text-culosai-form-text font-dm-sans">
                Don't have an account?{" "}
                <a
                  href="/register"
                  className="text-culosai-gold hover:opacity-80 transition-opacity font-medium"
                >
                  Sign up here
                </a>
              </p>
            </div>
          </div>

          {/* Social Login and Sign In Section */}
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

            {/* Desktop Sign In Button */}
            <button
              type="button"
              className="hidden lg:flex w-full h-[66px] items-center justify-center gap-[10px] rounded-[10px] border border-black bg-culosai-create-btn hover:bg-culosai-create-btn/90 transition-colors px-[70px] py-[14px]"
              onClick={(e) => {
                e.preventDefault();
                handleSubmit(e);
              }}
            >
              <span className="text-culosai-create-btn-text font-norwester text-[32px] font-normal">
                Sign In
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
