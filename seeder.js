const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Load models
const Service = require('./models/Service');
const Worker = require('./models/Worker');
const User = require('./models/User');
const Review = require('./models/Review');

// Connect to DB
mongoose.connect('mongodb+srv://Ghoul:fapdollars@samuel.yjbe9h7.mongodb.net/bootcamp?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Read JSON files
const services = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/services.json`, 'utf-8')
);

const workers = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/workers.json`, 'utf-8')
);

const users = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8')
);

const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/reviews.json`, 'utf-8')
);

// Import into DB
const importData = async () => {
  try {
    await Service.create(services);
    await Worker.create(workers);
    await User.create(users);
    await Review.create(reviews);
    console.log('Data Imported...'.green.inverse);
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

// Delete data
const deleteData = async () => {
  try {
    await Service.deleteMany();
    await Worker.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Data Destroyed...'.red.inverse);
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
}
