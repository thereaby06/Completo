const prisma = require('../utils/prisma');

const getAllTasks = async (req, res) => {
  try {
    const { workerId } = req.query;
    const tasks = await prisma.task.findMany({
      where: workerId ? { workerId: parseInt(workerId) } : {},
      include: {
        worker: true,
        creator: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createTask = async (req, res) => {
  try {
    const { title, description, priority, workerId, creatorId } = req.body;
    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority,
        workerId: parseInt(workerId),
        creatorId: parseInt(creatorId)
      },
      include: { worker: true }
    });

    // Notificar al trabajador asignado
    await prisma.notification.create({
      data: {
        title: '📋 Nueva Tarea Asignada',
        message: `Se te ha asignado la tarea: "${title}" con prioridad ${priority}.`,
        type: 'TASK'
      }
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const task = await prisma.task.update({
      where: { id: parseInt(id) },
      data: { status },
      include: { worker: true }
    });

    // Notificar al admin sobre el progreso de la tarea
    await prisma.notification.create({
      data: {
        title: '✅ Tarea Actualizada',
        message: `${task.worker.name} ha marcado la tarea "${task.title}" como ${status}.`,
        type: 'TASK'
      }
    });

    res.json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { getAllTasks, createTask, updateTaskStatus };
