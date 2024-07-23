const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const password = process.env.MONGODBPASSWORD;


const url = `mongodb+srv://gamesbeast:${password}@cluster0.k09dzbj.mongodb.net/`

mongoose.connect(url).then(() => console.log("Connect to Database")).catch((e) => console.log("Error", e))