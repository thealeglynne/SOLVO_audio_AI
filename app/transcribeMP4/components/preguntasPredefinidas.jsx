'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaLightbulb,
  FaMicrophone,
  FaVolumeUp,
  FaWaveSquare,
  FaExclamationTriangle,
  FaChartLine,
} from 'react-icons/fa';

const instrucciones = [
  {
    label: 'Habla claro y pausado',
    icon: <FaMicrophone className="text-[#001FCC] text-lg" />,
    descripcion: `Articula bien las palabras y mantén un ritmo constante para mejorar la precisión de la transcripción.`,
  },
  {
    label: 'Ambiente silencioso',
    icon: <FaVolumeUp className="text-[#001FCC] text-lg" />,
    descripcion: `Graba en un lugar sin ruido de fondo. Evita espacios con eco o interferencias sonoras.`,
  },
  {
    label: 'Calidad de audio',
    icon: <FaWaveSquare className="text-[#001FCC] text-lg" />,
    descripcion: `Usa un buen micrófono y verifica que el volumen de grabación sea óptimo (ni muy alto ni muy bajo).`,
  },
  {
    label: 'Estructura tu contenido',
    icon: <FaLightbulb className="text-[#001FCC] text-lg" />,
    descripcion: `Organiza tus ideas antes de grabar: introduce el tema, desarrolla los puntos clave y concluye.`,
  },
  {
    label: 'Evita interrupciones',
    icon: <FaExclamationTriangle className="text-[#001FCC] text-lg" />,
    descripcion: `Intenta grabar de una sola vez. Si debes pausar, haz silencios claros para facilitar el corte.`,
  },
  {
    label: 'Duración adecuada',
    icon: <FaChartLine className="text-[#001FCC] text-lg" />,
    descripcion: `Divide contenido largo en segmentos de 5-10 minutos. Audios más cortos tienen mejor calidad de transcripción.`,
  },
];

export default function InstruccionesAuditoriaCompact() {
  const [activeIndex, setActiveIndex] = useState(null);

  return (
    <div className="w-full max-w-[400px] mx-auto p-4 space-y-4 bg-white rounded-2xl shadow-lg border border-gray-200">
      <motion.h2
        className="text-lg font-bold text-center text-gray-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Recomendaciones para tu grabación
      </motion.h2>

      <p className="text-sm text-gray-500 text-center">
        Sigue estos consejos para obtener la mejor transcripción de audio posible.
      </p>

      <div className="flex flex-col gap-3">
        {instrucciones.map((item, index) => (
          <motion.div
            key={index}
            onClick={() => setActiveIndex(index)}
            className="bg-white border border-gray-300 rounded-xl p-3 cursor-pointer hover:shadow-md transition"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="flex items-start gap-2 text-sm font-semibold text-gray-700">
              {item.icon}
              <span>{item.label}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* POPUP CON BLUR */}
      <AnimatePresence>
        {activeIndex !== null && (
          <motion.div
            className="fixed inset-0 backdrop-blur-sm bg-white/40 z-50 flex items-center justify-center px-4"
            onClick={() => setActiveIndex(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white max-w-sm w-full rounded-xl p-5 shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="flex items-center gap-2 mb-2">
                {instrucciones[activeIndex].icon}
                <h3 className="text-md font-bold text-gray-800">
                  {instrucciones[activeIndex].label}
                </h3>
              </div>
              <p className="text-sm text-gray-600 whitespace-pre-line">
                {instrucciones[activeIndex].descripcion}
              </p>
              <button
                onClick={() => setActiveIndex(null)}
                className="absolute top-2 right-3 text-lg font-bold text-gray-400 hover:text-black"
              >
                ×
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}