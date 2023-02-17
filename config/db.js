const mongoose = require('mongoose');

const connectDB = async () => {
  mongoose.set('strictQuery', true)
  const conn = await mongoose.connect('mongodb+srv://Ghoul:fapdollars@samuel.yjbe9h7.mongodb.net/bootcamp?retryWrites=true&w=majority', {
    useNewUrlParser: true,

    useUnifiedTopology: true
  });

  console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold);
};


module.exports = connectDB;
