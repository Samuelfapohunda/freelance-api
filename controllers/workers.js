const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Worker = require('../models/Worker');
const Service = require('../models/Service');
const geocoder = require('../utils/geocoder')

// @desc      Get workers
// @route     GET /api/v1/workers
// @route     GET /api/v1/services/:serviceId/workers
// @access    Public
exports.getWorkers = asyncHandler(async (req, res, next) => {
  if (req.params.serviceId) {
    const workers = await Worker.find({ service: req.params.serviceId });

    return res.status(200).json({
      success: true,
      count: workers.length,
      data: workers
    });
  } else {
    res.status(200).json(res.advancedResults); 
  }
});

// @desc      Get single worker
// @route     GET /api/v1/workers/:id
// @access    Public
exports.getWorker = asyncHandler(async (req, res, next) => {
  const worker = await Worker.findById(req.params.id).populate({
    path: 'service',
    select: 'name description'
  });

  if (!worker) {
    return next(
      new ErrorResponse(`No worker with the id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: worker
  });
});

// @desc      Add worker
// @route     POST /api/v1/services/:serviceId/workers
// @access    Private
exports.addWorker = asyncHandler(async (req, res, next) => {
  req.body.service = req.params.serviceId;
  req.body.user = req.user.id;

  const service = await Service.findById(req.params.serviceId);

  if (!service) {
    return next(
      new ErrorResponse(
        `No service with the id of ${req.params.serviceId}`,
        404
      )
    );
  }

  // Make sure user is service owner
  if (service.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to add a worker to service ${service._id}`,
        401
      )
    );
  }

  const worker = await Worker.create(req.body);

  res.status(200).json({
    success: true,
    data: worker
  });
});

// @desc      Update worker
// @route     PUT /api/v1/workers/:id
// @access    Private
exports.updateWorker = asyncHandler(async (req, res, next) => {
  let worker = await Worker.findById(req.params.id);

  if (!worker) {
    return next(
      new ErrorResponse(`No worker with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is the worker
  if (worker.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update worker ${worker._id}`,
        401
      )
    );
  }

  worker = await Worker.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  worker.save();

  res.status(200).json({
    success: true,
    data: worker
  });
});


// @desc      Get services within a radius
// @route     GET /api/v1/workers/radius/:zipcode/:distance
// @access    Private
exports.getWorkersInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;
  
  // Get lat/lng from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // Calc radius using radians
  // Divide dist by radius of Earth
  // Earth Radius = 3,963 mi / 6,378 km
  const radius = distance / 3963;

  const workers = await Worker.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });

  res.status(200).json({
    success: true,
    count: workers.length,
    data: workers
  });
});
 
 

// @desc      Upload photo for worker
// @route     PUT /api/v1/services/:id/photo
// @access    Private
exports.workerPhotoUpload = asyncHandler(async (req, res, next) => {
  const worker = await Worker.findById(req.params.id);

  if (!worker) {
    return next(
      new ErrorResponse(`Worker not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is authorised worker
  if (worker.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized`,
        401
      )
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  const file = req.files.file;

  // Make sure the image is a photo
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }

  // Check filesize
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }

  // Create custom filename
  file.name = `photo_${worker._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }

    await Worker.findByIdAndUpdate(req.params.id, { photo: file.name });

    res.status(200).json({
      success: true,
      data: file.name
    });
  });
})


// @desc      Delete worker
// @route     DELETE /api/v1/workers/:id
// @access    Private
exports.deleteWorker = asyncHandler(async (req, res, next) => {
  const worker = await Worker.findById(req.params.id);

  if (!worker) {
    return next(
      new ErrorResponse(`No worker with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is a worker
  if (worker.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete worker ${worker._id}`,
        401
      )
    );
  }

  await worker.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});
