import React, { useState } from 'react';
import api from '../utils/api';

function Tracking() {
  const [plate, setPlate] = useState('');
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!plate.trim()) return;
    
    setLoading(true);
    setError('');
    setVehicle(null);

    try {
      // Endpoint que buscaremos por placa
      const res = await api.get(`/vehicles?plate=${plate}`);
      // Asumimos que el backend nos devuelve un array y tomamos el primero
      const found = res.data.find(v => v.plate.toUpperCase() === plate.toUpperCase());
      if (found) {
        // Traer citas de ese vehículo
        const apptsRes = await api.get('/appointments');
        const vehicleAppts = apptsRes.data.filter(a => a.vehicleId === found.id);
        setVehicle({ ...found, appointments: vehicleAppts });
      } else {
        setError('No se encontró ninguna motocicleta con esa placa.');
      }
    } catch (err) {
      setError('Error al consultar el estado. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

    const statusLabels = {
    'PENDING': 'Pendiente',
    'IN_PROGRESS': 'En Proceso',
    'PAUSED_PARTS': 'Pausa: Repuestos',
    'PAUSED_QUICK': 'Pausa: Mecánica Rápida',
    'COMPLETED': 'Terminada',
    'CANCELLED': 'Cancelada'
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">
            SEGUIMIENTO <span className="text-blue-600">TALLERPRO</span>
          </h1>
          <p className="text-slate-500">Consulta el estado de tu motocicleta en tiempo real</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100">
          <form onSubmit={handleSearch} className="flex gap-3 mb-8">
            <input 
              type="text" 
              placeholder="Ingresa la placa (Ej: ABC12D)"
              className="flex-1 bg-slate-100 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-lg uppercase"
              value={plate}
              onChange={e => setPlate(e.target.value)}
            />
            <button 
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition disabled:opacity-50 shadow-lg shadow-blue-600/20"
            >
              {loading ? 'Buscando...' : 'Consultar'}
            </button>
          </form>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-center font-medium border border-red-100 animate-shake">
              ⚠️ {error}
            </div>
          )}

          {vehicle && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-end border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">{vehicle.brand} {vehicle.model}</h2>
                  <p className="text-slate-400 font-mono text-sm">{vehicle.plate}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Año</span>
                  <span className="font-bold text-slate-700">{vehicle.year}</span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Historial de Servicios</h3>
                <div className="space-y-4">
                  {vehicle.appointments?.length > 0 ? (
                    vehicle.appointments.map(appt => (
                      <div key={appt.id} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-bold text-slate-800 text-lg mb-1">{appt.description}</p>
                            <p className="text-xs text-slate-400">{new Date(appt.createdAt).toLocaleDateString()}</p>
                          </div>
                          <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase ${
                            appt.status === 'COMPLETED' ? 'bg-green-500 text-white' :
                            appt.status === 'IN_PROGRESS' ? 'bg-blue-500 text-white animate-pulse' :
                            appt.status.startsWith('PAUSED') ? 'bg-orange-500 text-white' :
                            'bg-slate-200 text-slate-600'
                          }`}>
                            {statusLabels[appt.status] || appt.status}
                          </span>
                        </div>

                        {(appt.observations || appt.evidence) && (
                          <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-3">
                            {appt.observations && (
                              <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Trabajo Realizado:</p>
                                <p className="text-sm text-slate-700 leading-relaxed font-medium">{appt.observations}</p>
                              </div>
                            )}
                            {appt.evidence && (
                              <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Evidencia:</p>
                                {appt.evidence.startsWith('http') ? (
                                  <a href={appt.evidence} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-blue-600 text-xs font-bold hover:underline">
                                    Ver adjunto ↗
                                  </a>
                                ) : (
                                  <p className="text-xs text-slate-500 italic">{appt.evidence}</p>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-slate-400 py-10 italic">No hay servicios registrados aún.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <p className="text-center mt-8 text-slate-400 text-xs">
          ¿Eres trabajador? <a href="/login" className="text-blue-600 font-bold hover:underline">Accede al panel interno</a>
        </p>
      </div>
    </div>
  );
}

export default Tracking;
