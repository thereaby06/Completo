const prisma = require('../utils/prisma');

const getAllNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await prisma.notification.update({
      where: { id: parseInt(id) },
      data: { read: true }
    });
    res.json(notification);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const createNotification = async (req, res) => {
  try {
    const { title, message, type } = req.body;
    const notification = await prisma.notification.create({
      data: { title, message, type }
    });
    res.status(201).json(notification);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const clearAllNotifications = async (req, res) => {
  try {
    await prisma.notification.deleteMany();
    res.json({ message: 'Todas las notificaciones han sido eliminadas' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAllNotifications, markAsRead, createNotification, clearAllNotifications };
