'use client';

import { useState } from 'react';
import ModalInicio from './components/madalInicio';
import ChatLLM from './components/ChatLLM';
import Header from './components/header';

export default function Diagnostico() {
  const [datosEmpresa, setDatosEmpresa] = useState(null);

  return (
    <div className="relative min-h-screen bg-gray-100">
      <Header />
     {!datosEmpresa && <ModalInicio onComplete={setDatosEmpresa} />} 
      {datosEmpresa && <ChatLLM empresa={datosEmpresa} />}
    </div>
  );
}

