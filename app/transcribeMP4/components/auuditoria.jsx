'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function GlyEnglishAnalysis({ transcriptionReady }) {
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasStartedPolling, setHasStartedPolling] = useState(false);

  useEffect(() => {
    let intervalId;

    const fetchAnalysis = async () => {
      try {
        const res = await axios.get('http://localhost:10000/obtener-analisis-ingles/');
        const result = res.data?.analisis;

        if (result && typeof result === 'string' && result.trim().length > 0) {
          setAnalysis(result);
          setError('');
          setLoading(false);
          clearInterval(intervalId);
        } else {
          setError('⏳ Esperando análisis...');
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const status = err.response?.status;
          if (status === 404) {
            setError('⏳ Aún no hay análisis disponible. Esperando...');
          } else {
            setError('❌ Error al obtener el análisis.');
          }
        } else {
          setError('❌ Error inesperado.');
        }
      }
    };

    if (transcriptionReady && !hasStartedPolling) {
      setLoading(true);
      fetchAnalysis();
      intervalId = setInterval(fetchAnalysis, 4000);
      setHasStartedPolling(true);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [transcriptionReady, hasStartedPolling]);

  return (
    <div className="w-full max-w-4xl mx-auto bg-white border border-gray-200 p-6 rounded-2xl shadow-lg">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        🧠 Análisis de Inglés con IA
      </h2>

      {loading ? (
        <p className="text-sm text-gray-500 animate-pulse">⏳ Buscando análisis...</p>
      ) : error && !analysis ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : (
        <pre className="bg-gray-100 p-4 rounded-xl text-sm text-gray-800 whitespace-pre-wrap max-h-[60vh] overflow-y-auto shadow-inner">
          {analysis}
        </pre>
      )}
    </div>
  );
}
