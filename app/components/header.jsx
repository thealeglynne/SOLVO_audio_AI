'use client';

import { useState, useEffect } from 'react';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 px-4 md:px-6 py-3 flex items-center justify-between transition-all duration-300 ${
        isScrolled ? 'bg-white/80 backdrop-blur-md shadow-md' : 'bg-transparent'
      }`}
    >
      {/* Logo grande con redirección */}
      <img
        src="/logo.png"
        alt="Logo"
        className="h-10 sm:h-12 md:h-14 cursor-pointer"
        onClick={() => (window.location.href = 'https://www.glynneai.com/')}
      />
    </header>
  );
}
