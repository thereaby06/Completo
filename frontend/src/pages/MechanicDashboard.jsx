import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

function MechanicDashboard() {
  const [availableOrders, setAvailableOrders] = useState([]);
  const [myOrders, setMechanicOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updateData, setUpdateData] = useState({ status: '', observations: '', evidence: '' });
  const { user } = useAuth();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const [availableRes, myRes] = await Promise.all([
        api.get('/appointments?status=PENDING'),
        api.get(`/appointments?mechanicId=${user.id}`)
      ]);
      setAvailableOrders(availableRes.data);
      setMechanicOrders(myRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const claimOrder = async (id) => {
    try {
      await api.patch(`/appointments/${id}/claim`, { mechanicId: user.id });
      fetchOrders();
    } catch (error) {
      alert('Error al tomar la orden');
    }
  };

  const handleOpenUpdate = (order) => {
    setSelectedOrder(order);
    setUpdateData({ 
      status: order.status, 
      observations: order.observations || '', 
      evidence: order.evidence || '' 
    });
    setShowUpdateModal(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/appointments/${selectedOrder.id}/status`, updateData);
      setShowUpdateModal(false);
      fetchOrders();
    } catch (error) {
      alert('Error al actualizar la orden');
    }
  };

  const statusLabels = {
    'IN_PROGRESS': 'En Proceso',
    'PAUSED_PARTS': 'Pausa: Repuestos',
    'PAUSED_QUICK': 'Pausa: Mecánica Rápida',
    'COMPLETED': 'Terminada'
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">
            PANEL DE <span className="text-blue-600 uppercase">{user.name}</span>
          </h1>
          <p className="text-slate-500 font-medium">Gestiona tus reparaciones y evidencias</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="text-center px-4 border-r border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Motos Listas</p>
            <p className="text-2xl font-black text-blue-600">{myOrders.filter(o => o.status === 'COMPLETED').length}</p>
          </div>
          <div className="text-center px-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Activas</p>
            <p className="text-2xl font-black text-orange-500">{myOrders.filter(o => o.status !== 'COMPLETED').length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Órdenes Disponibles */}
        <section>
          <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-2 h-6 bg-orange-500 rounded-full"></span>
            Órdenes Disponibles
          </h2>
          <div className="space-y-4">
            {availableOrders.length === 0 ? (
              <div className="bg-white p-10 rounded-3xl border border-dashed border-slate-300 text-center text-slate-400 font-medium">
                No hay órdenes pendientes.
              </div>
            ) : (
              availableOrders.map(order => (
                <div key={order.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-black text-xl text-slate-900">{order.vehicle?.plate}</h3>
                      <p className="text-sm font-bold text-slate-400 uppercase">{order.vehicle?.brand} {order.vehicle?.model}</p>
                    </div>
                    <button 
                      onClick={() => claimOrder(order.id)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all"
                    >
                      Tomar Orden
                    </button>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase">Motivo:</p>
                    <p className="text-sm text-slate-700 font-bold">{order.description}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Mis Trabajos Actuales */}
        <section>
          <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
            Mis Reparaciones en Curso
          </h2>
          <div className="space-y-4">
            {myOrders.filter(o => o.status !== 'COMPLETED').map(order => (
              <div key={order.id} className={`p-6 rounded-3xl shadow-xl transition-all ${
                order.status === 'IN_PROGRESS' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-white'
              }`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-black text-2xl tracking-tighter">{order.vehicle?.plate}</h3>
                    <p className="text-sm font-bold opacity-70 uppercase">{order.vehicle?.brand} {order.vehicle?.model}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="bg-white/20 px-2 py-1 rounded text-[10px] font-black uppercase">
                      {statusLabels[order.status] || order.status}
                    </span>
                    <button 
                      onClick={() => handleOpenUpdate(order)}
                      className="bg-white text-slate-900 px-4 py-2 rounded-xl font-black text-xs hover:bg-slate-100"
                    >
                      ACTUALIZAR ESTADO
                    </button>
                  </div>
                </div>
                <div className="bg-black/20 p-4 rounded-2xl">
                  <p className="text-[10px] font-black opacity-60 uppercase mb-1">Observaciones Técnicas:</p>
                  <p className="text-sm italic">{order.observations || 'Sin observaciones aún...'}</p>
                </div>
              </div>
            ))}
            {myOrders.filter(o => o.status !== 'COMPLETED').length === 0 && (
              <div className="bg-white p-10 rounded-3xl border border-dashed border-slate-300 text-center text-slate-400 font-medium">
                No tienes reparaciones activas.
              </div>
            )}
          </div>
        </section>

        {/* Historial Reciente (Solo del mecánico) */}
        <section className="lg:col-span-2 mt-8">
          <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-2 h-6 bg-green-500 rounded-full"></span>
            Mi Historial Reciente (Terminadas)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myOrders.filter(o => o.status === 'COMPLETED').slice(0, 6).map(order => (
              <div key={order.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-black text-slate-900">{order.vehicle?.plate}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{order.vehicle?.brand} {order.vehicle?.model}</p>
                  </div>
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-black uppercase">
                    Terminada
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl mb-3">
                   <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Informe:</p>
                   <p className="text-xs text-slate-600 line-clamp-2 italic">{order.observations || 'Sin informe'}</p>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400">
                   <span>{new Date(order.updatedAt).toLocaleDateString()}</span>
                   {order.evidence && <span className="text-blue-600 font-bold">Con evidencia ✅</span>}
                </div>
              </div>
            ))}
            {myOrders.filter(o => o.status === 'COMPLETED').length === 0 && (
              <div className="col-span-full bg-white p-6 rounded-3xl border border-dashed border-slate-300 text-center text-slate-400 text-sm">
                Aún no has completado ningún trabajo.
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Modal de Actualización */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl">
            <h2 className="text-2xl font-black text-slate-900 mb-6">Actualizar Progreso</h2>
            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Nuevo Estado</label>
                <select 
                  className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-bold"
                  value={updateData.status}
                  onChange={e => setUpdateData({...updateData, status: e.target.value})}
                >
                  <option value="IN_PROGRESS">En Proceso</option>
                  <option value="PAUSED_PARTS">Pausa: Espera de Repuestos</option>
                  <option value="PAUSED_QUICK">Pausa: Mecánica Rápida</option>
                  <option value="COMPLETED">TRABAJO TERMINADO</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">¿Qué se le hizo a la moto?</label>
                <textarea 
                  required
                  placeholder="Describe el trabajo realizado..."
                  className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm min-h-[100px]"
                  value={updateData.observations}
                  onChange={e => setUpdateData({...updateData, observations: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Evidencia (Fotos/Notas)</label>
                <input 
                  type="text"
                  placeholder="URL de foto o descripción de evidencia"
                  className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm"
                  value={updateData.evidence}
                  onChange={e => setUpdateData({...updateData, evidence: e.target.value})}
                />
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <button type="button" onClick={() => setShowUpdateModal(false)} className="px-6 py-2 font-bold text-slate-400">Cancelar</button>
                <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg">
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MechanicDashboard;
