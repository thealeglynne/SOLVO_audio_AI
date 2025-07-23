'use client';

import { motion } from 'framer-motion';

const rolesAgente = [
  { key: 'auditor', label: '🔍 Auditor de procesos' },
  { key: 'desarrollador', label: '👨‍💻 Desarrollador de automatización' },
  { key: 'consultor', label: '📊 Consultor estratégico' },
  { key: 'mentor', label: '🧠 Mentor empresarial' },
];

const tonos = ['neutral', 'formal', 'amigable', 'analítico'];

export default function AgenteSidebarConfig({ config, setConfig }) {
  const updateConfig = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="w-72 bg-white border-r border-gray-200 px-5 py-6 flex flex-col gap-6 shadow-md">
      <h2 className="text-lg font-semibold text-gray-800">🎛️ Configurar Agente</h2>

      {/* Rol del agente */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Rol del agente</h3>
        <div className="flex flex-col gap-2">
          {rolesAgente.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => updateConfig('rolAgente', key)}
              className={`flex items-center gap-2 p-2 rounded-md border transition-all ${
                config.rolAgente === key
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Creatividad */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Creatividad</h3>
        <input
          type="range"
          min={0}
          max={1}
          step={0.1}
          value={config.creatividad}
          onChange={e => updateConfig('creatividad', parseFloat(e.target.value))}
          className="w-full accent-orange-500"
        />
        <p className="text-xs text-gray-500 mt-1 text-right">{config.creatividad.toFixed(1)}</p>
      </div>

      {/* Tono de respuesta */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Tono de respuesta</h3>
        <select
          value={config.tono}
          onChange={e => updateConfig('tono', e.target.value)}
          className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
        >
          {tonos.map(t => (
            <option key={t} value={t}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
