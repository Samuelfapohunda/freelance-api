const mongoose = require('mongoose');
const geocoder = require('../utils/geocoder')

const WorkerSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, 'Please add a name']
  },
  about: {
    type: String,
    required: [true, 'Please add a description']
  },

  service: {
    type: mongoose.Schema.ObjectId,
    ref: 'Service',
    required: true
  },
  averageRating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [10, 'Rating must can not be more than 10']
  },
  
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  phone: {
    type: String,
    maxlength: [20, 'Phone number can not be longer than 20 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },

  officeAddress: {
    type: String,
    required: [true, 'Please add an address']
  },

  photo: {
    type: String,
    default: 'no-photo.jpg'
  },
  
  location: {
    // GeoJSON Point
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    },
    formattedAddress: String,
    street: String,
    city: String,
    state: String,
    zipcode: String,
    country: String
  },
 

 
});

// Geocode & create location field
WorkerSchema.pre('save', async function(next) {
  const loc = await geocoder.geocode(this.officeAddress);
  this.location = {
    type: 'Point',
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
    street: loc[0].streetName,
    city: loc[0].city,
    state: loc[0].stateCode,
    zipcode: loc[0].zipcode,
    country: loc[0].countryCode
  };

  // Do not save address in DB
  this.officeAddress = undefined;
  next();
});



module.exports = mongoose.model('Worker', WorkerSchema);
