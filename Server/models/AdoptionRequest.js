const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
    housingType: {
        type: String,
        default: "House"
    },
    hasYard: {
        type: Boolean,
        default: false
    },
    ownsOrRents: {
        type: String,
        default: "Own"
    },
    ownOrRent: {
        type: String,
        default: "own"
    },
    otherPets: {
        type: String,
        default: ""
    },
    experience: {
        type: String,
        default: "Some"
    },
    hoursAlonePerDay: {
        type: Number,
        default: 4
    },
    schedule: {
        type: String,
        default: ""
    },
    reason: {
        type: String,
        default: ""
    },
    phone: {
        type: String,
        default: ""
    },
    message: {
        type: String,
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