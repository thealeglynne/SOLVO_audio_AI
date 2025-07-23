'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUserTie } from 'react-icons/fa';
import Image from 'next/image';

const roles = [
  'Gerente General', 'Especialista en IA', 'Líder de Operaciones',
  'Director de Tecnología', 'Analista de Datos', 'Recursos Humanos',
  'Responsable de Transformación Digital', 'Otro'
];

export default function ModalInicio({ onComplete }) {
  const [showModal, setShowModal] = useState(true);
  const [rol, setRol] = useState('');

  const handleClose = () => {
    if (rol) {
      setShowModal(false);
      onComplete?.({ rol });
    }
  };

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          className="fixed inset-0 bg-white bg-opacity-70 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-3xl shadow-2xl w-[80vw] max-w-4xl px-[4vw] py-[5vh] text-gray-800"
            initial={{ scale: 0.95, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 40 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <div className="w-full flex flex-col items-center justify-center gap-[2vh]">
              <motion.h2
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="font-bold text-center text-black"
                style={{
                  fontSize: 'clamp(1.4rem, 2.5vw, 2.3rem)',
                  lineHeight: '1.3',
                }}
              >
                ¡Hola! Soy <span className="text-black">Tu Asesor de Estrategia IA</span>
              </motion.h2>

              <Image
                src="/logo2.png"
                alt="Logo GLY-IA"
                width={70}
                height={70}
                className="mt-[-8px]"
              />

<p
  className="text-center text-gray-600 max-w-[70ch]"
  style={{
    fontSize: 'clamp(0.75rem, 1.2vw, 1rem)',
    lineHeight: '1.6',
  }}
>
  Estás a punto de iniciar tu experiencia con <strong>GLY_SALES_AGENTS</strong>,  
  nuestro sistema inteligente de automatización de ventas.  

  <br /><br />
  Para que la plataforma pueda adaptarse a tus prioridades y mostrarte las funcionalidades  
  más relevantes, selecciona tu rol dentro de la organización.  

  <br /><br />

</p>


              <div className="w-full max-w-3xl text-center">
                <p
                  className="mb-2 font-semibold text-gray-500"
                  style={{ fontSize: 'clamp(0.7rem, 1vw, 0.9rem)' }}
                >
                  Selecciona tu rol actual dentro de la organización:
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {roles.map((r) => (
                    <motion.button
                      key={r}
                      whileTap={{ scale: 0.97 }}
                      whileHover={{ scale: 1.03 }}
                      onClick={() => setRol(r)}
                      className={`relative group overflow-hidden px-4 py-2 rounded-full border flex items-center gap-2 transition-all font-medium
                        ${rol === r
                          ? 'bg-black text-white border-black'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                      style={{ fontSize: 'clamp(0.65rem, 0.9vw, 0.85rem)' }}
                    >
                      <FaUserTie
                        className={`text-sm ${rol === r ? 'text-white' : 'text-gray-500'}`}
                      />
                      <span>{r}</span>
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ scale: rol ? 1.03 : 1 }}
                  onClick={handleClose}
                  disabled={!rol}
                  className={`px-6 py-3 rounded-full font-semibold text-white transition
                    ${rol ? 'bg-black hover:bg-gray-900' : 'bg-gray-400 cursor-not-allowed'}`}
                  style={{ fontSize: 'clamp(0.8rem, 1vw, 1rem)' }}
                >
                  Comenzar Diagnóstico Inteligente
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
