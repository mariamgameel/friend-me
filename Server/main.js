require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors"); 

async function dbconnection(){
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB")
    } catch(error){
        console.log(error);
    }
}
dbconnection();
const main = express();
main.use(cors()); 
main.use(express.json());
main.use("/api/dogs", require("./routes/dogRoutes"));
main.use("/api/users", require("./routes/userRoutes"));
main.use("/api/adoptions", require("./routes/adoptionRoutes"));
main.use("/api/products", require("./routes/productRoutes"));

const port = process.env.PORT || 3000;
main.listen(port,() => {
    console.log(`Server is running on port ${port}`);
});