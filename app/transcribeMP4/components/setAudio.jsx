'use client';

import { useState, useRef } from 'react';
import { X, Upload } from 'lucide-react';

export default function AudioTranscriber() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const API_URL = 'https://gly-ai-brain.onrender.com/transcribe';

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'audio/mpeg') {
      setFile(droppedFile);
      setError('');
    } else {
      setError('Por favor, carga un archivo MP3 válido.');
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'audio/mpeg') {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Por favor, selecciona un archivo MP3 válido.');
    }
  };

  const handleClearFile = () => {
    setFile(null);
    setTranscription('');
    setSummary('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Por favor, selecciona un archivo MP3.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error HTTP! estado: ${response.status}`);
      }

      const data = await response.json();
      setTranscription(data.transcription || 'No se recibió transcripción');
      setSummary(data.summary || 'No se recibió resumen');
    } catch (err) {
      setError(`Error al transcribir: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-[90vw] max-w-4xl mx-auto p-6 -mt-5  bg-white/20 backdrop-blur-md shadow-xl border border-white/30 rounded-xl">
      <div className="grid grid-cols-1 gap-6">

        {/* Zona de drag-and-drop CON blur */}
        <div
          className={`p-8 border-2 border-dashed rounded-lg text-center transition-all 
            ${isDragging ? 'border-blue-400 bg-white/30' : 'border-white/30 bg-white/20'} 
            backdrop-blur-lg`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-200" />
          <p className="mt-2 text-sm text-white">
            {file ? file.name : 'Arrastra y suelta un archivo MP3 aquí'}
          </p>
          {file && (
            <button
              onClick={handleClearFile}
              className="mt-2 text-white hover:text-red-400 flex items-center justify-center mx-auto"
            >
              <X size={16} className="mr-1" /> Limpiar
            </button>
          )}
          <input
            type="file"
            accept="audio/mpeg"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="hidden"
            id="file-input"
          />
          <label
            htmlFor="file-input"
            className="relative mt-4 inline-block px-6 py-3 text-sm font-semibold text-white bg-[#001FCC]/80 overflow-hidden group rounded-lg shadow-lg cursor-pointer backdrop-blur"
          >
            <span className="absolute inset-0 z-0 bg-[linear-gradient(to-right,white_5%,#001FCC_5%,#001FCC_10%,white_10%)] bg-[length:40px_100%] opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-waves" />
            <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
            <span className="relative z-10">Seleccionar archivo</span>
          </label>

          {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
        </div>

        {/* Botón para enviar CON blur */}
        <div className="text-center backdrop-blur-sm bg-white/20 p-4 rounded-lg">
          <button
            onClick={handleUpload}
            disabled={isLoading || !file}
            className={`px-6 py-2 rounded-lg text-white ${
              isLoading || !file
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Procesando...' : 'Transcribir'}
          </button>
        </div>

        {/* Ventanas de resultados CON blur */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 backdrop-blur-lg bg-white/20 border border-white/30 shadow-sm rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Transcripción</h3>
            <div className="text-sm text-white/90 whitespace-pre-wrap leading-relaxed min-h-[150px] max-h-[300px] overflow-y-auto">
              {transcription || 'La transcripción aparecerá aquí...'}
            </div>
          </div>

          <div className="p-4 backdrop-blur-lg bg-white/20 border border-white/30 shadow-sm rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Resumen</h3>
            <div className="text-sm text-white/90 whitespace-pre-wrap leading-relaxed min-h-[150px] max-h-[300px] overflow-y-auto">
              {summary || 'El resumen aparecerá aquí...'}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
