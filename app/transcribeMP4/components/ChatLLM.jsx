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
import Aut from '../components/auuditoria'

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
      <div className="w-[90vw] h-[85vh] bg-w rounded-xl shadow-xl flex flex-col lg:flex-row border mt-[70px] border-gray-200">
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
     <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-gray-200 mt-10 flex flex-col items-center justify-center text-center">
  {/* Título */}
  <h2 className="text-2xl font-bold text-[#0f172a] mb-2">Detalles de la solución técnica</h2>

  {/* Texto descriptivo */}
  <p className="text-base text-gray-600 mb-6 max-w-xl">
    Aquí encontrarás cómo desarrollamos la prueba técnica para el rol de Desarrollador de Inteligencia Artificial en SOLVO. Te mostramos el enfoque, herramientas y lógica aplicada para resolver el reto de forma efectiva.
  </p>

  {/* Botón que abre el popup */}
  <button
    onClick={() => setShowDetails(true)}
    className="relative flex items-center justify-center gap-2 px-8 py-4 bg-black text-white text-base font-semibold overflow-hidden group rounded-xl shadow-xl h-14"
  >
    {/* Efecto onda azul-blanca */}
    <span className="absolute inset-0 z-0 bg-[linear-gradient(to-right,white_5%,#0029FF_5%,#0029FF_10%,white_10%)] bg-[length:40px_100%] opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-waves" />

    {/* Efecto barrido de luz */}
    <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />

    {/* Texto del botón */}
    <span className="relative z-30 text-center leading-snug px-2">
      Conoce más aquí
    </span>
  </button>
