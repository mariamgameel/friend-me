const mongoose = require("mongoose");

const adoptionRequestSchema = new mongoose.Schema ({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true },

    dog: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Dog", 
        required: true },

    status: { 
        type: String, 
        enum: ["Pending","Approved","Rejected"], 
        default: "Pending" }
        
}, { timestamps: true });

module.exports = mongoose.model("AdoptionRequest", adoptionRequestSchema);