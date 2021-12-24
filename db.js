const mongoose = require('mongoose');
const DB_URL = (process.env.MONGO_URL || 'mongodb://mongo/test');

const dbConnect = function() {
    console.log("Trying to connect to: " + DB_URL);
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error: '));
    return mongoose.connect(DB_URL, { useNewUrlParser: true });
}

module.exports = dbConnect;