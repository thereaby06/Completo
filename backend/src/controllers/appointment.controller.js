const prisma = require('../utils/prisma');

const getAllAppointments = async (req, res) => {
  try {
    const { status, mechanicId } = req.query;
    const appointments = await prisma.appointment.findMany({
      where: {
        status: status || undefined,
        mechanicId: mechanicId ? parseInt(mechanicId) : undefined
      },
      include: { 
        vehicle: {
          include: { owner: true }
        },
        mechanic: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createAppointment = async (req, res) => {
  try {
    const { date, description, physicalStatus, novelties, vehicleId } = req.body;
    const appointment = await prisma.appointment.create({
      data: { 
        date: new Date(date), 
        description,
        physicalStatus,
        novelties,
        vehicleId: parseInt(vehicleId) 
      }
    });
    res.status(201).json(appointment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const claimOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { mechanicId } = req.body;
    const appointment = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: { 
        mechanicId: parseInt(mechanicId),
        status: 'IN_PROGRESS'
      }
    });
    res.json(appointment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, observations, evidence } = req.body;
    const appointment = await prisma.appointment.update({
      where: { id: parseInt(id) },
      data: { 
        status,
        observations: observations !== undefined ? observations : undefined,
        evidence: evidence !== undefined ? evidence : undefined,
        updatedAt: new Date()
      },
      include: { vehicle: true }
    });

    // Crear notificación para el dueño del vehículo o admin
    await prisma.notification.create({
      data: {
        title: 'Actualización de Servicio',
        message: `La moto ${appointment.vehicle.plate} ha cambiado a estado: ${status}`,
        type: 'INFO'
      }
    });

    res.json(appointment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { getAllAppointments, createAppointment, updateStatus, claimOrder };
