import React, { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, products: 0, supermakets: 0 });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8">
      <header className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-emerald-600">Admin Panel - Compra Inteligente</h1>
        <button className="bg-emerald-500 text-white px-4 py-2 rounded shadow">
          Cerrar Sesión
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-xl shadow border border-slate-100">
          <h2 className="text-slate-500 text-sm uppercase font-semibold">Usuarios Registrados</h2>
          <p className="text-4xl font-bold mt-2">1,248</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border border-slate-100">
          <h2 className="text-slate-500 text-sm uppercase font-semibold">Productos Scrapeados</h2>
          <p className="text-4xl font-bold mt-2">15,420</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border border-slate-100">
          <h2 className="text-slate-500 text-sm uppercase font-semibold">Alertas de Fallo Scraping</h2>
          <p className="text-4xl font-bold mt-2 text-red-500">2</p>
        </div>
      </div>

      <section className="bg-white rounded-xl shadow border border-slate-100 p-6">
        <h2 className="text-xl font-bold mb-4">Mapeo de Productos (Últimas anomalías)</h2>
        <table className="w-full text-left">
          <thead>
            <tr className="text-slate-500 border-b">
              <th className="pb-3">Nombre Original (Jumbo)</th>
              <th className="pb-3">Posible Match Canónico</th>
              <th className="pb-3">Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-4">Arroz Premium Garza 5lb Oferta</td>
              <td className="py-4">Arroz La Garza Premium 5 lb</td>
              <td className="py-4">
                <button className="text-emerald-600 font-semibold mr-4">Aprobar</button>
                <button className="text-red-600 font-semibold">Rechazar</button>
              </td>
            </tr>
            <tr>
              <td className="py-4">Aceite Crisol 128 onzas</td>
              <td className="py-4">Aceite de Soya Crisol 1 Galon</td>
              <td className="py-4">
                <button className="text-emerald-600 font-semibold mr-4">Aprobar</button>
                <button className="text-red-600 font-semibold">Rechazar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}
