// app/components/GuardarAuditoria.js
'use client';

import { motion } from 'framer-motion';
import { getCurrentUser, saveAuditToSupabase } from '../../lib/supabaseClient';

export default function GuardarAuditoria({ auditContent, onSave }) {
  const handleSave = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        alert('Por favor, inicia sesión para guardar la auditoría.');
        return;
      }

      const { data, error } = await saveAuditToSupabase({
        audit_content: auditContent,
        user_id: user.id,
      });

      if (error) {
        console.error('Error saving audit:', error.message);
        alert('Error al guardar la auditoría: ' + error.message);
      } else {
        console.log('Audit saved successfully:', data);
        alert('Auditoría guardada exitosamente');
        if (onSave) onSave();
      }
    } catch (error) {
      console.error('Unexpected error:', error.message);
      alert('Error inesperado: ' + error.message);
    }
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
      onClick={handleSave}
      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
    >
      Guardar Auditoría
    </motion.button>
  );
}