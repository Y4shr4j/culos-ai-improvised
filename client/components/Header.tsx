export default function Header() {
  return (
    <header className="w-full flex flex-col lg:flex-row lg:justify-between lg:items-center px-4 lg:px-10 py-4 lg:py-5 gap-4 lg:gap-0">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-[277px]">
        <div className="flex items-center gap-[5px] justify-center lg:justify-start">
          <span className="text-culosai-gold font-norwester text-2xl lg:text-[32px] font-normal">
            CulosAI
          </span>
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/4fb596f0bfff741645e7ef0e554161c9bea1e0ee?width=74"
            alt="CulosAI Logo"
            className="w-[30px] h-[28px] lg:w-[37px] lg:h-[34px]"
          />
        </div>
        <nav className="flex items-center justify-center lg:justify-start gap-6 lg:gap-[42px] flex-wrap">
          <a
            href="#"
            className="text-culosai-gold font-norwester text-lg lg:text-xl font-normal hover:opacity-80 transition-opacity"
          >
            AI Images
          </a>
          <a
            href="#"
            className="text-culosai-gold font-norwester text-lg lg:text-xl font-normal hover:opacity-80 transition-opacity"
          >
            AI Videos
          </a>
          <a
            href="#"
            className="text-culosai-gold font-norwester text-lg lg:text-xl font-normal hover:opacity-80 transition-opacity"
          >
            AI Character
          </a>
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
          href="/"
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
