import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="flex justify-between items-center px-4 md:px-10 py-5">
      {/* Logo and Navigation */}
      <div className="flex items-center gap-4 md:gap-[277px]">
        <Link
          to="/"
          className="flex items-center gap-1 hover:opacity-80 transition-opacity"
        >
          <span className="text-culosai-gold font-norwester text-2xl md:text-[32px]">
            CulosAI
          </span>
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/4fb596f0bfff741645e7ef0e554161c9bea1e0ee?width=74"
            alt="CulosAI Logo"
            className="w-8 h-8 md:w-[37px] md:h-[34px]"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-20 justify-center">
          <Link
            to="/ai-images"
            className="text-culosai-gold font-norwester text-xl hover:opacity-80 transition-opacity"
          >
            AI Images
          </Link>
          <Link
            to="/ai-videos"
            className="text-culosai-gold font-norwester text-xl hover:opacity-80 transition-opacity"
          >
            AI Videos
          </Link>
          <Link
            to="/ai-characters"
            className="text-culosai-gold font-norwester text-xl hover:opacity-80 transition-opacity"
          >
            AI Character
          </Link>
        </nav>
      </div>

      <div className="flex items-center justify-center lg:justify-end gap-3">
        <a
          href="/login"
          className="flex min-w-[75px] lg:w-[91px] px-4 lg:px-6 py-2 lg:py-[10px] justify-center items-center gap-[10px] rounded-[15px] border border-black bg-transparent hover:bg-black/10 transition-colors"
        >
          <span className="text-culosai-login-btn font-norwester text-sm lg:text-base font-normal">
            Log In
          </span>
        </a>
        <a
          href="/register"
          className="flex px-4 lg:px-6 py-2 lg:py-[10px] justify-center items-center gap-[10px] rounded-[15px] border border-black bg-transparent hover:bg-black/10 transition-colors"
        >
          <span className="text-culosai-register-btn font-norwester text-sm lg:text-base font-normal">
            Register
          </span>
        </a>
      </div>
    </header>
  );
}
