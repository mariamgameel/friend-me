const mongoose = require("mongoose");

const dogSchema = new mongoose.Schema(
    {
        name: {
            type: String, 
            required: true },
            
        age: {
            type: Number, 
            required: true },

        breed: {
            type: String, 
            required: true },

        gender: {
            type: String, 
            enum: ["Male", "Female"], 
            required: true },

        description: {
            type: String, 
            required: true },

        healthStatus: {
            type: String, 
            default: "Healthy" },

        isAdopted: {
            type: Boolean, 
            default: false },

         image: {
            type: String,
            default: ""
            }

    }, {timestamps: true}
);

module.exports = mongoose.model("Dog", dogSchema);