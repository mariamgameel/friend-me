const mongoose = require("mongoose");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const AdoptionRequest = require("../models/AdoptionRequest");
const Dog = require("../models/Dog");

const createAdoptionRequest = catchAsync(async (req, res, next) => {
    const dog = await Dog.findById(req.body.dog);
    if (!dog) return next(new AppError("Dog not found", 404));
    if (dog.isAdopted) return next(new AppError("Dog's already adopted", 400));

    // Allow re-applying only when previous request for that dog is Rejected or Cancelled
    const existingActiveRequest = await AdoptionRequest.findOne({
        user: req.user.id,
        dog: req.body.dog,
        status: { $in: ["Pending", "Approved"] }
    });
    if (existingActiveRequest) {
        return next(new AppError("You already have an active request for this dog", 400));
    }

    const requestData = {
        user: req.user.id,
        dog: req.body.dog,
        ...(req.body.application && { application: req.body.application })
    };
    const request = await AdoptionRequest.create(requestData);
    res.status(201).json({ success: true, data: request });
});

const getAllRequests = catchAsync(async (req, res) => {
    const requests = await AdoptionRequest.find().populate("user").populate("dog").sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: requests });
});

const updateRequestStatus = catchAsync(async (req, res, next) => {
    const { status, adminNote } = req.body;
    const request = await AdoptionRequest.findById(req.params.id);
    if (!request) return next(new AppError("Request not found", 404));

    if (status === "Approved") {
        let session = null;
        let usedTransaction = false;
        try {
            session = await mongoose.startSession();
            session.startTransaction();
            usedTransaction = true;

            request.status = "Approved";
            if (adminNote !== undefined) request.adminNote = adminNote;
            if (request.statusHistory) {
                request.statusHistory.push({ status: "Approved", at: new Date(), by: req.user?.id });
            }
            await request.save({ session });

            await Dog.findByIdAndUpdate(request.dog, {
                isAdopted: true,
                adoptedAt: new Date()
            }, { session });

            await AdoptionRequest.updateMany(
                { dog: request.dog, _id: { $ne: request._id }, status: "Pending" },
                {
                    status: "Rejected",
                    adminNote: "Dog was adopted by another applicant"
                },
                { session }
            );

            await session.commitTransaction();
        } catch (error) {
            if (usedTransaction && session) {
                try { await session.abortTransaction(); } catch (abortErr) {}
            }
            // Fallback for standalone Mongo or failed transaction
            request.status = "Approved";
            if (adminNote !== undefined) request.adminNote = adminNote;
            if (request.statusHistory) {
                request.statusHistory.push({ status: "Approved", at: new Date(), by: req.user?.id });
            }
            await request.save();

            await Dog.findByIdAndUpdate(request.dog, {
                isAdopted: true,
                adoptedAt: new Date()
            });

            await AdoptionRequest.updateMany(
                { dog: request.dog, _id: { $ne: request._id }, status: "Pending" },
                {
                    status: "Rejected",
                    adminNote: "Dog was adopted by another applicant"
                }
            );
        } finally {
            if (session) session.endSession();
        }
    } else {
        request.status = status;
        if (adminNote !== undefined) request.adminNote = adminNote;
        if (request.statusHistory) {
            request.statusHistory.push({ status, at: new Date(), by: req.user?.id });
        }
        await request.save();
    }

    res.status(200).json({ success: true, data: request });
});


module.exports = {
    createAdoptionRequest,
    getAllRequests,
    updateRequestStatus
};