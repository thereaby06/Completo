import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [showMenuId, setShowMenuId] = useState(null);
  const [activeTab, setActiveTab] = useState('general'); // general o private
  const [selectedUser, setSelectedUser] = useState(null); // Usuario para chat privado
  const [users, setUsers] = useState([]);
  const [mobileView, setMobileView] = useState('list'); // 'list' o 'chat'
  const { user } = useAuth();
  const scrollRef = useRef();

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
  }, [activeTab, selectedUser]);

  useEffect(() => {
    if (activeTab === 'private') {
      fetchUsers();
    }
  }, [activeTab]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data.filter(u => u.id !== user.id));
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMessages = async () => {
    try {
      let url = `/chat?chatRoom=${activeTab}`;
      if (activeTab === 'private' && selectedUser) {
        url = `/chat?isPrivate=true&senderId=${user.id}&receiverId=${selectedUser.id}`;
      }
      const res = await api.get(url);
      setMessages(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    if (activeTab === 'private' && !selectedUser) {
      return alert('Selecciona un usuario para el chat privado');
    }

    try {
      await api.post('/chat', {
        content: newMessage,
        senderId: user.id,
        receiverId: activeTab === 'private' ? selectedUser.id : null,
        chatRoom: activeTab
      });
      setNewMessage('');
      fetchMessages();
    } catch (error) {
      alert('Error al enviar mensaje');
    }
  };

  const handleStartPrivateChat = (targetUser) => {
    setSelectedUser(targetUser);
    setActiveTab('private');
    setMobileView('chat');
    setShowMenuId(null);
  };

  const handleSelectUser = (u) => {
    setSelectedUser(u);
    setMobileView('chat');
  };

  const handleBackToList = () => {
    setMobileView('list');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editContent.trim()) return;
    try {
      await api.patch(`/chat/${editingId}`, { content: editContent });
      setEditingId(null);
      setEditContent('');
      fetchMessages();
    } catch (error) {
      alert('Error al editar mensaje');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este mensaje?')) return;
    try {
      await api.delete(`/chat/${id}`);
      fetchMessages();
    } catch (error) {
      alert('Error al eliminar mensaje');
    }
  };

  return (
    <div className="p-2 md:p-6 h-[calc(100vh-64px)] flex flex-col overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-3">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 tracking-tighter uppercase italic">
          Centro de <span className="text-blue-600">Comunicaciones</span>
        </h1>
        
        {/* Tabs de Chat */}
        <div className="flex bg-slate-100 p-1 rounded-2xl w-full sm:w-auto">
          <button 
            onClick={() => { setActiveTab('general'); setSelectedUser(null); setMobileView('chat'); }}
            className={`flex-1 sm:px-4 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'general' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
          >
            GENERAL
          </button>
          <button 
            onClick={() => { setActiveTab('private'); setMobileView('list'); }}
            className={`flex-1 sm:px-4 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'private' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
          >
            PRIVADOS
          </button>
        </div>
      </div>
      
      <div className="flex-1 flex gap-4 overflow-hidden relative">
        {/* Barra Lateral de Usuarios (Solo para Privados) */}
        {activeTab === 'private' && (
          <div className={`${mobileView === 'list' ? 'flex' : 'hidden'} md:flex w-full md:w-64 bg-white rounded-3xl border border-slate-100 shadow-sm flex-col overflow-hidden absolute inset-0 md:relative z-10`}>
            <div className="p-4 border-b border-slate-50 bg-slate-50/50">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contactos</p>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {users.map(u => (
                <button 
                  key={u.id}
                  onClick={() => handleSelectUser(u)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${selectedUser?.id === u.id ? 'bg-blue-600 text-white' : 'hover:bg-slate-50 text-slate-700'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${selectedUser?.id === u.id ? 'bg-white/20' : 'bg-blue-100 text-blue-600'}`}>
                    {u.name[0]}
                  </div>
                  <div className="text-left overflow-hidden">
                    <p className="text-xs font-black truncate">{u.name}</p>
                    <p className={`text-[9px] font-bold opacity-70 ${selectedUser?.id === u.id ? 'text-white' : 'text-slate-400'}`}>
                      {u.role}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Ventana de Chat */}
        <div className={`${(activeTab === 'general' || mobileView === 'chat') ? 'flex' : 'hidden'} md:flex flex-1 bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100 flex-col overflow-hidden z-0 w-full`}>
          {activeTab === 'private' && !selectedUser ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300 p-6 text-center">
              <div className="text-6xl mb-4">💬</div>
              <p className="font-black uppercase tracking-widest text-xs italic">Selecciona un contacto para chatear</p>
            </div>
          ) : (
            <>
              {/* Cabecera Móvil de Chat Privado */}
              {activeTab === 'private' && selectedUser && (
                <div className="md:hidden p-3 border-b border-slate-50 flex items-center gap-3 bg-white">
                  <button onClick={handleBackToList} className="p-2 text-blue-600">
                    <span className="text-lg font-bold">←</span>
                  </button>
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-black text-xs">
                    {selectedUser.name[0]}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-black truncate">{selectedUser.name}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase">{selectedUser.role}</p>
                  </div>
                </div>
              )}

              {/* Area de Mensajes */}
              <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-4 bg-slate-50/30 custom-scrollbar">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`relative group max-w-[90%] md:max-w-[70%] p-3 md:p-4 rounded-3xl shadow-sm transition-all hover:shadow-md ${
                      msg.senderId === user.id 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-white text-slate-800 rounded-tl-none border border-gray-100'
                    }`}>
                      
                      {/* Botón tres puntos */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <button 
                          onClick={() => setShowMenuId(showMenuId === msg.id ? null : msg.id)}
                          className={`rounded-full w-6 h-6 flex items-center justify-center shadow-md border transition-all ${
                            msg.senderId === user.id ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'
                          }`}
                        >
                          <span className="font-black text-xs">...</span>
                        </button>
                        
                        {/* Menú de Opciones */}
                        {showMenuId === msg.id && (
                          <div className="absolute right-0 top-7 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 w-32 md:w-36 z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                            {msg.senderId === user.id && (
                              <button 
                                onClick={() => {
                                  setEditingId(msg.id);
                                  setEditContent(msg.content);
                                  setShowMenuId(null);
                                }}
                                className="w-full text-left px-4 py-2 text-[10px] text-slate-600 hover:bg-slate-50 font-black uppercase tracking-widest flex items-center gap-2"
                              >
                                <span>✏️</span> Editar
                              </button>
                            )}
                            {msg.senderId !== user.id && (
                              <button 
                                onClick={() => handleStartPrivateChat(msg.sender)}
                                className="w-full text-left px-4 py-2 text-[10px] text-blue-600 hover:bg-blue-50 font-black uppercase tracking-widest flex items-center gap-2"
                              >
                                <span>🔒</span> Privado
                              </button>
                            )}
                            {(msg.senderId === user.id || user.role === 'ADMIN') && (
                              <button 
                                onClick={() => {
                                  handleDelete(msg.id);
                                  setShowMenuId(null);
                                }}
                                className="w-full text-left px-4 py-2 text-[10px] text-red-600 hover:bg-red-50 font-black uppercase tracking-widest border-t border-slate-50 flex items-center gap-2"
                              >
                                <span>🗑️</span> Eliminar
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      <div className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest mb-1 md:mb-1.5 opacity-60 ${msg.senderId === user.id ? 'text-white' : 'text-blue-600'}`}>
                        {msg.sender?.name}
                      </div>
                      
                      {editingId === msg.id ? (
                        <form onSubmit={handleUpdate} className="mt-1">
                          <input 
                            autoFocus
                            className="w-full bg-black/10 text-white text-sm p-2 rounded-xl border border-white/20 outline-none"
                            value={editContent}
                            onChange={e => setEditContent(e.target.value)}
                            onBlur={() => setEditingId(null)}
                          />
                          <p className="text-[8px] mt-1 opacity-50 italic">Enter para guardar</p>
                        </form>
                      ) : (
                        <div className="text-xs md:text-sm font-medium leading-relaxed break-words">{msg.content}</div>
                      )}

                      <div className="text-[7px] md:text-[8px] mt-2 opacity-40 text-right font-bold tracking-widest">
                        {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={scrollRef} />
              </div>

              {/* Area de Input */}
              <div className="p-3 md:p-6 border-t border-slate-50 bg-white">
                <form onSubmit={handleSend} className="relative flex items-center gap-2 md:gap-3">
                  <input 
                    type="text" 
                    placeholder="Escribe un mensaje..."
                    className="flex-1 bg-slate-50 border-none rounded-2xl px-4 md:px-6 py-3 md:py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-inner"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                  />
                  <button 
                    type="submit"
                    className="bg-blue-600 text-white w-10 h-10 md:w-14 md:h-14 rounded-2xl flex items-center justify-center hover:bg-blue-700 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-600/30"
                  >
                    <span className="text-lg md:text-xl">✈️</span>
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Chat;
