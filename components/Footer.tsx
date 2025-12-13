import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/15 mt-24 py-12 bg-black">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold tracking-wider">SWEEPX</h3>
            <p className="text-white/60 text-sm leading-relaxed">
              Clean the world, one quest at a time
            </p>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold dot-matrix tracking-wider text-white/80">CONNECT</h4>
            <div className="space-y-2">
              <a
                href="https://instagram.com/endeavv0r"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-white/60 hover:text-nothing-red text-sm transition-colors duration-300"
              >
                Instagram
              </a>
              <a
                href="https://www.linkedin.com/in/pushkar-jha-4a1258381?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-white/60 hover:text-nothing-red text-sm transition-colors duration-300"
              >
                LinkedIn
              </a>
            </div>
          </div>

          {/* Info */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold dot-matrix tracking-wider text-white/80">ABOUT</h4>
            <p className="text-white/60 text-sm leading-relaxed">
              Built with care for a cleaner planet
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-center text-white/40 text-xs dot-matrix tracking-wider">
            © 2025 SWEEPX — ALL RIGHTS RESERVED
          </p>
        </div>
      </div>
    </footer>
  );
}
