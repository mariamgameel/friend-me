const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User");

async function createTestAdmin() {
  const email = `test_admin_${Date.now()}_${Math.random().toString(36).slice(2, 7)}@friend.me`;
  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash("AdminPass123", salt);
  const user = await User.create({
    username: "TestAdmin",
    email,
    password,
    role: "admin",
  });
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  return { user, token };
}

async function createTestUser() {
  const email = `test_user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}@friend.me`;
  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash("UserPass123", salt);
  const user = await User.create({
    username: "TestUser",
    email,
    password,
    role: "user",
  });
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  return { user, token };
}

module.exports = {
  createTestAdmin,
  createTestUser,
};
