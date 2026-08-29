import React from "react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#0f1932] text-neutral-300 py-12 px-6 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#c5aa7a] flex items-center justify-center text-white font-black text-lg shadow-md shadow-[#c5aa7a]/20">
              G
            </div>
            <h2 className="text-xl font-bold text-white">Gama Putra Harmoni</h2>
          </div>
          <p className="text-sm text-neutral-400">
            Professional consulting and training company specializing in
            hospitality, food safety and quality management systems.
          </p>
        </div>

        {/* Perusahaan */}
        <div>
          <h3 className="font-semibold text-white mb-3">Perusahaan</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="#" className="hover:text-[#c5aa7a] transition-colors">
                Tentang Kami
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[#c5aa7a] transition-colors">
                Karier
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[#c5aa7a] transition-colors">
                Blog
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[#c5aa7a] transition-colors">
                Kontak
              </a>
            </li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="font-semibold text-white mb-3">Legal</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="#" className="hover:text-[#c5aa7a] transition-colors">
                Kebijakan Privasi
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[#c5aa7a] transition-colors">
                Syarat & Ketentuan
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-[#c5aa7a] transition-colors">
                Keamanan
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-white mb-3">Hubungi Kami</h3>
          <ul className="space-y-3 text-sm">
            <li>
              <a
                href="https://wa.me/6289638487742"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-neutral-300 hover:text-white transition group"
              >
                <span className="flex items-center justify-center w-6 h-6 rounded-md bg-[#25D366]/10 group-hover:bg-[#25D366]/20 transition">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <path
                      fill="#25D366"
                      d="M19.05 4.91A9.816 9.816 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01zm-7.01 15.24c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.163 8.163 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c.02 4.54-3.68 8.23-8.23 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.78.98-.15.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.25-1.47-1.39-1.72-.15-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.66.31-.22.25-.86.84-.86 2.04s.88 2.37 1 2.53c.12.17 1.73 2.64 4.2 3.7.59.25 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.07-.1-.23-.17-.48-.29z"
                    />
                  </svg>
                </span>
                <span>WhatsApp</span>
              </a>
            </li>

            <li>
              <a
                href="https://instagram.com/gamaputraharmoni"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-neutral-300 hover:text-white transition group"
              >
                <span className="flex items-center justify-center w-6 h-6 rounded-md bg-white/5 group-hover:bg-white/10 transition">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <radialGradient
                      id="ig-grad"
                      cx="20%"
                      cy="100%"
                      r="130%"
                      fx="20%"
                      fy="100%"
                    >
                      <stop offset="0%" stopColor="#ffd600" />
                      <stop offset="25%" stopColor="#ff7a00" />
                      <stop offset="50%" stopColor="#ff0069" />
                      <stop offset="75%" stopColor="#d300c5" />
                      <stop offset="100%" stopColor="#7638fa" />
                    </radialGradient>
                    <rect
                      width="20"
                      height="20"
                      x="2"
                      y="2"
                      rx="5"
                      ry="5"
                      fill="url(#ig-grad)"
                    />
                    <path
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="1.8"
                      d="M12 7.2A4.8 4.8 0 1 0 16.8 12 4.8 4.8 0 0 0 12 7.2zm0 7.8A3 3 0 1 1 15 12a3 3 0 0 1-3 3zm5.2-8.35a1.15 1.15 0 1 1-1.15-1.15 1.15 1.15 0 0 1 1.15 1.15z"
                    />
                  </svg>
                </span>
                <span>Instagram</span>
              </a>
            </li>

            <li>
              <a
                href="mailto:info@gamaputraharmoni.com"
                className="flex items-center gap-2.5 text-neutral-300 hover:text-white transition group"
              >
                <span className="flex items-center justify-center w-6 h-6 rounded-md bg-white/5 group-hover:bg-white/10 transition">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M3 5.5v13a1.5 1.5 0 0 0 1.5 1.5H6V9.2L3 7z"
                    />
                    <path
                      fill="#EA4335"
                      d="M3 5.5A1.5 1.5 0 0 1 5.3 4.3L12 9.4 6 13.9V9.2L3 7z"
                    />
                    <path
                      fill="#EA4335"
                      d="M21 5.5a1.5 1.5 0 0 0-2.3-1.2L12 9.4l6 4.5V9.2l3-2.2z"
                    />
                    <path
                      fill="#34A853"
                      d="M21 5.5v13a1.5 1.5 0 0 1-1.5 1.5H18V9.2l3-2.2z"
                    />
                    <path fill="#FBBC05" d="M6 13.9V20h12v-6.1l-6-4.5z" />
                  </svg>
                </span>
                <span>Email</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-neutral-800/80 flex flex-col md:flex-row justify-between items-center text-xs text-neutral-500 gap-4">
        <p>&copy; {currentYear} Gama Putra Harmoni. All rights reserved.</p>
        <p className="text-neutral-500">
          Hospitality, Food Safety & Quality Management
        </p>
      </div>
    </footer>
  );
};
