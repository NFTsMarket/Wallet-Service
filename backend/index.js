var express = require('express'),  
mongoose = require('mongoose') 
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());
walletRoute = require('./routes/walletRoute')(app);

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

app.listen(3000, () => {
    connectDB();
    console.log(`listening at http://localhost:3000`)
})