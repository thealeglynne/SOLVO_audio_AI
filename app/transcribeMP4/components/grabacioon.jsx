'use client';

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Mic, StopCircle, UploadCloud } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export default function GrabadorAudio() {
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [error, setError] = useState('');
  const audioChunksRef = useRef([]);
  const [stream, setStream] = useState(null);
  const analyserRef = useRef(null);
  const canvasRef = useRef(null);
  const animationIdRef = useRef(null);

  const startRecording = async () => {
    setError('');
    try {
      const localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(localStream);

      const recorder = new MediaRecorder(localStream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const newAudioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(newAudioBlob);
        stopVisualizer();
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      startVisualizer(localStream);
    } catch (err) {
      setError('No se pudo acceder al micrófono.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  const startVisualizer = (stream) => {
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    analyser.fftSize = 64;
    source.connect(analyser);

    analyserRef.current = analyser;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationIdRef.current = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 1.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i];
        const color = '#000';

        ctx.fillStyle = color;
        ctx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);
        x += barWidth + 1;
      }
    };

    draw();
  };

  const stopVisualizer = () => {
    cancelAnimationFrame(animationIdRef.current);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleUpload = async () => {
    if (!audioBlob) {
      setError('No hay audio grabado.');
      return;
    }

    setIsUploading(true);
    setTranscription('');
    setError('');

    const file = new File([audioBlob], `grabacion_${Date.now()}.webm`, { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post(
        'https://solvo-audio-ai-back.onrender.com/transcribir-audio/',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 120000,
        }
      );

      if (res.data?.transcripcion) {
        setTranscription(res.data.transcripcion);
      } else {
        setError('Transcripción fallida.');
      }
    } catch (err) {
      console.error(err);
      setError('Error del servidor o red.');
    } finally {
      setIsUploading(false);
    }
  };

  const calidadData = [
    { tiempo: '< 10s', calidad: 2 },
    { tiempo: '10-30s', calidad: 8 },
    { tiempo: '30-60s', calidad: 9 },
    { tiempo: '60-90s', calidad: 7 },
    { tiempo: '90-120s', calidad: 5 },
    { tiempo: '> 120s', calidad: 3 },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(150px,auto)]">
      {/* Grabar Audio */}
      <div className="md:col-span-1 bg-white/30 backdrop-blur-md p-6 rounded-2xl border border-white shadow-md flex flex-col items-center justify-between space-y-6">
        <h1 className="text-xl font-bold text-[#0f172a] tracking-tight">GLY_transcribe AI</h1>
        <img src="/glynne.png" alt="Logo Solvo AI" className="h-21 w-auto" />
        <div className="flex flex-col items-center space-y-4 w-full">
          <canvas
            ref={canvasRef}
            width={250}
            height={100}
            className={`transition-all duration-300 rounded-xl border border-gray-300 bg-white shadow-inner ${
              isRecording ? 'opacity-100 w-[90%]' : 'opacity-0 h-0'
            }`}
          />
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`rounded-full p-4 transition duration-300 shadow-md ${
              isRecording ? 'bg-white hover:bg-gray-100' : 'bg-blue-900 hover:bg-blue-950'
            }`}
            title={isRecording ? 'Detener Grabación' : 'Iniciar Grabación'}
          >
            {isRecording ? (
              <StopCircle className="w-8 h-8 text-[#0f172a]" />
            ) : (
              <Mic className="w-8 h-8 text-white" />
            )}
          </button>

          {!isRecording && audioBlob && (
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className={`flex items-center gap-2 bg-black hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition ${
                isUploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              {isUploading ? 'Transcribiendo...' : 'Enviar Grabación'}
            </button>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </div>

      {/* Transcripción + Contenido */}
      <div className="md:col-span-2 flex flex-col gap-6">
        {/* Transcripción */}
        <div className="bg-neutral-50 border border-neutral-300 shadow-md p-6 rounded-2xl">
          <h2 className="text-lg font-semibold text-neutral-800 mb-4">Texto Transcrito</h2>
          <div className="flex-1 overflow-y-auto p-3 bg-neutral-100 rounded-xl text-sm text-neutral-800 whitespace-pre-wrap scroll-smooth max-h-[40vh] shadow-inner">
            {transcription ? transcription : 'Aquí aparecerá la transcripción del audio grabado.'}
          </div>
        </div>

        {/* Contenido */}
        <div className="bg-neutral-50 border border-neutral-300 shadow-md p-6 rounded-2xl">
          <h2 className="text-lg font-semibold text-neutral-800 mb-4">Contenido</h2>
          <div className="flex-1 p-3 bg-neutral-100 rounded-xl text-sm text-neutral-800 shadow-inner max-h-[40vh]">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={calidadData}>
                <XAxis dataKey="tiempo" stroke="#111" />
                <YAxis stroke="#111" />
                <Tooltip />
                <Bar dataKey="calidad">
                  {calidadData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.calidad >= 8
                          ? '#000000'
                          : entry.calidad >= 6
                          ? '#4b5563'
                          : '#d1d5db'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-gray-600 mt-4 text-xs leading-snug">
              La calidad de la transcripción depende del tiempo: audios muy cortos pueden carecer de contexto, mientras que los intermedios (30-60s) ofrecen un equilibrio ideal. Audios muy largos pierden efectividad por ruido y redundancia.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
