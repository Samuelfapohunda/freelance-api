const express = require('express');
const {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
} = require('../controllers/services');

const Service = require('../models/Service');

// Include other resource routers
const workerRouter = require('./workers');


const router = express.Router();

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

// Re-route into other resource routers
router.use('/:serviceId/workers', workerRouter);






router
  .route('/')
  .get(advancedResults(Service, 'workers'), getServices)
  .post(protect, authorize('worker', 'admin'), createService);

router
  .route('/:id')
  .get(getService)
  .put(protect, authorize('worker', 'admin'), updateService)
  .delete(protect, authorize('worker', 'admin'), deleteService);

module.exports = router;
