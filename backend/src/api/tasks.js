const express = require('express');
const TaskService = require('../services/taskService');

const router = express.Router();
const taskService = new TaskService();

// Execute a specific task
router.post('/execute', async (req, res) => {
  try {
    const { taskType, parameters } = req.body;
    
    if (!taskType) {
      return res.status(400).json({ error: 'Task type is required' });
    }
    
    const result = await taskService.executeTask(taskType, parameters || {});
    
    res.json({
      taskType,
      result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Task execution error:', error);
    res.status(500).json({ 
      error: 'Task execution failed',
      message: error.message 
    });
  }
});

// Get account information
router.get('/account', async (req, res) => {
  try {
    const result = await taskService.getAccountInfo(req.query);
    res.json(result);
  } catch (error) {
    console.error('Account info error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve account information',
      message: error.message 
    });
  }
});

// Schedule appointment
router.post('/appointment', async (req, res) => {
  try {
    const result = await taskService.scheduleAppointment(req.body);
    res.json(result);
  } catch (error) {
    console.error('Appointment scheduling error:', error);
    res.status(500).json({ 
      error: 'Failed to schedule appointment',
      message: error.message 
    });
  }
});

// Track order
router.get('/order/:orderNumber?', async (req, res) => {
  try {
    const parameters = {
      orderNumber: req.params.orderNumber,
      ...req.query
    };
    const result = await taskService.trackOrder(parameters);
    res.json(result);
  } catch (error) {
    console.error('Order tracking error:', error);
    res.status(500).json({ 
      error: 'Failed to track order',
      message: error.message 
    });
  }
});

// Process bill payment
router.post('/payment', async (req, res) => {
  try {
    const result = await taskService.processBillPayment(req.body);
    res.json(result);
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({ 
      error: 'Failed to process payment',
      message: error.message 
    });
  }
});

// Create support ticket
router.post('/support', async (req, res) => {
  try {
    const result = await taskService.createSupportTicket(req.body);
    res.json(result);
  } catch (error) {
    console.error('Support ticket error:', error);
    res.status(500).json({ 
      error: 'Failed to create support ticket',
      message: error.message 
    });
  }
});

// Get product information
router.get('/product/:product?', async (req, res) => {
  try {
    const parameters = {
      product: req.params.product,
      ...req.query
    };
    const result = await taskService.getProductInfo(parameters);
    res.json(result);
  } catch (error) {
    console.error('Product info error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve product information',
      message: error.message 
    });
  }
});

// List available tasks
router.get('/list', (req, res) => {
  res.json({
    availableTasks: [
      {
        id: 'account_info',
        name: 'Account Information',
        description: 'Retrieve account balance and transaction history',
        endpoint: '/api/tasks/account'
      },
      {
        id: 'schedule_appointment',
        name: 'Schedule Appointment',
        description: 'Schedule, reschedule, or cancel appointments',
        endpoint: '/api/tasks/appointment'
      },
      {
        id: 'order_tracking',
        name: 'Order Tracking',
        description: 'Track order status and shipping information',
        endpoint: '/api/tasks/order'
      },
      {
        id: 'bill_payment',
        name: 'Bill Payment',
        description: 'Process payments and set up auto-pay',
        endpoint: '/api/tasks/payment'
      },
      {
        id: 'technical_support',
        name: 'Technical Support',
        description: 'Create support tickets and check status',
        endpoint: '/api/tasks/support'
      },
      {
        id: 'product_info',
        name: 'Product Information',
        description: 'Get product details and recommendations',
        endpoint: '/api/tasks/product'
      }
    ]
  });
});

module.exports = router;