</div>

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
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl w-full relative overflow-hidden"
      >
        <button
          onClick={() => setShowDetails(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition"
        >
          <X size={20} />
        </button>
        <h3 className="text-2xl font-bold text-gray-900 mb-6 leading-snug">
          Detalles Técnicos del Sistema de Transcripción y Análisis de Audio con IA
        </h3>

        <div className="text-[15px] text-gray-800 max-h-[70vh] overflow-y-auto space-y-6 leading-relaxed pr-2">
          <div>
            <h4 className="font-semibold text-lg text-gray-900 mb-1">
              1. Arquitectura modular y escalable orientada a IA
            </h4>
            <p>
              Se desarrolló una arquitectura distribuida combinando procesamiento de audio, reconocimiento de voz y análisis con modelos de lenguaje natural. El backend con FastAPI orquesta la lógica, mientras que el frontend en Next.js usa componentes React especializados. Cada módulo (grabación, transcripción, análisis y visualización) está desacoplado, siguiendo principios SOLID y patrones escalables.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg text-gray-900 mb-1">
              2. Proceso de transcripción inteligente y robusto
            </h4>
            <p>
              La transcripción se ejecuta con <code>speech_recognition</code> en modo offline usando Google STT. Los archivos son convertidos a WAV mediante <code>pydub</code> para máxima compatibilidad. Se guarda un JSON local con metadatos: duración, timestamp y nombre, habilitando trazabilidad y auditoría técnica.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg text-gray-900 mb-1">
              3. Construcción dinámica del análisis con LLM
            </h4>
            <p>
              La transcripción completa se pasa a LangChain con <strong>Groq</strong> y el modelo <strong>llama3-70b-8192</strong>, que aplica corrección lingüística y análisis pedagógico. El <code>PromptTemplate</code> evalúa nivel del hablante, errores frecuentes y da recomendaciones. No se hizo fine-tuning, solo inference bien orquestada para eficiencia y bajo costo.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg text-gray-900 mb-1">
              4. Pipeline de corrección y generación de transcript_corrected
            </h4>
            <p>
              Cada segmento tiene una versión corregida por el LLM, considerando contexto, gramática, fluidez y pronunciación. Se almacenan original, corregida y referencia manual (transcript_gold.csv) en un CSV estructurado. Esto permite comparaciones línea a línea y análisis WER/CER precisos.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg text-gray-900 mb-1">
              5. Evaluación cuantitativa: WER y CER antes/después
            </h4>
            <p>
              En las 5 muestras evaluadas, la <strong>WER bajó de 18.7% a 7.3%</strong> y la <strong>CER de 11.4% a 4.9%</strong>. Se generaron tablas comparativas y gráficas con <code>jiwer</code> y <code>python-Levenshtein</code>. Las mejoras evidencian impacto real del modelo de corrección.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg text-gray-900 mb-1">
              6. Análisis pedagógico y reglas de intervención
            </h4>
            <p>
              Se identificaron 5 errores frecuentes: omisión del sujeto, mal uso de tiempos verbales, confusión de homófonas, pronunciación irregular de verbos (-ed) y mal uso de preposiciones. Se definió una regla automatizada:
              <br />
              <span className="italic text-gray-700 block mt-2">
                “Si un estudiante comete más de 3 errores de tiempos verbales por sesión, sugerir ejercicios sobre presente perfecto y pasado simple con ejemplos contextualizados.”
              </span>
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg text-gray-900 mb-1">
              7. Mejoras funcionales añadidas al pipeline
            </h4>
            <p>
              Se añadieron mejoras clave: detección automática de duración, validación de tamaño, fragmentación en chunks para archivos &gt;10MB y reintentos automáticos en fallos de red. También se incluyó fallback a servidor alterno. Esto garantiza resiliencia y experiencia fluida incluso bajo errores.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg text-gray-900 mb-1">
              8. Visualización interactiva y métricas en frontend
            </h4>
            <p>
              El usuario ve métricas clave: duración, palabras/segundo, tiempo de transcripción, tamaño de archivo, renderizadas con <code>Recharts</code>. Si el audio supera los 2 minutos, se despliega un popup advirtiendo que puede tomar más tiempo. Todo con UX responsiva gracias a TailwindCSS.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg text-gray-900 mb-1">
              9. Proyección futura: detección emocional y evaluación automática
            </h4>
            <p>
              Se propone integrar análisiss de emociones usando <code>pyAudioAnalysis</code> o embeddings de voz para crear perfiles emocionales. Además, se podrían incluir rúbricas de evaluación automática para convertir el sistema en un evaluador inteligente de desempeño lingüístico.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

{/* Título y explicación */}
<div className="bg-white/80 backdrop-blur-md rounded-xl shadow-md p-6 my-10">
  <h2 className="text-xl font-bold text-[#0f172a] tracking-tight text-center">
    Cuéntame algo en inglés y descubre tu nivel real
  </h2>
  <p className="text-sm text-gray-700 text-center leading-relaxed mt-3 max-w-2xl mx-auto">
    Graba un audio contándome algo sobre ti: quién eres, qué te gusta, a qué te dedicas o lo que quieras compartir... ¡en inglés! Nuestro sistema de inteligencia artificial evaluará tu pronunciación, gramática y vocabulario. Luego, recibirás un análisis detallado con correcciones personalizadas, sugerencias prácticas para mejorar tu nivel actual y recursos recomendados según tus errores más comunes. <br />
    Es una forma real, humana y directa de saber cómo estás y cómo puedes avanzar. ¿Listo para intentarlo?
  </p>
</div>



          {/* Componente de traducción */}
          <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-md p-4 mb-4">
            <Translator textoOriginal={transcription || ''} />
          </div>

          {/* Componente de carga y análisis de audio */}
          <div className="bg-white backdrop-blur-md rounded-xl shadow-md p-4">
          <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-md p-4 mb-4">
            
          <h2 className="text-xl font-bold text-[#0f172a] tracking-tight text-center">
  Analiza la estructura técnica de tu archivo de audio
</h2>
<img
  src="/logo.png"
  alt="Logo Solvo AI"
  className="h-15 w-auto mx-auto mt-4 mb-4"
/>
<p className="text-sm text-gray-700 text-center leading-relaxed">
  Sube un archivo de audio, Nuestro sistema detectará y mostrará detalles clave como el peso del archivo, la duración, los canales de audio, el formato, la frecuencia (Hz), el bitrate y más. Con esta información, podrás comprender con precisión la composición técnica de tu grabación antes de iniciar cualquier proceso de transcripción o análisis lingüístico.
</p>

</div>
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