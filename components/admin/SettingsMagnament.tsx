"use client";

import React, { useState } from 'react';
import { Phone, Save, Settings } from 'lucide-react';

export default function ConfigurationSettings() {
  const [config, setConfig] = useState({
    whatsappNumber: '+54 9 381 123-4567',
    businessName: 'Waichatt',
    welcomeMessage: 'Hola! ¿En qué puedo ayudarte hoy?'
  });

  const [saved, setSaved] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-neutral-100 py-12 px-6">
      <div className="max-w-3xl mx-auto space-y-10">
        <header className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">Configuración General</h1>
          <p className="text-gray-500 mt-2">Administra los datos básicos de tu sistema</p>
        </header>

        {/* WhatsApp Card */}
        <section className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-green-100 p-2 rounded-full">
              <Phone className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">WhatsApp Business</h2>
              <p className="text-sm text-gray-500">Número para redirecciones automáticas</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Número de WhatsApp</label>
              <input
                type="tel"
                value={config.whatsappNumber}
                onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
                className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800"
                placeholder="+54 9 381 123-4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Mensaje de Bienvenida</label>
              <textarea
                value={config.welcomeMessage}
                onChange={(e) => handleInputChange('welcomeMessage', e.target.value)}
                className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800"
                rows={3}
                placeholder="Mensaje automático de bienvenida..."
              />
            </div>
          </div>
        </section>

        {/* Business Card */}
        <section className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-100 p-2 rounded-full">
              <Settings className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Información del Negocio</h2>
              <p className="text-sm text-gray-500">Datos básicos de la empresa</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre del Negocio</label>
            <input
              type="text"
              value={config.businessName}
              onChange={(e) => handleInputChange('businessName', e.target.value)}
              className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
              placeholder="Ej: Waichatt"
            />
          </div>
        </section>
      </div>

      {/* Botón Guardar flotante */}
      <div className="fixed bottom-8 right-8">
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold shadow-lg transition-colors ${
            saved ? 'bg-green-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <Save className="w-4 h-4" />
          {saved ? 'Guardado' : 'Guardar Configuración'}
        </button>
      </div>
    </div>
  );
}
