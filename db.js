var express = require('express'),  
mongoose = require('mongoose') 

const connectDB = async () => {
    try {
        //database Name
        const databaseName='wallet';
        const con = await mongoose.connect(`mongodb://localhost:27017/${databaseName}`, { 
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
        console.log(`Database connected : ${con.connection.host}`)
    } catch (error) {
        console.error(`Error: ${error.message}`)
        process.exit(1)
    }
}

module.exports = connectDB;