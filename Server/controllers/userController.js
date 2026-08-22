const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


const registerUser = catchAsync(async (req, res) => {
    const { username, email, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({ username, email, password: hashedPassword, role });
    const userResponse = user.toObject();
    delete userResponse.password;
    res.status(201).json({ success: true, data: userResponse });
});


const getAllUsers = catchAsync(async (req, res) => {
    const users = await User.find().select("-password");
    res.status(200).json({ success: true, data: users });
});


const loginUser = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return next(new AppError("Invalid Credentials", 400)); 
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return next(new AppError("Invalid Credentials", 400));
    const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );
    res.status(200).json({
        success: true,
        token,
        user: { id: user._id, username: user.username, role: user.role }
    });
});


module.exports = { 
    registerUser,
    getAllUsers,
    loginUser 
};