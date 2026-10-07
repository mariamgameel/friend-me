const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const User = require("../models/User");
const Dog = require("../models/Dog");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const registerUser = catchAsync(async (req, res) => {
    const { username, email, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({ username, email, password: hashedPassword, role: "user" });
    const userResponse = user.toObject();
    delete userResponse.password;
    res.status(201).json({ success: true, data: userResponse });
});

const getAllUsers = catchAsync(async (req, res) => {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
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
        data: {
            token,
            user: { id: user._id, username: user.username, email: user.email, role: user.role }
        }
    });
});

const getProfile = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id).select("-password").populate("favorites");
    if (!user) return next(new AppError("User not found", 404));
    res.status(200).json({ success: true, data: user });
});

const updateProfile = catchAsync(async (req, res, next) => {
    const { username } = req.body;
    const user = await User.findByIdAndUpdate(
        req.user.id,
        { username },
        { new: true, runValidators: true }
    ).select("-password");
    if (!user) return next(new AppError("User not found", 404));
    res.status(200).json({ success: true, data: user });
});

const changePassword = catchAsync(async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return next(new AppError("User not found", 404));

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return next(new AppError("Current password is incorrect", 400));

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ success: true, message: "Password updated successfully" });
});

const getFavorites = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id).populate("favorites");
    if (!user) return next(new AppError("User not found", 404));
    res.status(200).json({ success: true, data: user.favorites || [] });
});

const addFavorite = catchAsync(async (req, res, next) => {
    const { dogId } = req.params;
    const dog = await Dog.findById(dogId);
    if (!dog) return next(new AppError("Dog not found", 404));

    const user = await User.findById(req.user.id);
    if (!user) return next(new AppError("User not found", 404));

    if (!user.favorites.some(id => id.toString() === dogId)) {
        user.favorites.push(dogId);
        await user.save();
    }

    const updatedUser = await User.findById(req.user.id).populate("favorites");
    res.status(200).json({ success: true, data: updatedUser.favorites });
});

const removeFavorite = catchAsync(async (req, res, next) => {
    const { dogId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) return next(new AppError("User not found", 404));

    user.favorites = user.favorites.filter(id => id.toString() !== dogId);
    await user.save();

    const updatedUser = await User.findById(req.user.id).populate("favorites");
    res.status(200).json({ success: true, data: updatedUser.favorites });
});

module.exports = { 
    registerUser,
    getAllUsers,
    loginUser,
    getProfile,
    updateProfile,
    changePassword,
    getFavorites,
    addFavorite,
    removeFavorite
};