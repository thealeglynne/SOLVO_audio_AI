'use client';

import React, { useState } from 'react';
import axios from 'axios';

const AudioUploader = () => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selected = e.target.files[0];

    if (selected && selected.type.startsWith('audio/')) {
      setFile(selected);
      setError('');
    } else {
      setFile(null);
      setError('Selecciona un archivo de audio válido (.mp3, .wav, .m4a, .ogg, etc).');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError('Por favor, selecciona un archivo antes de continuar.');
      return;
    }

    setIsUploading(true);
    setTranscription('');
    setError('');

    const formData = new FormData();

    const extension = file.name.split('.').pop();
    const safeFilename = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${extension}`;
    const renamedFile = new File([file], safeFilename, { type: file.type });

    formData.append('file', renamedFile);

    try {
      const res = await axios.post(
        'https://solvo-audio-ai-back.onrender.com/transcribir-audio/',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 12000000,
        }
      );

      if (res.data?.transcripcion) {
        setTranscription(res.data.transcripcion);
      } else {
        setError('La transcripción no se recibió correctamente.');
      }
    } catch (err) {
      console.error('Error de transcripción:', err);
      if (err.response) {
        setError(err.response.data.detail || 'Error del servidor.');
      } else if (err.request) {
        setError('El servidor no respondió. Espera unos segundos y vuelve a intentar.');
      } else {
        setError(`Error desconocido: ${err.message}`);
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-xl font-bold text-gray-800 text-center">Transcribir Audio</h2>

      <form onSubmit={handleSubmit}>
        <label
          htmlFor="audioFile"
          className={`block w-full px-4 py-3 text-center border-2 border-dashed rounded-lg cursor-pointer transition ${
            file ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input
            type="file"
            id="audioFile"
            accept=".mp3,.wav,.m4a,.ogg,.flac,audio/*"
            onChange={handleFileChange}
            className="hidden"
          />
          {file ? (
            <span className="text-green-700 font-medium">{file.name}</span>
          ) : (
            <span className="text-gray-600">
              Haz clic o arrastra un archivo de audio aquí (mp3, wav, m4a, ogg, flac...)
            </span>
          )}
        </label>

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isUploading || !file}
          className={`mt-4 w-full py-3 px-4 rounded-lg font-semibold text-white transition ${
            isUploading || !file
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isUploading ? 'Transcribiendo...' : 'Transcribir'}
        </button>
      </form>

      {transcription && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Resultado:</h3>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 whitespace-pre-wrap text-gray-800">
            {transcription}
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioUploader;
