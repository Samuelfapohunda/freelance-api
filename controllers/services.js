const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

const Service = require('../models/Service');

// @desc      Get all services
// @route     GET /api/v1/services
// @access    Public
exports.getServices = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get single service
// @route     GET /api/v1/services/:id
// @access    Public
exports.getService = asyncHandler(async (req, res, next) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    return next(
      new ErrorResponse(`Service not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: service });
});

// @desc      Create new service
// @route     POST /api/v1/services
// @access    Private
exports.createService = asyncHandler(async (req, res, next) => {
  // Add user to req,body
  req.body.user = req.user.id;

  // Check for published service
  const publishedService = await Service.findOne({ user: req.user.id });

  // If the user is not an admin, they can only add one service
  if (publishedService && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `The user with ID ${req.user.id} has already added a service`,
        400
      )
    );
  }

  const service = await Service.create(req.body);

  res.status(201).json({
    success: true,
    data: service
  });
});

// @desc      Update service
// @route     PUT /api/v1/services/:id
// @access    Private
exports.updateService = asyncHandler(async (req, res, next) => {
  let service = await Service.findById(req.params.id);

  if (!service) {
    return next( 
      new ErrorResponse(`Service not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is service owner
  if (service.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this service`,
        401
      ) 
    );
  } 

  service = await Service.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({ success: true, data: service });
});

// @desc      Delete service
// @route     DELETE /api/v1/services/:id
// @access    Private
exports.deleteService = asyncHandler(async (req, res, next) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    return next(
      new ErrorResponse(`Service not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is service owner
  if (service.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this service`,
        401
      )
    );
  }

  await service.remove();

  res.status(200).json({ success: true, data: {} });
});

// @desc      Get services within a radius
// @route     GET /api/v1/services/radius/:zipcode/:distance
// @access    Private
// exports.getservicesInRadius = asyncHandler(async (req, res, next) => {
//   const { zipcode, distance } = req.params;

//   // Get lat/lng from geocoder
//   const loc = await geocoder.geocode(zipcode);
//   const lat = loc[0].latitude;
//   const lng = loc[0].longitude;

//   // Calc radius using radians
//   // Divide dist by radius of Earth
//   // Earth Radius = 3,963 mi / 6,378 km
//   const radius = distance / 3963;

//   const services = await Service.find({
//     location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
//   });

//   res.status(200).json({
//     success: true,
//     count: services.length,
//     data: services
//   });
// });

// // @desc      Upload photo for service
// // @route     PUT /api/v1/services/:id/photo
// // @access    Private
// exports.servicePhotoUpload = asyncHandler(async (req, res, next) => {
//   const service = await Service.findById(req.params.id);

//   if (!service) {
//     return next(
//       new ErrorResponse(`Service not found with id of ${req.params.id}`, 404)
//     );
//   }

//   // Make sure user is service owner
//   if (service.user.toString() !== req.user.id && req.user.role !== 'admin') {
//     return next(
//       new ErrorResponse(
//         `User ${req.user.id} is not authorized to update this service`,
//         401
//       )
//     );
//   }

//   if (!req.files) {
//     return next(new ErrorResponse(`Please upload a file`, 400));
//   }

//   const file = req.files.file;

//   // Make sure the image is a photo
//   if (!file.mimetype.startsWith('image')) {
//     return next(new ErrorResponse(`Please upload an image file`, 400));
//   }

//   // Check filesize
//   if (file.size > process.env.MAX_FILE_UPLOAD) {
//     return next(
//       new ErrorResponse(
//         `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
//         400
//       )
//     );
//   }

//   // Create custom filename
//   file.name = `photo_${service._id}${path.parse(file.name).ext}`;

//   file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
//     if (err) {
//       console.error(err);
//       return next(new ErrorResponse(`Problem with file upload`, 500));
//     }

//     await Service.findByIdAndUpdate(req.params.id, { photo: file.name });

//     res.status(200).json({
//       success: true,
//       data: file.name
//     });
//   });
// });





// const service = require('../models/service');
// const errorResponse = require ('../utils/errorResponse')

// // @desc       Get all services
// // @route      GET /api/v1/services
// //@access       Public
// exports.getservices = async (req, res ,next) => {
//    try {
//      const services = await service.find();

//      res.status(200).json({success: true, count: services.length, data: services})
//    } catch (err) {
//     next(new errorResponse(`service not found with id of ${req.params.id}`, 404));
//    }
// }





// // @desc       Get single services
// // @route      GET /api/v1/services/:id
// //@access       Public
// exports.getSingleservice = async (req, res ,next) => {
//     try {
//         const service = await service.findById(req.params.id)

// if(!service) {
//    return next(new errorResponse(`service not found with id of ${req.params.id}`, 404));
// }

//     res.status(200).json({success: true, data: service})

//     } catch (err) {
//         // res.status(400).json({ success: false })
//         next(err);
//     }
// }





// // @desc       Create new service
// // @route      POST /api/v1/services/
// //@access       Private
// exports.createservice =  async (req, res ,next) => {
//    try {
//       const service = await service.create(req.body)

//     res.status(201).json({
//         success: true,
//         data: service
//     })
//    } catch (err) {
//     next(err);
//    }

  
// }





// // @desc       Update service
// // @route      PUT /api/v1/services/:id
// //@access       Private
// exports.updateservice = async (req, res ,next) => {
 
//  try {
//          const service = await service.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true
//   });

// if(!service) {
//     return next(new errorResponse(`service not found with id of ${req.params.id}`, 404));
// };

// res.status(200).json({
//     success: true,
//     data: service
// })
//     } 
    
//     catch (err) {
//         next(err);
//     }

// }

   



// 9

// // @desc       Delete service
// // @route      DELETE /api/v1/services/:id
// //@access       Private
// exports.deleteservice = async (req, res ,next) => {
 
 
//     try {
//          const service = await service.findByIdAndDelete(req.params.id)
//   res.status(200).json({success: true, data: 'Deleted'})
//   if(!service) {
//     return next(new errorResponse(`service not found with id of ${req.params.id}`, 404));
// };
//     } catch (error) {
//         next(err);
//     }
    
// }