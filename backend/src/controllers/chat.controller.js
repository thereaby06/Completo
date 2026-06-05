const prisma = require('../utils/prisma');

const getMessages = async (req, res) => {
  try {
    const { chatRoom, senderId, receiverId, isPrivate } = req.query;
    
    let where = {};
    
    if (isPrivate === 'true') {
      // Chat privado entre dos personas (A envía a B o B envía a A)
      where = {
        chatRoom: 'private',
        OR: [
          { senderId: parseInt(senderId), receiverId: parseInt(receiverId) },
          { senderId: parseInt(receiverId), receiverId: parseInt(senderId) }
        ]
      };
    } else {
      // Chat de sala general
      where = { chatRoom: chatRoom || 'general' };
    }

    const messages = await prisma.message.findMany({
      where,
      include: { sender: true },
      orderBy: { createdAt: 'asc' }
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { content, senderId, receiverId, chatRoom } = req.body;
    const message = await prisma.message.create({
      data: { 
        content, 
        senderId: parseInt(senderId), 
        receiverId: receiverId ? parseInt(receiverId) : null,
        chatRoom: chatRoom || 'general' 
      },
      include: { sender: true }
    });

    // Notificar sobre el nuevo mensaje
    await prisma.notification.create({
      data: {
        title: 'Nuevo Mensaje en Chat',
        message: `${message.sender.name}: ${content.substring(0, 50)}...`,
        type: 'CHAT'
      }
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const message = await prisma.message.update({
      where: { id: parseInt(id) },
      data: { content }
    });
    res.json(message);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.message.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Mensaje eliminado' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { getMessages, sendMessage, updateMessage, deleteMessage };
