const prisma = require('../utils/prisma');

const getAllItems = async (req, res) => {
  try {
    const items = await prisma.inventoryItem.findMany();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createItem = async (req, res) => {
  try {
    const { name, description, quantity, price, category } = req.body;
    const item = await prisma.inventoryItem.create({
      data: { name, description, quantity: parseInt(quantity), price: parseFloat(price), category }
    });
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, price } = req.body;
    const item = await prisma.inventoryItem.update({
      where: { id: parseInt(id) },
      data: { 
        quantity: quantity !== undefined ? parseInt(quantity) : undefined,
        price: price !== undefined ? parseFloat(price) : undefined
      }
    });

    // Notificar si el stock es bajo (ej: menos de 5 unidades)
    if (item.quantity <= 5) {
      await prisma.notification.create({
        data: {
          title: '⚠️ Stock Bajo',
          message: `El repuesto "${item.name}" tiene solo ${item.quantity} unidades.`,
          type: 'ALERT'
        }
      });
    }

    res.json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { getAllItems, createItem, updateItem };
