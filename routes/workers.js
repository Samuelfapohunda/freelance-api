const express = require('express');
const {
  getWorkers,
  getWorker,
  addWorker,
  updateWorker,
  deleteWorker,
  getWorkersInRadius,
  workerPhotoUpload
} = require('../controllers/workers');

const Worker = require('../models/Worker');

const router = express.Router({ mergeParams: true });


const reviewRouter = require('./reviews');
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(
    advancedResults(Worker, {
      path: 'service',
      select: 'name description'
    }),
    getWorkers
  )
  .post(protect, authorize('worker', 'admin'), addWorker);

  router.route('/radius/:zipcode/:distance').get(getWorkersInRadius);
  router.use('/:workerId/reviews', reviewRouter);


  router
  .route('/:id/photo')
  .put(protect, authorize('worker', 'admin'), workerPhotoUpload);

router
  .route('/:id')
  .get(getWorker)
  .put(protect, authorize('worker', 'admin'), updateWorker)
  .delete(protect, authorize('worker', 'admin'), deleteWorker);

module.exports = router;
