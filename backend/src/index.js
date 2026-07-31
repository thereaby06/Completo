const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

const frontendUrl = process.env.FRONTEND_URL;
const corsOrigin = frontendUrl
  ? frontendUrl
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean)
  : ['*'];

const corsOptions = { origin: corsOrigin.length === 1 ? corsOrigin[0] : corsOrigin, optionsSuccessStatus: 200 };

// Routes
const authRoutes = require('./routes/auth.routes');
const vehicleRoutes = require('./routes/vehicle.routes');
const appointmentRoutes = require('./routes/appointment.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const invoiceRoutes = require('./routes/invoice.routes');
const notificationRoutes = require('./routes/notification.routes');
const chatRoutes = require('./routes/chat.routes');
const userRoutes = require('./routes/user.routes');
const taskRoutes = require('./routes/task.routes');

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));

// Route Middleware
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);

// Admin / System Routes
const userController = require('./controllers/user.controller');
app.post('/api/system/reset', userController.resetSystem);

// Basic Route
app.get('/', (req, res) => {
  res.json({ message: 'Workshop Management System API' });
});

// Error Handling Middleware
const { notFoundHandler, errorHandler } = require('./middleware/error.middleware');
app.use(notFoundHandler);
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
