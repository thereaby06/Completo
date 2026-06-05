import React, { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import api from './utils/api';
import Login from './pages/Login';
import Vehicles from './pages/Vehicles';
import Appointments from './pages/Appointments';
import Inventory from './pages/Inventory';
import Notifications from './pages/Notifications';
import Chat from './pages/Chat';
import Staff from './pages/Staff';
import Tasks from './pages/Tasks';
import Tracking from './pages/Tracking';
import MechanicDashboard from './pages/MechanicDashboard';
import Profile from './pages/Profile';

function AppContent() {
  const { user, loading, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const lastCountRef = useRef(0);
  const audioRef = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3')); // Sonido de notificación

  // Polling para notificaciones
  useEffect(() => {
    if (!user) return;

    const checkNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        const unread = res.data.filter(n => !n.read).length;
        
        // Si hay más notificaciones no leídas que antes, sonar
        if (unread > lastCountRef.current) {
          audioRef.current.currentTime = 0; // Reiniciar audio
          audioRef.current.play().catch(e => {
            console.log('Audio blocked by browser, waiting for interaction');
          });
        }
        
        setUnreadCount(unread);
        lastCountRef.current = unread;
      } catch (error) {
        console.error('Error checking notifications:', error);
      }
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 5000); // Revisar cada 5 segundos para más rapidez
    return () => clearInterval(interval);
  }, [user]);

  // Manejar el primer clic del usuario para habilitar el sonido (restricción del navegador)
  const enableAudioOnFirstClick = () => {
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }).catch(() => {});
    }
    document.removeEventListener('click', enableAudioOnFirstClick);
  };

  useEffect(() => {
    document.addEventListener('click', enableAudioOnFirstClick);
    return () => document.removeEventListener('click', enableAudioOnFirstClick);
  }, []);

  // Detectar si el usuario está en la ruta de seguimiento (pública)
  const isTrackingPath = window.location.pathname.toLowerCase().replace(/\/$/, '') === '/tracking';

  if (isTrackingPath) return <Tracking />;

  if (loading) return <div className="flex items-center justify-center h-screen bg-slate-50">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
  </div>;

  if (!user) {
    return <Login />;
  }

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setIsSidebarOpen(false); // Cerrar sidebar al cambiar de página en móvil
  };

  const renderPage = () => {
    // Protección de rutas por rol
    const isAllowed = (page) => {
      const permissions = {
        'admin': ['dashboard', 'vehicles', 'appointments', 'inventory', 'staff', 'tasks', 'chat', 'notifications', 'mechanic-panel', 'profile'],
        'recepcionist': ['dashboard', 'vehicles', 'appointments', 'chat', 'notifications', 'profile'],
        'mechanic': ['dashboard', 'mechanic-panel', 'chat', 'notifications', 'profile'],
        'client': ['dashboard', 'vehicles', 'notifications', 'profile']
      };
      const role = user.role.toLowerCase();
      return permissions[role]?.includes(page) || permissions['admin'].includes(page);
    };

    if (!isAllowed(currentPage)) {
      setCurrentPage('dashboard');
      return null;
    }

    switch(currentPage) {
      case 'vehicles': return <Vehicles />;
      case 'appointments': return <Appointments />;
      case 'inventory': return <Inventory />;
      case 'notifications': return <Notifications />;
      case 'chat': return <Chat />;
      case 'staff': return <Staff />;
      case 'tasks': return <Tasks />;
      case 'mechanic-panel': return <MechanicDashboard />;
      case 'profile': return <Profile />;
      default: return (
        <div className="p-4 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 md:mb-8">
            {user.role === 'ADMIN' ? 'Panel de Administración' : 
             user.role === 'MECHANIC' ? `Panel de ${user.name}` : `Panel de ${user.name}`}
          </h1>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
            {user.role === 'ADMIN' && (
              <>
                <MetricCard label="Vehículos" value="12" color="blue" />
                <MetricCard label="Citas Hoy" value="5" color="orange" />
                <MetricCard label="Repuestos" value="142" color="purple" />
                <MetricCard label="Ingresos" value="$4,250" color="green" />
              </>
            )}
            {user.role === 'RECEPCIONIST' && (
              <>
                <MetricCard label="Citas Hoy" value="5" color="orange" />
                <MetricCard label="En Taller" value="12" color="blue" />
                <MetricCard label="Mensajes" value="8" color="green" />
              </>
            )}
            {user.role === 'MECHANIC' && (
              <>
                <MetricCard label="Mis Tareas" value="4" color="blue" />
                <MetricCard label="Asignados" value="3" color="orange" />
                <MetricCard label="Listos" value="28" color="green" />
                <MetricCard label="Alertas" value="2" color="red" />
              </>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold mb-4 flex items-center">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                Acciones Rápidas
              </h2>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {(user.role === 'ADMIN' || user.role === 'RECEPCIONIST') && (
                  <>
                    <QuickAction icon="�" label="Cita" onClick={() => handlePageChange('appointments')} />
                    <QuickAction icon="🚗" label="Moto" onClick={() => handlePageChange('vehicles')} />
                  </>
                )}
                {(user.role === 'ADMIN' || user.role === 'MECHANIC') && (
                  <QuickAction icon="🛠️" label="Tareas" onClick={() => handlePageChange('mechanic-panel')} />
                )}
                {user.role === 'ADMIN' && (
                  <QuickAction icon="👤" label="Personal" onClick={() => handlePageChange('staff')} />
                )}
                {user.role !== 'CLIENT' && (
                  <QuickAction icon="💬" label="Chat" onClick={() => handlePageChange('chat')} />
                )}
              </div>
            </div>
            
            <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold mb-4 flex items-center">
                <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                {user.role === 'CLIENT' ? 'Estado de mis Motos' : 'Estado del Taller'}
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                {user.role === 'CLIENT' ? `Hola ${user.name}, aquí puedes consultar el progreso real de tus motocicletas.` : `Bienvenido, ${user.name}. El sistema está operando correctamente en modo móvil y escritorio.`}
              </p>
              <button 
                onClick={() => user.role === 'CLIENT' ? handlePageChange('vehicles') : window.open('/tracking', '_blank')}
                className="mt-4 text-xs font-bold text-blue-600 hover:underline uppercase tracking-widest"
              >
                {user.role === 'CLIENT' ? 'Consultar Mis Motos →' : 'Ver portal de seguimiento →'}
              </button>
            </div>
          </div>
        </div>
      );
    }
  };

  const SidebarContent = () => {
    const role = user.role.toUpperCase();
    return (
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
        <SidebarLink active={currentPage === 'dashboard'} onClick={() => handlePageChange('dashboard')} icon="🏠" label="Dashboard" />
        
        {(role === 'ADMIN' || role === 'RECEPCIONIST') && (
          <>
            <SidebarLink active={currentPage === 'vehicles'} onClick={() => handlePageChange('vehicles')} icon="🚗" label="Vehículos" />
            <SidebarLink active={currentPage === 'appointments'} onClick={() => handlePageChange('appointments')} icon="📅" label="Citas" />
          </>
        )}

        {(role === 'ADMIN') && (
          <SidebarLink active={currentPage === 'inventory'} onClick={() => handlePageChange('inventory')} icon="📦" label="Inventario" />
        )}

        {(role === 'ADMIN' || role === 'MECHANIC') && (
          <SidebarLink active={currentPage === 'mechanic-panel'} onClick={() => handlePageChange('mechanic-panel')} icon="🛠️" label="Panel Mecánico" />
        )}

        <div className="pt-4 pb-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-4">Operaciones</div>
        
        {(role === 'ADMIN' || role === 'MECHANIC') && (
          <SidebarLink active={currentPage === 'tasks'} onClick={() => handlePageChange('tasks')} icon="📋" label="Tareas Equipo" />
        )}
        
        {role !== 'CLIENT' && (
          <SidebarLink active={currentPage === 'chat'} onClick={() => handlePageChange('chat')} icon="💬" label="Chat Interno" />
        )}
        
        {role === 'ADMIN' && (
          <>
            <div className="pt-4 pb-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-4">Administración</div>
            <SidebarLink active={currentPage === 'staff'} onClick={() => handlePageChange('staff')} icon="👥" label="Personal / Clientes" />
          </>
        )}
        
        <SidebarLink active={currentPage === 'notifications'} onClick={() => handlePageChange('notifications')} icon="🔔" label="Notificaciones" />
        <SidebarLink active={currentPage === 'profile'} onClick={() => handlePageChange('profile')} icon="👤" label="Mi Perfil" />
      </nav>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Overlay para móvil */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar Responsivo */}
      <aside className={`
        fixed md:sticky top-0 left-0 z-50
        w-64 h-screen bg-slate-900 text-white flex flex-col shadow-2xl
        transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-8 text-2xl font-black border-b border-slate-800 flex items-center justify-between tracking-tighter">
          <div className="flex items-center">
            <span className="text-blue-500 mr-2 text-3xl">⚙️</span> TALLER<span className="text-blue-500">PRO</span>
          </div>
          <button className="md:hidden text-slate-400" onClick={() => setIsSidebarOpen(false)}>✕</button>
        </div>
        <SidebarContent />
        <div className="p-4 bg-slate-950/50">
          <div className="flex items-center mb-4 p-2 bg-slate-800/50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center font-black mr-3 shadow-lg">
              {user.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold truncate">{user.name}</div>
              <div className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">{user.role}</div>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 border border-red-500/20"
          >
            CERRAR SESIÓN
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto w-full">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between md:justify-end px-4 md:px-8 sticky top-0 z-30">
          {/* Botón menú móvil */}
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            ☰
          </button>

          <div className="flex items-center space-x-4 md:space-x-6">
            <button 
              onClick={() => handlePageChange('notifications')}
              className="relative p-2 text-gray-500 hover:text-blue-600 transition-all duration-300"
            >
              <span className="text-2xl">🔔</span>
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-red-600 text-white text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center shadow-lg animate-bounce z-50">
                  {unreadCount}
                </span>
              )}
            </button>
            <div className="flex items-center space-x-2 md:space-x-4">
              <span className="hidden xs:inline text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sistema:</span>
              <span className="flex items-center text-[10px] font-bold text-green-500">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                EN LÍNEA
              </span>
            </div>
          </div>
        </header>
        <div className="w-full">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

const SidebarLink = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center group ${
      active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
    }`}
  >
    <span className={`mr-3 text-lg transition-transform duration-200 group-hover:scale-120 ${active ? 'scale-110' : ''}`}>{icon}</span>
    <span className="font-bold text-sm tracking-tight">{label}</span>
  </button>
);

const MetricCard = ({ label, value, color }) => {
  const colors = {
    blue: 'text-blue-600',
    orange: 'text-orange-500',
    purple: 'text-purple-600',
    green: 'text-green-600'
  };
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">{label}</h3>
      <p className={`text-3xl font-bold ${colors[color]}`}>{value}</p>
    </div>
  );
};

const QuickAction = ({ icon, label, onClick }) => (
  <button onClick={onClick} className="p-4 bg-gray-50 rounded-lg text-left hover:bg-gray-100 transition group">
    <div className="text-xl mb-1 group-hover:scale-110 transition-transform">{icon}</div>
    <div className="font-bold text-sm text-gray-800">{label}</div>
  </button>
);

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
