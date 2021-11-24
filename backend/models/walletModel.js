var mongoose = require('mongoose');

const walletSchema = mongoose.Schema({
    
    user: String,

    fund: Number,

    deleted: Boolean,

    createdAt: String,

    updatedAt: String
    
  });
  
module.exports = mongoose.model('Wallet', walletSchema); 