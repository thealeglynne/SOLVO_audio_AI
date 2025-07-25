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
  const [analisis, setAnalisis] = useState('');
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
    if (mediaRecorder) mediaRecorder.stop();
    if (stream) stream.getTracks().forEach((track) => track.stop());
    setIsRecording(false);
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
        ctx.fillStyle = '#000';
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
    setAnalisis('');
    setError('');

    const file = new File([audioBlob], `grabacion_${Date.now()}.webm`, { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('https://solvo-analista-english.onrender.com/transcribir-audio/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
      });

      const { transcripcion, analisis, error } = res.data;

      if (error) {
        setError(error);
      } else {
        setTranscription(transcripcion || '');
        setAnalisis(analisis || '');
      }
    } catch (err) {
      console.error(err);
      setError('Error del servidor o red.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(150px,auto)]">
      {/* Grabador */}
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
              className={`flex items-center justify-center ${
                isUploading ? 'w-10 h-10 rounded-full bg-black' : 'gap-2 bg-black hover:bg-gray-900 px-4 py-2 rounded-lg'
              } text-white text-sm font-medium transition-all duration-300`}
            >
              {isUploading ? (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  Enviar Grabación
                </>
              )}
            </button>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </div>

      {/* Transcripción + Análisis */}
      <div className="md:col-span-2 flex flex-col gap-6">
        <div className="bg-neutral-50 border border-neutral-300 shadow-md p-6 rounded-2xl">
          <h2 className="text-lg font-semibold text-neutral-800 mb-4">Texto Transcrito</h2>
          <div className="flex-1 overflow-y-auto p-3 bg-neutral-100 rounded-xl text-sm text-neutral-800 whitespace-pre-wrap scroll-smooth max-h-[40vh] shadow-inner">
            {transcription ? transcription : 'Aquí aparecerá la transcripción del audio grabado.'}
          </div>
        </div>

        <div className="bg-neutral-50 border border-neutral-300 shadow-md p-6 rounded-2xl">
          <h2 className="text-lg font-semibold text-neutral-800 mb-4">Análisis del Contenido</h2>
          <div className="flex-1 overflow-y-auto p-3 bg-neutral-100 rounded-xl text-sm text-neutral-800 whitespace-pre-wrap scroll-smooth max-h-[40vh] shadow-inner">
            {analisis ? (
              <div
                dangerouslySetInnerHTML={{
                  __html: analisis
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\n/g, '<br />'),
                }}
              />
            ) : (
              'Aquí aparecerá el análisis del contenido una vez se procese.'
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
