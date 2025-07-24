'use client';

import React, { useState } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Cell,
} from 'recharts';

export default function SeccionAudio() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [error, setError] = useState('');
  const [metrics, setMetrics] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleFileChange = async (e) => {
    const selected = e.target.files?.[0];
    if (selected && selected.type.startsWith('audio/') || selected.type === 'video/mp4') {
      if (selected.size > 100 * 1024 * 1024) {
        setError('El archivo es demasiado grande. Selecciona un archivo menor a 100MB.');
        setFile(null);
        return;
      }
      setFile(selected);
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const arrayBuffer = await selected.arrayBuffer();
      try {
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const duration = audioBuffer.duration;
        setMetrics({
          duration: duration.toFixed(1),
          format: selected.name.split('.').pop(),
          sampleRate: audioBuffer.sampleRate,
          transcription_time: 0,
        });
        if (duration > 120) {
          setShowPopup(true);
        }
      } catch (err) {
        setMetrics({
          duration: (Math.random() * 300 + 60).toFixed(1),
          format: selected.name.split('.').pop(),
          sampleRate: 44100,
          transcription_time: 0,
        });
        setError('No se pudo analizar la duración del audio. Usando valores predeterminados.');
      }
      setError('');
    } else {
      setFile(null);
      setError('Selecciona un archivo de audio o MP4 válido.');
    }
  };

  const splitAudioFile = async (file, chunkSize = 5 * 1024 * 1024) => {
    const chunks = [];
    const arrayBuffer = await file.arrayBuffer();
    const totalSize = arrayBuffer.byteLength;

    for (let start = 0; start < totalSize; start += chunkSize) {
      const end = Math.min(start + chunkSize, totalSize);
      const chunk = arrayBuffer.slice(start, end);
      chunks.push(new File([chunk], `${file.name}_chunk_${start}`, { type: file.type }));
    }
    return chunks;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Selecciona un archivo para continuar.');
      return;
    }

    setIsUploading(true);
    setTranscription('');
    setError('');

    const ext = file.name.split('.').pop();
    const safeFilename = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const duration = metrics?.duration ? Number(metrics.duration) : 120;
    const dynamicTimeout = Math.max(180000, duration * 1000 * 3);

    let chunks = [file];
    if (file.size > 10 * 1024 * 1024) {
      chunks = await splitAudioFile(file);
    }

    const start = Date.now();
    let fullTranscription = '';

    const attemptTranscription = async (url, attempt = 1) => {
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const renamedFile = new File([chunk], `${safeFilename}_part${i}.${ext}`, { type: file.type });
        const formData = new FormData();
        formData.append('file', renamedFile);
        formData.append('chunk_index', i);
        formData.append('total_chunks', chunks.length);

        let chunkSuccess = false;
        let chunkRetryCount = 0;

        while (!chunkSuccess && chunkRetryCount < 2) {
          try {
            const res = await axios.post(
              url,
              formData,
              {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: dynamicTimeout,
              }
            );

            if (res.data?.transcripcion) {
              fullTranscription += res.data.transcripcion + ' ';
              chunkSuccess = true;
            } else {
              throw new Error(`Transcripción fallida para el fragmento ${i}`);
            }
          } catch (err) {
            console.error(`Error en fragmento ${i}, intento ${chunkRetryCount + 1}:`, err);
            chunkRetryCount++;
            if (chunkRetryCount < 2) {
              setError(`Error en el fragmento ${i}, reintentando (${chunkRetryCount}/2)...`);
              continue;
            } else if (attempt < 2 && url === 'https://solvo-audio-ai-back.onrender.com/transcribir-audio/') {
              setError(`Error en el servidor principal para el fragmento ${i}, intentando con el servidor de respaldo...`);
              setRetryCount(attempt + 1);
              return attemptTranscription('https://vekend-audio-ai-back.onrender.com/transcribir-audio/', attempt + 1);
            } else {
              setError(`Error al procesar el fragmento ${i}: ${err.message.includes('timeout') ? 'Tiempo de espera agotado' : err.message || 'Error del servidor o red.'}`);
              setIsUploading(false);
              setRetryCount(0);
              return;
            }
          }
        }
      }

      const end = Date.now();
      setTranscription(fullTranscription.trim());
      setMetrics((prev) => ({
        ...prev,
        transcription_time: ((end - start) / 1000).toFixed(2),
      }));
      setRetryCount(0);
      setIsUploading(false);
    };

    await attemptTranscription('https://solvo-audio-ai-back.onrender.com/transcribir-audio/');
  };

  const chartData = metrics
    ? [
        {
          name: 'Duración (s)',
          value: Math.min(Number(metrics.duration), 300),
        },
      
        {
          name: 'Transcripción (s)',
          value: Number(metrics.transcription_time),
        },
        {
          name: 'Palabras/s',
          value: transcription
            ? Number((transcription.trim().split(/\s+/).length / metrics.duration).toFixed(2))
            : 0,
        },
        {
          name: 'Tamaño (MB)',
          value: file ? Number((file.size / (1024 * 1024)).toFixed(2)) : 0,
        },
      ]
    : [];

  return (
    <div className="w-full min-h-screen  text-neutral-900 px-4 py-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {showPopup && (
          <div className="fixed inset-0 backdrop-blur-md backdrop-saturate-150 bg-white/30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">Advertencia</h3>
              <p className="text-sm text-neutral-700 mb-4">
                El audio seleccionado dura más de 2 minutos. La transcripción puede tardar unos minutos.
              </p>
              <button
                onClick={() => setShowPopup(false)}
                className="w-full py-2 rounded-xl bg-neutral-900 text-white hover:bg-black font-semibold text-sm"
              >
                Entendido
              </button>
            </div>
          </div>
        )}

        <div className="md:col-span-1 bg-neutral-50 border border-neutral-300 shadow-md p-6 rounded-2xl">
          <h2 className="text-lg font-semibold text-neutral-800 mb-4">Sube tu archivo de audio</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <label
              htmlFor="audioFile"
              className={`block w-full px-4 py-6 text-center border-2 border-dashed rounded-xl cursor-pointer transition text-sm ${
                file ? 'border-neutral-500 bg-neutral-200' : 'border-neutral-400 hover:bg-neutral-100'
              }`}
            >
              <input
                type="file"
                id="audioFile"
                accept="audio/*,video/mp4"
                onChange={handleFileChange}
                className="hidden"
              />
              {file ? (
                <span className="text-neutral-700 font-medium">{file.name}</span>
              ) : (
                <span className="text-neutral-500">Haz clic o arrastra tu archivo aquí</span>
              )}
            </label>
            {error && <p className="text-sm text-red-600 italic animate-pulse">{error}</p>}
            <button
              type="submit"
              disabled={isUploading || !file}
              className={`w-full py-2 rounded-xl font-semibold transition text-sm ${
                isUploading || !file
                  ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                  : 'bg-neutral-900 text-white hover:bg-black'
              }`}
            >
              {isUploading ? 'Transcribiendo...' : 'Transcribir Audio'}
            </button>
          </form>
        </div>

        <div className="md:col-span-2 bg-neutral-50 border border-neutral-300 shadow-md p-6 rounded-2xl">
          <h2 className="text-lg font-semibold text-neutral-800 mb-4">Transcripción generada</h2>
          <div className="flex-1 overflow-y-auto p-3 bg-neutral-100 rounded-xl text-sm text-neutral-800 whitespace-pre-wrap scroll-smooth max-h-[40vh] shadow-inner">
            {transcription ? transcription : 'Aquí aparecerá el texto transcrito.'}
          </div>
        </div>

        <div className="md:col-span-3 bg-neutral-50 border border-neutral-300 shadow-md p-6 rounded-2xl">
          <h2 className="text-lg font-semibold text-neutral-800 mb-4">Métricas del Audio</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 40, right: 20 }}>
              <XAxis type="number" stroke="#111827" />
              <YAxis dataKey="name" type="category" stroke="#111827" />
              <Tooltip
                wrapperStyle={{ backgroundColor: '#f3f4f6', borderRadius: 8 }}
                contentStyle={{ fontSize: '0.875rem', color: '#111827' }}
              />
              <Bar dataKey="value" radius={[4, 4, 4, 4]}>
                <LabelList dataKey="value" position="right" fill="#111827" />
                {chartData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={['#737373', '#525252', '#a3a3a3', '#d4d4d4', '#e5e5e5'][i % 5]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {metrics && (
            <div className="mt-4 text-sm text-neutral-700 space-y-1">
              <p><strong className="text-neutral-600">Formato:</strong> {metrics.format}</p>
              <p><strong className="text-neutral-600">Nombre:</strong> {file?.name}</p>
              <p><strong className="text-neutral-600">Sample Rate:</strong> {metrics.sampleRate} Hz</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
