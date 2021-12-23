var mongoose = require('mongoose');

const walletSchema = mongoose.Schema({
    
    user: String,

    fund: {  type: Number,
      set: v => {
        return new Number(v.toFixed(2));
      }},

    lastTransactions: Array,

    deleted: Boolean,

    createdAt: String,

    updatedAt: String
    
  });
  
module.exports = mongoose.model('Wallet', walletSchema); 