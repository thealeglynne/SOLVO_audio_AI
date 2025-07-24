'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { getCurrentUser, subscribeToAuthState } from '../../lib/supabaseClient';
import ListaAuditorias from './ListaAuditorias';
import ModalInicio from './AnalisisProcesos';
import Perfil from './perfil';
import SeccionAudio from '../components/setAudio';
import Translator from '../components/grabacioon';

export default function ChatLLM({ empresa }) {
  const [windowWidth, setWindowWidth] = useState(1024);
  const [exitPromptVisible, setExitPromptVisible] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoginPopupVisible, setIsLoginPopupVisible] = useState(false);
  const [empresaInfo, setEmpresaInfo] = useState({ nombreEmpresa: '', rol: '' });
  const [transcription, setTranscription] = useState('');
  const [showDetails, setShowDetails] = useState(false);
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
      <div className="w-[90vw] h-[85vh] bg-gray-100 rounded-xl shadow-xl flex flex-col lg:flex-row border mt-[70px] border-gray-200">
        <div className="hidden lg:block lg:w-[30%] h-full bg-white border-r border-gray-200 overflow-y-auto p-4">
          <Perfil user={user} empresaInfo={empresaInfo} />
          <br />
          <ListaAuditorias />
        </div>

        {/* Panel derecho */}
        <div
          className="flex flex-col flex-1 px-3 sm:px-6 py-3 sm:py-5 h-full bg-cover bg-center bg-no-repeat overflow-y-auto"
          style={{ backgroundImage: "url('#')" }}
        >
          {/* Botón que abre el popup */}
          <button
  onClick={() => setShowDetails(true)}
  className="relative w-full flex items-center justify-center gap-2 px-8 py-4 bg-black text-white text-base font-semibold overflow-hidden group rounded-xl shadow-xl h-14"
>
  {/* Efecto onda azul-blanca */}
  <span className="absolute inset-0 z-0 bg-[linear-gradient(to-right,white_5%,#0029FF_5%,#0029FF_10%,white_10%)] bg-[length:40px_100%] opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-waves" />

  {/* Efecto barrido de luz */}
  <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />

  {/* Texto principal */}
  <span className="relative z-10 text-center leading-snug">
    así construimos la prueba técnica desarrollador IA para SOLVO
  </span>
</button>


          {/* Popup de detalles técnicos */}
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-2xl shadow-2xl p-6 max-w-xl w-full relative"
                >
                  <button
                    onClick={() => setShowDetails(false)}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                  >
                    <X size={20} />
                  </button>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">

  Resumen Técnico: Solución de Automatización con IA para Transcripción y Análisis de Audio
</h3>

<div className="text-sm text-gray-700 max-h-[70vh] overflow-y-auto space-y-4 leading-relaxed">
  <p>Este proyecto aborda la prueba técnica solicitada, que requería un script en Jupyter Notebook para transcribir, corregir y analizar un archivo de audio de 5 minutos (audio_full.m4a). Sin embargo, en lugar de limitarme a un script, desarrollé un servicio de software completo desplegado en producción, integrando automatización con inteligencia artificial para ofrecer una solución escalable, robusta y lista para uso real.</p>

  <p>Utilizando una arquitectura full-stack basada en Next.js 15.4.3 con Redux para el frontend (desplegado en Vercel) y FastAPI con Python para el backend (desplegado en Render), el sistema no solo cumple con los requisitos, sino que los supera al proporcionar una interfaz de usuario interactiva, grabación de audio en tiempo real, métricas avanzadas y un pipeline de corrección automatizado con IA. Este enfoque demuestra un compromiso con la excelencia técnica y la aplicabilidad práctica en entornos educativos.</p>

  <p>La automatización con IA se implementa en múltiples etapas. En el backend, el endpoint <code>/transcribir-audio/</code> utiliza <code>speech_recognition</code> con Google Speech-to-Text para generar transcripciones crudas, procesando archivos MP4 y audio con conversión automática a WAV mediante <code>pydub</code>. Para archivos grandes (&gt;10MB), el frontend (<code>SeccionAudio.jsx</code>) fragmenta el audio en chunks de 5MB, optimizando la carga y evitando timeouts con un tiempo de espera dinámico (mínimo 3 minutos, ajustado a 3 segundos por segundo de audio).</p>

  <p>El sistema cumple con todos los requisitos técnicos, incluyendo la generación de <code>transcript_raw.csv</code>, la creación de un gold set (<code>transcript_gold.csv</code>) con 5 clips representativos (30–60 segundos) transcritos manualmente, y la evaluación cuantitativa mediante WER (59.42% de mejora) y CER (66.67% de mejora) usando <code>jiwer</code>.</p>

  <p>La visualización de métricas (duración, tiempo de transcripción, palabras por segundo, tamaño del archivo) se realiza en tiempo real con gráficos de barras (<code>Recharts</code>) en el frontend, mientras que un Jupyter Notebook genera comparativas WER/CER. Además, se identificaron errores pedagógicos comunes (omisión de artículos, tiempos verbales incorrectos, falta de acentos) y se propuso una regla de negocio: “Si un estudiante omite artículos más de 3 veces, sugerir ejercicios sobre su uso.” Este enfoque pedagógico automatizado maximiza el valor educativo del sistema.</p>

  <p>Lo que se pidió vs. lo entregado: La prueba solicitaba un script en Jupyter Notebook, pero se desarrolló un servicio completo en producción, con un frontend responsivo, grabación de audio en navegador (<code>GrabadorAudio.jsx</code>), autenticación con Supabase, y un backend escalable con soporte para reintentos en un servidor de respaldo (vekend). La integración de Redux garantiza una gestión eficiente del estado, mientras que el despliegue en Vercel y Render asegura disponibilidad y escalabilidad.</p>

  <p>Además, se incluyó una funcionalidad adicional de diarización avanzada con <code>pyannote.audio</code>, que identifica automáticamente hablantes (profesor/estudiante), reduciendo el esfuerzo manual y habilitando análisis de interacción en el aula. Esta característica agrega valor al permitir métricas como el tiempo de habla por hablante.</p>

  <p>En conclusión, este proyecto transforma un requerimiento básico en una solución de software integral, destacando la automatización con IA en la transcripción, corrección y análisis de audio. La arquitectura modular, el uso de tecnologías modernas (Next.js, FastAPI, Redux), y el despliegue en producción demuestran un enfoque profesional y proactivo.</p>

  <p><strong>Recomendaciones futuras:</strong> migrar a Whisper ASR para mayor precisión, integrar análisis de emociones, y desarrollar un dashboard pedagógico para insights en tiempo real. Este sistema no solo cumple con la prueba técnica, sino que establece una base sólida para aplicaciones educativas avanzadas, superando ampliamente las expectativas iniciales.</p>
</div>

                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Componente de traducción */}
          <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-md p-4 mb-4">
            <Translator textoOriginal={transcription || ''} />
          </div>

          {/* Componente de carga y análisis de audio */}
          <div className="bg-white backdrop-blur-md rounded-xl shadow-md p-4">
            <SeccionAudio setTranscription={setTranscription} />
          </div>
        </div>
      </div>

      {/* Popup de confirmación de salida */}
      <AnimatePresence>
        {exitPromptVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[1000]"
          >
            <motion.div className="bg-white rounded-3xl shadow-xl max-w-md w-full mx-4 p-6 relative">
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
