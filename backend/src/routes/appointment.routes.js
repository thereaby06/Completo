const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointment.controller');

router.get('/', appointmentController.getAllAppointments);
router.post('/', appointmentController.createAppointment);
router.patch('/:id/status', appointmentController.updateStatus);
router.patch('/:id/claim', appointmentController.claimOrder);

module.exports = router;
