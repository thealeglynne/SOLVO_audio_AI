'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function PerfilUsuario() {
  const [userInfo, setUserInfo] = useState({
    nombre: '',
    avatarUrl: '',
    correo: '',
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('Error obteniendo usuario:', userError);
        setLoading(false);
        return;
      }

      const { email, user_metadata } = user;

      setUserInfo({
        nombre: user_metadata?.full_name || 'Usuario',
        avatarUrl: user_metadata?.avatar_url || '/default-avatar.png',
        correo: email,
      });

      setLoading(false);
    };

    fetchUserInfo();
  }, []);

  if (loading) {
    return <div className="text-gray-500 text-center py-8">Cargando perfil...</div>;
  }

  return (
    <div className="w-full max-w-xs mx-auto bg-white shadow-md rounded-2xl p-6 text-center border border-gray-100">
      <img
        src={userInfo.avatarUrl}
        alt="Avatar"
        className="w-24 h-24 mx-auto rounded-full object-cover shadow-sm border"
      />
      <h2 className="mt-4 text-xl font-semibold text-gray-800">{userInfo.nombre}</h2>
      <p className="text-sm text-gray-500">{userInfo.correo}</p>
      
      <div className="mt-4 px-4 py-2 rounded-lg bg-gray-50 border border-gray-200">
        <p className="text-gray-600 text-sm">
          ¡Bienvenido a <span className="font-bold text-black">GLY_SALES_AGENTS</span>!
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Tu espacio para automatizar, escalar y cerrar más ventas.
        </p>
      </div>
    </div>
  );
}
