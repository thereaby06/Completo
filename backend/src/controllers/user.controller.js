const prisma = require('../utils/prisma');
const bcrypt = require('bcrypt');

const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const users = await prisma.user.findMany({
      where: role ? { role } : {},
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        vehicles: true,
        assignedTasks: true
      }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Faltan campos requeridos: email, password, name' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, role },
      select: { id: true, email: true, name: true, role: true, createdAt: true }
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const resetSystem = async (req, res) => {
  console.log('Iniciando reset del sistema...');
  try {
    // 1. Borrar datos operativos (en orden de dependencias para evitar errores de FK)
    await prisma.activityLog.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.message.deleteMany({});
    await prisma.invoice.deleteMany({});
    await prisma.task.deleteMany({});
    await prisma.appointment.deleteMany({});
    await prisma.inventoryItem.deleteMany({});
    
    // 2. Borrar vehículos (dependen de usuarios, pero los usuarios se mantienen)
    await prisma.vehicle.deleteMany({});
    
    // 3. NO BORRAR USUARIOS (Se mantienen todas las credenciales: Admin, Mecánicos, Recepcionistas, Clientes)

    res.json({ message: 'Sistema reseteado correctamente. Se han borrado los datos operativos pero se mantienen todos los usuarios y sus contraseñas.' });
  } catch (error) {
    res.status(500).json({ error: 'Error al resetear el sistema: ' + error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, password, name } = req.body;

    const updateData = {
      email: email || undefined,
      name: name || undefined
    };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        ...updateData
      }
    });
    
    // No enviar la contraseña de vuelta
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar perfil: ' + error.message });
  }
};

module.exports = { getAllUsers, createUser, resetSystem, updateProfile };
