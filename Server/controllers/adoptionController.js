const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const AdoptionRequest = require("../models/AdoptionRequest");
const Dog = require("../models/Dog");

const createAdoptionRequest = catchAsync(async (req, res, next) => {
    const dog = await Dog.findById(req.body.dog);
    if (!dog) return next(new AppError("Dog not found", 404));
    if (dog.isAdopted) return next(new AppError("Dog's already adopted", 400));

    const existingRequest = await AdoptionRequest.findOne({
        user: req.user.id,
        dog: req.body.dog
    });
    if (existingRequest) {
        return next(new AppError("You have already requested to adopt this dog", 400));
    }

    const request = await AdoptionRequest.create({
        user: req.user.id,
        dog: req.body.dog
    });
    res.status(201).json({ success: true, data: request });
});

const getAllRequests = catchAsync(async (req, res) => {
    const requests = await AdoptionRequest.find().populate("user").populate("dog");
    res.status(200).json({ success: true, data: requests });
});

const updateRequestStatus = catchAsync(async (req, res, next) => {
    const request = await AdoptionRequest.findById(req.params.id);
    if (!request) return next(new AppError("Request not found", 404));

    request.status = req.body.status;
    await request.save();

    if (req.body.status === "Approved") {
        await Dog.findByIdAndUpdate(request.dog, { isAdopted: true });
    }
    res.status(200).json({ success: true, data: request });
});


module.exports = {
    createAdoptionRequest,
    getAllRequests,
    updateRequestStatus
};