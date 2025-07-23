'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCurrentUser, supabase, subscribeToAuthState } from '../../lib/supabaseClient';
import { X } from 'lucide-react';
import { FaTrash, FaListUl } from 'react-icons/fa';
import PreguntasSugeridas from './preguntasPredefinidas';

export default function AuditoriasFullScreen() {
  const [user, setUser] = useState(null);
  const [auditorias, setAuditorias] = useState([]);
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };
    fetchUser();
    const sub = subscribeToAuthState((event, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchAuditorias = async () => {
      const { data, error } = await supabase
        .from('auditorias')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (!error) setAuditorias(data);
    };
    fetchAuditorias();
  }, [user]);

  const handleDelete = async (auditId) => {
    try {
      const { error } = await supabase
        .from('auditorias')
        .delete()
        .eq('id', auditId)
        .eq('user_id', user.id);
      if (error) throw error;
      setAuditorias((prev) => prev.filter((audit) => audit.id !== auditId));
      if (selectedAudit?.id === auditId) setSelectedAudit(null);
    } catch (error) {
      console.error('Error deleting audit:', error.message);
      alert('No se pudo eliminar la auditoría: ' + error.message);
    }
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  return (
    <div className="w-full h-screen bg-white relative flex flex-col">
      {/* 🎯 Contenedor principal con preguntas y sidebar */}
      <div className="flex-1 flex flex-row relative">
        {/* Sidebar de auditorías */}
        <AnimatePresence>
          {showSidebar && (
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3 }}
              className="absolute top-0 left-0 h-full w-[315px] bg-white border-r border-gray-200 shadow-lg z-30 overflow-y-auto"
            >
              <div className="p-5 flex justify-between items-center border-b border-gray-200">
                <h2 className="text-lg font-semibold">Mis Auditorías</h2>
                <button onClick={toggleSidebar} className="text-gray-500 hover:text-black">
                  <X size={20} />
                </button>
              </div>

              <div className="p-4 space-y-3">
                {auditorias.length === 0 ? (
                  <p className="text-sm text-gray-500">Aún no tienes auditorías.</p>
                ) : (
                  auditorias.map((a) => (
                    <motion.div
                      key={a.id}
                      onClick={() => setSelectedAudit(a)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="cursor-pointer bg-gray-50 border border-gray-200 hover:border-black rounded-lg p-3 shadow-sm flex justify-between items-center"
                    >
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-700">
                          {new Date(a.created_at).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 line-clamp-2">
                          {typeof a.audit_content === 'string'
                            ? a.audit_content.slice(0, 100)
                            : JSON.stringify(a.audit_content).slice(0, 100)}
                          ...
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(a.id);
                        }}
                        className="text-gray-400 hover:text-red-600 transition p-2"
                      >
                        <FaTrash size={14} />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contenido principal */}
        <div className={`flex-1 h-full overflow-y-auto transition-all duration-300 ${showSidebar ? 'ml-[320px]' : 'ml-0'}`}>
          {/* 🟠 Botón para abrir/cerrar el panel de auditorías - 100px más abajo */}
          <button
            onClick={toggleSidebar}
            className="fixed top-[90px] left-5 z-40 bg-black text-white p-3 rounded-full shadow-lg hover:bg-gray-900 transition"
          >
            <FaListUl size={18} />
          </button>

          {/* Componente de preguntas predefinidas */}
          <PreguntasSugeridas 
            onSeleccionar={(pregunta) => console.log('Seleccionaste:', pregunta)}
            className="min-h-full"
          />
        </div>
      </div>

      {/* Footer fijo en la parte inferior */}
      <footer className="bg-white p-4 border-t border-gray-200 text-center">
        <p className="text-xs text-gray-500">
          © GLYNNE 2025 - Innovación impulsada por inteligencia artificial
        </p>
      </footer>

      {/* 🪟 Modal detalle de auditoría */}
      <AnimatePresence>
        {selectedAudit && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-2xl p-6 w-[90%] max-w-3xl max-h-[80%] overflow-y-auto shadow-xl relative"
            >
              <button
                onClick={() => setSelectedAudit(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-black transition"
              >
                <X size={20} />
              </button>

              <h3 className="text-lg font-bold mb-4">
                Auditoría del {new Date(selectedAudit.created_at).toLocaleString()}
              </h3>

              <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                {typeof selectedAudit.audit_content === 'string'
                  ? selectedAudit.audit_content
                  : JSON.stringify(selectedAudit.audit_content, null, 2)}
              </pre>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}