const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');

router.get('/', taskController.getAllTasks);
router.post('/', taskController.createTask);
router.patch('/:id/status', taskController.updateTaskStatus);

module.exports = router;
