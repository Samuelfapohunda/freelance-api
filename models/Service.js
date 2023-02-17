const mongoose = require('mongoose');
const slugify = require('slugify');


const ServiceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      unique: true,
      trim: true,
      maxlength: [50, 'Name can not be more than 50 characters']
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },

    slug: String,
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [500, 'Description can not be more than 500 characters']
    },

    services: {
      // Array of strings
      type: [String],
      required: true
    },

 


   },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
   }
 );

// Create service slug from the name
ServiceSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// // Geocode & create location field
// ServiceSchema.pre('save', async function(next) {
//   const loc = await geocoder.geocode(this.address);
//   this.location = {
//     type: 'Point',
//     coordinates: [loc[0].longitude, loc[0].latitude],
//     formattedAddress: loc[0].formattedAddress,
//     street: loc[0].streetName,
//     city: loc[0].city,
//     state: loc[0].stateCode,
//     zipcode: loc[0].zipcode,
//     country: loc[0].countryCode
//   };

//   // Do not save address in DB
//   this.address = undefined;
//   next();
// });

// Cascade delete workers when a service is deleted
ServiceSchema.pre('remove', async function(next) {
  console.log(`Workers being removed from service ${this._id}`);
  await this.model('Worker').deleteMany({ service: this._id });
  next();
});

// Reverse populate with virtuals
ServiceSchema.virtual('workers', {
  ref: 'Worker',
  localField: '_id',
  foreignField: 'service',
  justOne: false
});

module.exports = mongoose.model('Service', ServiceSchema);
