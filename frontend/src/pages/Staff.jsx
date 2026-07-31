import React, { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { AuthContext } from '../context/AuthContext';

function Staff() {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '', name: '', role: 'CLIENT' });
  const [isResetting, setIsResetting] = useState(false);
  const [hasExported, setHasExported] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      setLoading(true);
      // Obtener todos los datos necesarios para el backup
      const [appts, vehs, inv, invcs, usrs] = await Promise.all([
        api.get('/appointments'),
        api.get('/vehicles'),
        api.get('/inventory'),
        api.get('/invoices'),
        api.get('/users')
      ]);

      const wb = XLSX.utils.book_new();

      // Preparar hojas de excel
      const s1 = XLSX.utils.json_to_sheet(appts.data.map(a => ({
        ID: a.id, Fecha: a.date, Placa: a.vehicle?.plate, Descripción: a.description, 
        Estado: a.status, Observaciones: a.observations, Evidencia: a.evidence, Mecánico: a.mechanic?.name
      })));
      XLSX.utils.book_append_sheet(wb, s1, "Citas_Servicios");

      const s2 = XLSX.utils.json_to_sheet(vehs.data.map(v => ({
        Placa: v.plate, Marca: v.brand, Modelo: v.model, Año: v.year, Dueño: v.owner?.name
      })));
      XLSX.utils.book_append_sheet(wb, s2, "Vehículos");

      const s3 = XLSX.utils.json_to_sheet(inv.data);
      XLSX.utils.book_append_sheet(wb, s3, "Inventario");

      const s4 = XLSX.utils.json_to_sheet(invcs.data);
      XLSX.utils.book_append_sheet(wb, s4, "Facturas");

      const s5 = XLSX.utils.json_to_sheet(usrs.data.map(u => ({
        Nombre: u.name, Email: u.email, Rol: u.role
      })));
      XLSX.utils.book_append_sheet(wb, s5, "Usuarios_Personal");

      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
      saveAs(data, `Backup_TallerPro_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      setHasExported(true);
      alert('¡Exportación completada! Ahora el botón de resetear está habilitado.');
    } catch (error) {
      alert('Error al exportar datos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetSystem = async () => {
    if (!hasExported) {
      alert("⚠️ ERROR: Primero debes descargar el respaldo en Excel usando el botón verde.");
      return;
    }

    const confirmBackup = window.confirm("¡ATENCIÓN! Ya descargaste el Excel, ahora procederemos a borrar la información operativa. ¿Estás seguro?");
    if (!confirmBackup) return;

    const confirmFinal = window.confirm("¿Estás COMPLETAMENTE SEGURO? Esta acción no se puede deshacer.");
    if (!confirmFinal) return;

    try {
      setIsResetting(true);
      const res = await api.post('/system/reset');
      alert(res.data.message);
      window.location.reload(); // Recargar para limpiar estados
    } catch (error) {
      alert('Error al resetear sistema: ' + error.message);
    } finally {
      setIsResetting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Si es recepcionista, forzar que el rol sea CLIENTE
      const userToCreate = user?.role === 'ADMIN' 
        ? newUser 
        : { ...newUser, role: 'CLIENT' };
      
      await api.post('/users', userToCreate);
      setShowModal(false);
      setNewUser({ email: '', password: '', name: '', role: 'CLIENT' });
      fetchUsers();
    } catch (error) {
      const message = error?.response?.data?.message || error?.response?.data?.error || error.message;
      alert('Error al crear usuario: ' + message);
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">GESTIÓN DE <span className="text-blue-600">PERSONAL</span></h1>
          <p className="text-slate-500 font-medium">Administra accesos y realiza mantenimientos del sistema</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={handleExportData}
            className="flex-1 md:flex-none bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-600/20 transition-all flex items-center justify-center gap-2"
          >
            📊 Exportar Excel
          </button>
          {user?.role === 'ADMIN' && (
            <button 
              onClick={handleResetSystem}
              disabled={isResetting || !hasExported}
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${
                !hasExported 
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                : 'bg-red-600 text-white hover:bg-red-700 shadow-red-600/20'
              }`}
            >
              {isResetting ? 'Reseteando...' : '⚠️ Resetear Todo'}
            </button>
          )}
          <button 
            onClick={() => setShowModal(true)}
            className="flex-1 md:flex-none bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all"
          >
            + Nuevo Usuario
          </button>
        </div>
      </div>

      {loading ? (
        <p>Cargando usuarios...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehículos/Tareas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map(u => (
                <tr key={u.id}>
                  <td className="px-6 py-4 font-medium">{u.name}</td>
                  <td className="px-6 py-4 text-gray-600">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                      u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                      u.role === 'MECHANIC' ? 'bg-blue-100 text-blue-700' :
                      u.role === 'RECEPCIONIST' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {u.role === 'CLIENT' ? `${u.vehicles?.length || 0} Vehículos` : `${u.assignedTasks?.length || 0} Tareas`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Nuevo Usuario</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input 
                type="text" placeholder="Nombre completo" required
                className="w-full border rounded p-2"
                value={newUser.name}
                onChange={e => setNewUser({...newUser, name: e.target.value})}
              />
              <input 
                type="email" placeholder="Correo electrónico" required
                className="w-full border rounded p-2"
                value={newUser.email}
                onChange={e => setNewUser({...newUser, email: e.target.value})}
              />
              <input 
                type="password" placeholder="Contraseña" required
                className="w-full border rounded p-2"
                value={newUser.password}
                onChange={e => setNewUser({...newUser, password: e.target.value})}
              />
              {user?.role === 'ADMIN' ? (
                <select 
                  className="w-full border rounded p-2"
                  value={newUser.role}
                  onChange={e => setNewUser({...newUser, role: e.target.value})}
                >
                  <option value="MECHANIC">Mecánico</option>
                  <option value="RECEPCIONIST">Recepcionista</option>
                  <option value="CLIENT">Cliente</option>
                  <option value="ADMIN">Administrador/Dueño</option>
                </select>
              ) : (
                <div className="w-full border rounded p-2 bg-gray-50">
                  <span className="font-bold">Rol:</span> Cliente
                </div>
              )}
              <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-500">Cancelar</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Crear Usuario</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Staff;
