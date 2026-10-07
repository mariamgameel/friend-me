const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
    housingType: {
        type: String,
        enum: ["House", "Apartment", "Other"],
        required: true
    },
    hasYard: {
        type: Boolean,
        required: true
    },
    ownsOrRents: {
        type: String,
        enum: ["Own", "Rent"],
        required: true
    },
    otherPets: {
        type: String,
        default: ""
    },
    experience: {
        type: String,
        enum: ["None", "Some", "Experienced"],
        required: true
    },
    hoursAlonePerDay: {
        type: Number,
        min: 0,
        max: 24,
        required: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        maxlength: 500,
        default: ""
    }
}, { _id: false });

const adoptionRequestSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    dog: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Dog", 
        required: true 
    },
    application: {
        type: applicationSchema,
        required: false
    },
    adminNote: {
        type: String,
        default: ""
    },
    statusHistory: [
        {
            status: {
                type: String,
                enum: ["Pending", "Approved", "Rejected", "Cancelled"]
            },
            at: {
                type: Date,
                default: Date.now
            },
            by: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        }
    ],
    status: { 
        type: String, 
        enum: ["Pending", "Approved", "Rejected", "Cancelled"], 
        default: "Pending" 
    }
}, { timestamps: true });

adoptionRequestSchema.index({ user: 1, dog: 1 });
adoptionRequestSchema.index({ status: 1 });

module.exports = mongoose.model("AdoptionRequest", adoptionRequestSchema);