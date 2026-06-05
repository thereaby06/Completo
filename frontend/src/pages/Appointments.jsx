import React, { useState, useEffect } from 'react';
import api from '../utils/api';

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newAppointment, setNewAppointment] = useState({ 
    date: '', 
    description: '', 
    physicalStatus: '', 
    novelties: '', 
    vehicleId: '' 
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [apptsRes, vehsRes] = await Promise.all([
        api.get('/appointments'),
        api.get('/vehicles')
      ]);
      setAppointments(apptsRes.data);
      setVehicles(vehsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/appointments', newAppointment);
      setShowModal(false);
      setNewAppointment({ date: '', description: '', physicalStatus: '', novelties: '', vehicleId: '' });
      fetchData();
    } catch (error) {
      alert('Error al registrar ingreso: ' + error.message);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Recepción de Motocicletas</h1>
          <p className="text-sm text-gray-500">Registra el ingreso y estado de los vehículos</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all font-bold"
        >
          + Registrar Ingreso
        </button>
      </div>

      {loading ? (
        <p>Cargando registros...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appointments.map((appt) => (
            <div key={appt.id} className={`bg-white rounded-2xl shadow-sm border-l-4 overflow-hidden ${
              appt.status === 'COMPLETED' ? 'border-green-500' : 
              appt.status === 'IN_PROGRESS' ? 'border-blue-500' : 'border-orange-500'
            }`}>
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-black text-xl text-slate-800">{appt.vehicle?.plate}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      {appt.vehicle?.brand} {appt.vehicle?.model}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-[10px] font-black ${
                    appt.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 
                    appt.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {appt.status}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Motivo de Ingreso</p>
                    <p className="text-sm text-slate-700 font-medium">{appt.description}</p>
                  </div>

                  <div className="bg-orange-50/50 p-3 rounded-lg border border-orange-100">
                    <p className="text-[10px] font-black text-orange-400 uppercase mb-1">Estado Físico / Novedades</p>
                    <p className="text-xs text-slate-600"><strong>Físico:</strong> {appt.physicalStatus || 'Sin reporte'}</p>
                    <p className="text-xs text-slate-600 mt-1"><strong>Novedades:</strong> {appt.novelties || 'Sin novedades'}</p>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <div className="text-[10px] text-slate-400">
                      <strong>Cliente:</strong> {appt.vehicle?.owner?.name}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {new Date(appt.date).toLocaleDateString()}
                    </div>
                  </div>
                  
                  {appt.mechanic && (
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100">
                      <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">
                        {appt.mechanic.name[0]}
                      </div>
                      <span className="text-[10px] font-bold text-slate-500">Asignado a: {appt.mechanic.name}</span>
                    </div>
                  )}

                  {appt.observations && (
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mt-2">
                      <p className="text-[10px] font-black text-blue-400 uppercase mb-1">Informe Técnico</p>
                      <p className="text-[11px] text-slate-700 leading-tight italic">{appt.observations}</p>
                      {appt.evidence && (
                        <div className="mt-2 pt-2 border-t border-blue-100/50">
                           <p className="text-[9px] font-black text-blue-400 uppercase mb-1">Evidencia</p>
                           {appt.evidence.startsWith('http') ? (
                             <a href={appt.evidence} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-600 font-bold hover:underline">Ver archivo ↗</a>
                           ) : (
                             <p className="text-[10px] text-slate-500 italic">{appt.evidence}</p>
                           )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-xl w-full shadow-2xl animate-fade-in">
            <h2 className="text-2xl font-black text-slate-800 mb-6">Nuevo Ingreso a Taller</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2">Vehículo (Placa)</label>
                  <select 
                    required
                    className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newAppointment.vehicleId}
                    onChange={e => setNewAppointment({...newAppointment, vehicleId: e.target.value})}
                  >
                    <option value="">Seleccionar...</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.plate} - {v.brand} {v.model} ({v.owner?.name})</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2">Fecha y Hora</label>
                  <input 
                    type="datetime-local" required
                    className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newAppointment.date}
                    onChange={e => setNewAppointment({...newAppointment, date: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Motivo de Revisión</label>
                <input 
                  type="text" required
                  placeholder="Ej: Revisión 1000km, Cambio de aceite"
                  className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newAppointment.description}
                  onChange={e => setNewAppointment({...newAppointment, description: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Estado Físico del Vehículo</label>
                <textarea 
                  placeholder="Ej: Rayones en el tanque, espejo izquierdo roto..."
                  className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  rows="2"
                  value={newAppointment.physicalStatus}
                  onChange={e => setNewAppointment({...newAppointment, physicalStatus: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Novedades / Síntomas</label>
                <textarea 
                  placeholder="Ej: Sonido en el motor, falla en el encendido..."
                  className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  rows="2"
                  value={newAppointment.novelties}
                  onChange={e => setNewAppointment({...newAppointment, novelties: e.target.value})}
                />
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 text-sm font-bold text-slate-400 hover:text-slate-600 transition"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all"
                >
                  Guardar Ingreso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Appointments;
