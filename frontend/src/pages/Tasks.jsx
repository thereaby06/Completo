import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'MEDIUM', workerId: '' });
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, usersRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/users')
      ]);
      setTasks(tasksRes.data);
      // Solo mecánicos y recepcionistas para asignar tareas
      setWorkers(usersRes.data.filter(u => u.role === 'MECHANIC' || u.role === 'RECEPCIONIST'));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', { ...newTask, creatorId: user.id });
      setShowModal(false);
      setNewTask({ title: '', description: '', priority: 'MEDIUM', workerId: '' });
      fetchData();
    } catch (error) {
      alert('Error al crear tarea');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/tasks/${id}/status`, { status });
      fetchData();
    } catch (error) {
      alert('Error al actualizar tarea');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Asignación de Tareas</h1>
        {user.role === 'ADMIN' && (
          <button 
            onClick={() => setShowModal(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            + Nueva Tarea
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['PENDING', 'IN_PROGRESS', 'COMPLETED'].map(status => (
          <div key={status} className="bg-gray-100 p-4 rounded-xl min-h-[400px]">
            <h2 className="font-bold text-gray-600 mb-4 uppercase text-xs tracking-widest">{status}</h2>
            <div className="space-y-3">
              {tasks.filter(t => t.status === status).map(task => (
                <div key={task.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-sm">{task.title}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      task.priority === 'HIGH' ? 'bg-red-100 text-red-700' : 
                      task.priority === 'MEDIUM' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{task.description}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold mr-2">
                        {task.worker?.name[0]}
                      </div>
                      <span className="text-[10px] text-gray-600 font-medium">{task.worker?.name}</span>
                    </div>
                    <div className="flex space-x-1">
                      {status !== 'IN_PROGRESS' && status !== 'COMPLETED' && (
                        <button onClick={() => updateStatus(task.id, 'IN_PROGRESS')} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded">Iniciar</button>
                      )}
                      {status !== 'COMPLETED' && (
                        <button onClick={() => updateStatus(task.id, 'COMPLETED')} className="text-[10px] bg-green-50 text-green-600 px-2 py-1 rounded">Listo</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Asignar Nueva Tarea</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input 
                type="text" placeholder="Título de la tarea" required
                className="w-full border rounded p-2"
                value={newTask.title}
                onChange={e => setNewTask({...newTask, title: e.target.value})}
              />
              <textarea 
                placeholder="Descripción detallada"
                className="w-full border rounded p-2"
                value={newTask.description}
                onChange={e => setNewTask({...newTask, description: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <select 
                  className="w-full border rounded p-2"
                  value={newTask.priority}
                  onChange={e => setNewTask({...newTask, priority: e.target.value})}
                >
                  <option value="LOW">Baja</option>
                  <option value="MEDIUM">Media</option>
                  <option value="HIGH">Alta</option>
                </select>
                <select 
                  className="w-full border rounded p-2" required
                  value={newTask.workerId}
                  onChange={e => setNewTask({...newTask, workerId: e.target.value})}
                >
                  <option value="">Asignar a...</option>
                  {workers.map(w => (
                    <option key={w.id} value={w.id}>{w.name} ({w.role})</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-500">Cancelar</button>
                <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded">Asignar Tarea</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tasks;
