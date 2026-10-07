require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");

async function dbconnection() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");
  } catch (error) {
    console.log(error);
  }
}
dbconnection();

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});