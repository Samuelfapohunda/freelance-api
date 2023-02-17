const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Please add some text']
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    required: [true, 'Please add a rating between 1 and 10']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  worker: { 
    type: mongoose.Schema.ObjectId,
    ref: 'Worker',
    required: true 
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
});

// Prevent user from submitting more than one review per service
ReviewSchema.index({ worker: 1, user: 1 }, { unique: true });

// Static method to get avg rating and save
ReviewSchema.statics.getAverageRating = async function(workerId) {
  const obj = await this.aggregate([
    {
      $match: { worker: workerId }
    },
    {
      $group: {
        _id: '$worker',
        averageRating: { $avg: '$rating' }
      }
    }
  ]);

  try {
    await this.model('Worker').findByIdAndUpdate(workerId, {
      averageRating: obj[0].averageRating
    });
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageCost after save
ReviewSchema.post('save', async function() {
  await this.constructor.getAverageRating(this.worker);
});

// Call getAverageCost before remove
ReviewSchema.post('remove', async function() {
  await this.constructor.getAverageRating(this.worker);
});

module.exports = mongoose.model('Review', ReviewSchema);
