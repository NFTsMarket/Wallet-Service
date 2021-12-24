const mongoose = require('mongoose');

var DB_URL = ('mongodb://localhost:27017/test');

if(process.env.MONGO_HOSTNAME!=undefined){
    DB_URL = ('mongodb://'+process.env.MONGO_HOSTNAME+':27017/test');
}else{
    DB_URL = (process.env.MONGO_URL|| 'mongodb://localhost:27017/test');
}

const dbConnect = function() {
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error: '));
    return mongoose.connect(DB_URL, { useNewUrlParser: true });
}

module.exports = dbConnect;