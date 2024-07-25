const mongoose = require("mongoose");

const url = `mongodb+srv://gamesbeast:admin1234@cluster0.k09dzbj.mongodb.net/`

mongoose.connect(url).then(() => console.log("Connect to Database")).catch((e) => console.log("Error", e))