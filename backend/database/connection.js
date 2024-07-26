const mongoose = require("mongoose");
const dotenv = require('dotenv');
dotenv.config()

mongoose.connect(process.env.MONGO_URL).then(() => console.log("Connect to Database")).catch((e) => console.log("Error", e))