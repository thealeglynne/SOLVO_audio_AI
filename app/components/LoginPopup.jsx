'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { FaGoogle } from 'react-icons/fa';
import '../components/LoginPopup.css';

export function LoginPopup({ visible, onClose }) {
  const router = useRouter();
  const [email, setEmail] = useState('');

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/GLY_SALES_AGENTS`,
      },
    });

    if (error) {
      console.error('Error al iniciar sesión con Google:', error.message);
      alert('Error al iniciar sesión: ' + error.message);
    }
  };

  useEffect(() => {
    const checkAndInsertUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user?.email) {
        setEmail(user.email);

        const { data, error } = await supabase
          .from('GLNNEacces')
          .select('*')
          .eq('email', user.email)
          .single();

        if (!data && !error) {
          await supabase.from('GLNNEacces').insert([{ email: user.email }]);
        }

        router.push('/GLY_SALES_AGENTS');
      }
    };

    checkAndInsertUser();
  }, [router]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-white/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            className="relative bg-white p-5 sm:p-6 w-[90vw] max-w-[36rem] shadow-xl"
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-4 text-gray-400 hover:text-black text-xl"
            >
              ×
            </button>

            <h3 className="text-base font-bold text-gray-800 text-center mb-2">Empieza ahora</h3>
            <p className="text-xs text-gray-600 text-center mb-4">
              Inicia sesión para recibir recomendaciones personalizadas.
            </p>
            <button
  onClick={handleGoogleLogin}
  className="relative w-full flex items-center justify-center gap-2 py-3 px-6 bg-[#001FCC] text-white text-sm font-semibold overflow-hidden group rounded-xl shadow-xl"
>
  {/* Efecto de onda azul-blanca (como antes) */}
  <span className="absolute inset-0 z-0 bg-[linear-gradient(to-right,white_5%,#0029FF_5%,#0029FF_10%,white_10%)] bg-[length:40px_100%] opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-waves" />

  {/* Efecto barrido blanco */}
  <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />

  <FaGoogle className="w-4 h-4 z-10" />
  <span className="relative z-10">Continuar con Google</span>
</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
