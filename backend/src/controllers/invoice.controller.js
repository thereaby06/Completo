const prisma = require('../utils/prisma');

const getAllInvoices = async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      include: { client: true }
    });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createInvoice = async (req, res) => {
  try {
    const { number, total, clientId, status } = req.body;
    const invoice = await prisma.invoice.create({
      data: { 
        number, 
        total: parseFloat(total), 
        clientId: parseInt(clientId),
        status: status || 'UNPAID'
      },
      include: { client: true }
    });

    // Notificar sobre la nueva factura
    await prisma.notification.create({
      data: {
        title: '💰 Nueva Factura',
        message: `Se ha generado la factura ${number} para ${invoice.client.name} por $${total}`,
        type: 'INVOICE'
      }
    });

    res.status(201).json(invoice);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { getAllInvoices, createInvoice };
