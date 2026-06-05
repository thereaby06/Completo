import React, { useState, useEffect } from 'react';
import api from '../utils/api';

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Centro de Notificaciones</h1>
      
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div className="space-y-4">
          {notifications.map(n => (
            <div 
              key={n.id} 
              className={`p-4 rounded-xl border-l-4 shadow-sm transition-all ${
                n.read ? 'bg-white border-gray-200 opacity-60' : 'bg-blue-50 border-blue-500 shadow-blue-100'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-800">{n.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                  <span className="text-[10px] text-gray-400 mt-2 block uppercase font-bold tracking-widest">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
                {!n.read && (
                  <button 
                    onClick={() => markRead(n.id)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 uppercase tracking-tighter"
                  >
                    Marcar como leída
                  </button>
                )}
              </div>
            </div>
          ))}
          {notifications.length === 0 && (
            <div className="bg-white p-10 rounded-xl text-center border border-dashed border-gray-300">
              <p className="text-gray-400">No tienes notificaciones nuevas</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Notifications;
