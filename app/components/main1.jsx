'use client';

import { useEffect, useState } from 'react';
import { LoginPopup } from './LoginPopup';

export default function Main1() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showLogo, setShowLogo] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setShowLogo(true), 1000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <main className="relative w-full h-screen overflow-hidden font-inter">
      {/* Imagen de fondo */}
      <div
        className="absolute top-0 left-0 w-full h-full bg-cover bg-center"
        style={{ backgroundImage: "url('https://i.pinimg.com/originals/57/85/cd/5785cdf2890546f4093c6e9b9cb8afd4.gif')" }}
      />

      {/* Capa oscura */}
      <div className="absolute inset-0 bg-black/60 z-10" />

      {/* Contenido */}
      <div className="relative z-20 w-full h-full flex items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-[40rem] p-6 sm:p-8 bg-white shadow-xl text-black text-center space-y-4">
          <img
            src="/logo.png"
            alt="Logo SOLVO"
            className={`w-16 sm:w-20 mx-auto transition-all duration-1000 ${
              showLogo ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
            }`}
          />

          <h2 className="text-sm sm:text-base font-medium">
            Bienvenido a la plataforma de análisis inteligente de audio de <span className="font-bold text-black">SOLVO</span>
          </h2>

          <p className="text-xs sm:text-sm text-gray-700">
            Esta herramienta transforma archivos de audio en conocimiento accionable. Utiliza modelos de inteligencia artificial para transcribir, corregir y analizar interacciones orales con métricas lingüísticas precisas.
          </p>

        

          <button
  onClick={() => {
    localStorage.removeItem('glyiaChatClosed');
    setShowLoginModal(true);
  }}
  className="relative mt-2 px-6 py-3 text-sm font-semibold text-white bg-[#001FCC] overflow-hidden group rounded-xl shadow-xl"
>
  {/* Efecto de onda azul-blanca */}
  <span className="absolute inset-0 z-0 bg-[linear-gradient(to-right,white_5%,#001FCC_5%,#001FCC_10%,white_10%)] bg-[length:40px_100%] opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-waves" />

  {/* Efecto de barrido blanco translúcido */}
  <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />

  <span className="relative z-10">Ingresar a la plataforma</span>
</button>

        </div>
      </div>

      {/* Popup separado */}
      <LoginPopup visible={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </main>
  );
}
