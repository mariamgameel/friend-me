const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const Message = require("../models/Message");

const createMessage = catchAsync(async (req, res, next) => {
    const { name, email, subject, body } = req.body;
    const message = await Message.create({ name, email, subject, body });
    res.status(201).json({
        success: true,
        message: "Your message has been sent successfully! We will get back to you soon.",
        data: message
    });
});

const getAllMessages = catchAsync(async (req, res) => {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: messages });
});

const markMessageRead = catchAsync(async (req, res, next) => {
    const message = await Message.findByIdAndUpdate(
        req.params.id,
        { read: true },
        { new: true }
    );
    if (!message) return next(new AppError("Message not found", 404));
    res.status(200).json({ success: true, data: message });
});

const deleteMessage = catchAsync(async (req, res, next) => {
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) return next(new AppError("Message not found", 404));
    res.status(200).json({ success: true, message: "Message deleted successfully" });
});

module.exports = {
    createMessage,
    getAllMessages,
    markMessageRead,
    deleteMessage
};
