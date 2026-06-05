const prisma = require('../utils/prisma');

const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await prisma.vehicle.findMany();
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createVehicle = async (req, res) => {
  try {
    const { plate, brand, model, year, ownerId } = req.body;
    
    // Verificar si el dueño proporcionado existe
    let finalOwnerId = parseInt(ownerId);
    let ownerExists = false;
    
    if (!isNaN(finalOwnerId)) {
      const user = await prisma.user.findUnique({ where: { id: finalOwnerId } });
      if (user) ownerExists = true;
    }

    // Si el dueño no existe o no se proporcionó, usar el primer usuario (Admin por defecto tras reset)
    if (!ownerExists) {
      const firstUser = await prisma.user.findFirst();
      if (!firstUser) return res.status(400).json({ error: "No hay usuarios registrados. Crea un usuario primero." });
      finalOwnerId = firstUser.id;
    }

    const vehicle = await prisma.vehicle.create({
      data: { plate, brand, model, year: parseInt(year), ownerId: finalOwnerId },
      include: { owner: true }
    });

    // Notificar sobre el registro de una nueva moto
    await prisma.notification.create({
      data: {
        title: '🏍️ Nueva Moto Registrada',
        message: `Se ha ingresado la moto ${plate} (${brand}) de ${vehicle.owner.name}.`,
        type: 'INFO'
      }
    });

    res.status(201).json(vehicle);
  } catch (error) {
    console.error("Error creating vehicle:", error);
    res.status(400).json({ error: "Error al crear vehículo. Verifica los datos e intenta de nuevo." });
  }
};

const getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await prisma.vehicle.findUnique({ where: { id: parseInt(id) } });
    if (!vehicle) return res.status(404).json({ message: 'Vehículo no encontrado' });
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAllVehicles, createVehicle, getVehicleById };
