'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { getCurrentUser, subscribeToAuthState } from '../../lib/supabaseClient';
import ListaAuditorias from './ListaAuditorias';
import ModalInicio from './AnalisisProcesos';
import Perfil from './perfil';
import SeccionAudio from '../components/setAudio'

export default function ChatLLM({ empresa }) {
  const [windowWidth, setWindowWidth] = useState(1024);
  const [exitPromptVisible, setExitPromptVisible] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoginPopupVisible, setIsLoginPopupVisible] = useState(false);
  const [empresaInfo, setEmpresaInfo] = useState({ nombreEmpresa: '', rol: '' });
  const isMobile = windowWidth < 640;
  const API_URL = 'https://gly-ai-brain.onrender.com';
  const REQUEST_TIMEOUT = 40000;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        if (!currentUser) setIsLoginPopupVisible(true);
      } catch (error) {
        console.error('Error al obtener el usuario:', error.message);
      }
    };
    fetchUser();

    const subscription = subscribeToAuthState((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) setIsLoginPopupVisible(false);
    });

    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, []);

  const sendRequest = async (query) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    const response = await fetch(`${API_URL}/gpt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        rol: 'Auditor',
        temperatura: 0.7,
        estilo: 'Formal',
        config: {
          empresa: empresaInfo.nombreEmpresa || empresa?.nombreEmpresa || '',
          rolUsuario: empresaInfo.rol || empresa?.rol || '',
        },
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error HTTP! estado: ${response.status}, detalle: ${errorData.detail || 'Error desconocido'}`);
    }
    return await response.json();
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-white">
      <div className="w-[90vw] h-[85vh] bg-gray-100 rounded-xl shadow-xl overflow-hidden flex flex-col lg:flex-row border mt-[70px] border-gray-200">
        <ModalInicio onComplete={(info) => setEmpresaInfo(info)} />
        <div className="hidden lg:block lg:w-[30%] h-full bg-white border-r border-gray-200 overflow-y-auto p-4">
          {/* Componente Perfil */}
          <Perfil user={user} empresaInfo={empresaInfo} />
          <br />
          {/* Componente ListaAuditorias */}
          <ListaAuditorias />
        </div>

        {/* Área principal (vacía tras eliminar el chat y los modales) */}
        <div
  className="flex flex-col flex-1 px-3 sm:px-6 py-3 sm:py-5 h-full bg-cover bg-center bg-no-repeat"
  style={{ backgroundImage: "url('https://i.pinimg.com/originals/cd/35/b5/cd35b59a48beff51fadb3489d4ec7eb3.gif')" }}
>
  <div className="flex-1 flex items-center justify-center bg-transparent rounded-xl shadow-xl p-4">
    <SeccionAudio />
  </div>
</div>
      </div>

      {/* Confirmación de salida */}
      <AnimatePresence>
        {exitPromptVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[1000]"
          >
            <motion.div
              className="bg-white rounded-3xl shadow-xl max-w-md w-full mx-4 p-6 relative"
            >
              <button
                onClick={() => setExitPromptVisible(false)}
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
              >
                <X size={20} />
              </button>
              <h2 className="text-xl font-bold mb-4 text-gray-800">¿Deseas salir?</h2>
              <p className="text-gray-700 text-sm mb-6">
                Estás a punto de abandonar esta sesión de auditoría. ¿Estás seguro?
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setExitPromptVisible(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    setExitPromptVisible(false);
                    window.removeEventListener('beforeunload', () => {});
                    window.location.href = '/';
                  }}
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900"
                >
                  Salir de la página
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}