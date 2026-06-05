import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

function Vehicles() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [appointments, setAppointments] = useState([]); // Nuevo: para que el cliente vea el estado
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newVehicle, setNewVehicle] = useState({ plate: '', brand: '', model: '', year: '', ownerId: '' });

  useEffect(() => {
    fetchVehicles();
    if (user.role !== 'CLIENT') {
      fetchUsers();
    } else {
      fetchAppointments();
    }
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await api.get('/vehicles');
      let data = response.data;
      
      if (user.role === 'CLIENT') {
        data = data.filter(v => v.ownerId === user.id);
      }
      
      setVehicles(data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments');
      setAppointments(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const statusLabels = {
    'PENDING': 'Pendiente',
    'IN_PROGRESS': 'En Proceso',
    'PAUSED_PARTS': 'Espera Repuestos',
    'PAUSED_QUICK': 'Mecánica Rápida',
    'COMPLETED': 'Terminada'
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
      if (response.data.length > 0) {
        setNewVehicle(prev => ({ ...prev, ownerId: response.data[0].id.toString() }));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/vehicles', newVehicle);
      setShowModal(false);
      setNewVehicle({ plate: '', brand: '', model: '', year: '', ownerId: users[0]?.id.toString() || '' });
      fetchVehicles();
    } catch (error) {
      alert('Error al crear vehículo: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">
            {user.role === 'CLIENT' ? 'Mis ' : 'Gestión de '} 
            <span className="text-blue-600">Vehículos</span>
          </h1>
          <p className="text-slate-500 font-medium">
            {user.role === 'CLIENT' ? 'Consulta el estado y detalles de tus motocicletas' : 'Administra las motocicletas y sus propietarios'}
          </p>
        </div>
        
        {user.role !== 'CLIENT' && (
          <button 
            onClick={() => setShowModal(true)}
            className="w-full md:w-auto bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
          >
            <span className="text-xl">+</span> Registrar Vehículo
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-50 px-3 py-1 rounded-xl">
                  <span className="text-blue-600 font-black text-lg tracking-widest">{vehicle.plate}</span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Año</p>
                  <p className="font-bold text-slate-700">{vehicle.year}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Marca y Modelo</p>
                  <p className="font-bold text-slate-900">{vehicle.brand} - {vehicle.model}</p>
                </div>
                
                <div className="pt-3 border-t border-slate-50 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-black">
                    👤
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Propietario</p>
                    <p className="text-xs font-bold text-slate-600">{vehicle.owner?.name || user.name}</p>
                  </div>
                </div>

                {/* Sección de Estado para Clientes */}
                {user.role === 'CLIENT' && (
                  <div className="mt-4 pt-4 border-t-2 border-dashed border-slate-100">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3 italic">Estado del Servicio</p>
                    {appointments.filter(a => a.vehicleId === vehicle.id).length > 0 ? (
                      appointments.filter(a => a.vehicleId === vehicle.id).slice(0, 1).map(appt => (
                        <div key={appt.id} className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-700 truncate mr-2">{appt.description}</span>
                            <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${
                              appt.status === 'COMPLETED' ? 'bg-green-500 text-white' :
                              appt.status === 'IN_PROGRESS' ? 'bg-blue-500 text-white animate-pulse' :
                              'bg-orange-500 text-white'
                            }`}>
                              {statusLabels[appt.status] || appt.status}
                            </span>
                          </div>
                          {appt.observations && (
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Informe del Mecánico:</p>
                              <p className="text-[11px] text-slate-600 leading-tight italic">{appt.observations}</p>
                            </div>
                          )}
                          {appt.evidence && (
                            <a href={appt.evidence} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-600 font-bold hover:underline flex items-center gap-1">
                              📂 Ver Evidencia Técnica ↗
                            </a>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-[10px] text-slate-400 italic">No hay servicios activos en este momento.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {vehicles.length === 0 && (
            <div className="col-span-full bg-white p-20 rounded-3xl border border-dashed border-slate-300 text-center">
              <p className="text-slate-400 font-black uppercase italic tracking-widest">No hay vehículos registrados</p>
              <p className="text-slate-300 text-sm mt-2">Comienza registrando la primera motocicleta del taller</p>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl animate-in zoom-in duration-200">
            <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3 italic uppercase tracking-tighter">
              <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
              Registrar Vehículo
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Placa de la Moto</label>
                  <input 
                    type="text" required
                    placeholder="Ej: ABC12D"
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-inner uppercase"
                    value={newVehicle.plate}
                    onChange={e => setNewVehicle({...newVehicle, plate: e.target.value.toUpperCase()})}
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Marca</label>
                  <input 
                    type="text" required
                    placeholder="Ej: AKT"
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-inner"
                    value={newVehicle.brand}
                    onChange={e => setNewVehicle({...newVehicle, brand: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Modelo</label>
                  <input 
                    type="text" required
                    placeholder="Ej: NKD 125"
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-inner"
                    value={newVehicle.model}
                    onChange={e => setNewVehicle({...newVehicle, model: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Año</label>
                <input 
                  type="number" required
                  placeholder="2024"
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-inner"
                  value={newVehicle.year}
                  onChange={e => setNewVehicle({...newVehicle, year: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Dueño de la Moto</label>
                <select 
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-inner appearance-none cursor-pointer"
                  value={newVehicle.ownerId}
                  onChange={e => setNewVehicle({...newVehicle, ownerId: e.target.value})}
                >
                  {users.length === 0 && <option value="">No hay clientes registrados</option>}
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>

              <div className="mt-8 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-4 text-slate-400 font-black uppercase tracking-widest hover:text-slate-600 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Guardar Vehículo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Vehicles;
