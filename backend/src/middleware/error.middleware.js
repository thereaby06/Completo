const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'PrismaClientKnownRequestError') {
    if (err.code === 'P2002') {
      return res.status(400).json({ 
        message: 'El registro ya existe',
        field: err.meta?.target
      });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ 
        message: 'Registro no encontrado'
      });
    }
  }

  res.status(err.status || 500).json({
    message: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

const notFoundHandler = (req, res, next) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
};

module.exports = { errorHandler, notFoundHandler };
