require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors"); 
const helmet = require("helmet");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const sanitize = require("./middlewares/sanitize");
const { generalLimiter } = require("./middlewares/rateLimiter");

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

main.use(helmet());
main.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
})); 
main.use(express.json({ limit: "10kb" }));
main.use(sanitize);
main.use(generalLimiter);

main.use("/api/dogs", require("./routes/dogRoutes"));
main.use("/api/users", require("./routes/userRoutes"));
main.use("/api/adoptions", require("./routes/adoptionRoutes"));
main.use("/api/products", require("./routes/productRoutes"));

main.use(notFound);
main.use(errorHandler);

const port = process.env.PORT || 3000;
main.listen(port,() => {
    console.log(`Server is running on port ${port}`);
});