require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/User");

async function seedAdmin() {
  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/friend_me";
  const email = (process.env.ADMIN_EMAIL || "admin@friend.me").toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD || "Admin123456!";
  const username = "admin";

  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for admin seed...");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let admin = await User.findOne({ email });
    if (admin) {
      admin.role = "admin";
      admin.password = hashedPassword;
      admin.username = username;
      await admin.save();
      console.log(`Updated existing user (${email}) to admin.`);
    } else {
      admin = await User.create({
        username,
        email,
        password: hashedPassword,
        role: "admin"
      });
      console.log(`Created new admin user (${email}).`);
    }

    console.log("Admin seeding completed successfully.");
  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

seedAdmin();
