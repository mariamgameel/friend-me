const mongoose = require("mongoose");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const AdoptionRequest = require("../models/AdoptionRequest");
const Dog = require("../models/Dog");
const { sendMailSafely } = require("../utils/mailer");

const createAdoptionRequest = catchAsync(async (req, res, next) => {
    const dog = await Dog.findById(req.body.dog);
    if (!dog) return next(new AppError("Dog not found", 404));
    if (dog.isAdopted) return next(new AppError("This dog has already been adopted", 400));

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
        status: "Pending",
        statusHistory: [
            {
                status: "Pending",
                at: new Date(),
                by: req.user.id
            }
        ]
    };

    if (req.body.application) {
        requestData.application = req.body.application;
    }

    const request = await AdoptionRequest.create(requestData);
    await request.populate("dog");

    res.status(201).json({ success: true, data: request });
});

const getMyRequests = catchAsync(async (req, res, next) => {
    const requests = await AdoptionRequest.find({ user: req.user.id })
        .populate("dog")
        .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: requests });
});

const cancelMyRequest = catchAsync(async (req, res, next) => {
    const request = await AdoptionRequest.findOne({
        _id: req.params.id,
        user: req.user.id
    });

    if (!request) return next(new AppError("Request not found", 404));
    if (request.status !== "Pending") {
        return next(new AppError("Only pending requests can be cancelled", 400));
    }

    request.status = "Cancelled";
    request.statusHistory.push({
        status: "Cancelled",
        at: new Date(),
        by: req.user.id
    });
    await request.save();

    res.status(200).json({ success: true, data: request });
});

const getAllRequests = catchAsync(async (req, res) => {
    const { status, page = 1, limit = 20, all } = req.query;
    const query = {};

    if (status && ["Pending", "Approved", "Rejected", "Cancelled"].includes(status)) {
        query.status = status;
    }

    const total = await AdoptionRequest.countDocuments(query);

    if (all === "true") {
        const requests = await AdoptionRequest.find(query)
            .populate("user", "username email")
            .populate("dog")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: requests,
            meta: { total, page: 1, pages: 1, limit: total }
        });
    }

    const currentPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (currentPage - 1) * parsedLimit;
    const pages = Math.ceil(total / parsedLimit) || 1;

    const requests = await AdoptionRequest.find(query)
        .populate("user", "username email")
        .populate("dog")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit);

    res.status(200).json({
        success: true,
        data: requests,
        meta: {
            total,
            page: currentPage,
            pages,
            limit: parsedLimit
        }
    });
});

const updateRequestStatus = catchAsync(async (req, res, next) => {
    const { status, adminNote } = req.body;
    const request = await AdoptionRequest.findById(req.params.id).populate("user").populate("dog");
    if (!request) return next(new AppError("Request not found", 404));

    const historyEntry = {
        status,
        at: new Date(),
        by: req.user?.id
    };

    if (status === "Approved") {
        let session = null;
        let usedTransaction = false;
        try {
            session = await mongoose.startSession();
            session.startTransaction();
            usedTransaction = true;

            request.status = "Approved";
            if (adminNote !== undefined) request.adminNote = adminNote;
            request.statusHistory.push(historyEntry);
            await request.save({ session });

            await Dog.findByIdAndUpdate(request.dog._id || request.dog, {
                isAdopted: true,
                adoptedAt: new Date()
            }, { session });

            await AdoptionRequest.updateMany(
                { dog: request.dog._id || request.dog, _id: { $ne: request._id }, status: "Pending" },
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
            // Fallback for standalone Mongo
            request.status = "Approved";
            if (adminNote !== undefined) request.adminNote = adminNote;
            request.statusHistory.push(historyEntry);
            await request.save();

            await Dog.findByIdAndUpdate(request.dog._id || request.dog, {
                isAdopted: true,
                adoptedAt: new Date()
            });

            await AdoptionRequest.updateMany(
                { dog: request.dog._id || request.dog, _id: { $ne: request._id }, status: "Pending" },
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
        request.statusHistory.push(historyEntry);
        await request.save();
    }

    // Optional email notification (non-blocking)
    if (request.user?.email) {
        sendMailSafely({
            to: request.user.email,
            subject: `Adoption Request Update: ${request.dog?.name || "Your Dog"}`,
            text: `Hello ${request.user.username || "Friend"},\n\nYour adoption request for ${request.dog?.name || "the dog"} has been updated to: ${status}.\n${adminNote ? `Admin note: ${adminNote}\n` : ""}\nThank you for choosing friend.me!`
        });
    }

    res.status(200).json({ success: true, data: request });
});

module.exports = {
    createAdoptionRequest,
    getMyRequests,
    cancelMyRequest,
    getAllRequests,
    updateRequestStatus
};