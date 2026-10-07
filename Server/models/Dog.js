const mongoose = require("mongoose");

const dogSchema = new mongoose.Schema(
    {
        name: {
            type: String, 
            required: true,
            trim: true
        },
        age: {
            type: Number, 
            required: true,
            min: 0
        },
        breed: {
            type: String, 
            required: true,
            trim: true
        },
        gender: {
            type: String, 
            enum: ["Male", "Female"], 
            required: true
        },
        size: {
            type: String,
            enum: ["Small", "Medium", "Large"],
            default: "Medium"
        },
        energyLevel: {
            type: String,
            enum: ["Low", "Medium", "High"],
            default: "Medium"
        },
        vaccinated: {
            type: Boolean,
            default: true
        },
        neutered: {
            type: Boolean,
            default: true
        },
        goodWithKids: {
            type: Boolean,
            default: true
        },
        goodWithDogs: {
            type: Boolean,
            default: true
        },
        goodWithCats: {
            type: Boolean,
            default: false
        },
        personalityTags: {
            type: [String],
            validate: [val => val.length <= 6, "{PATH} exceeds the limit of 6 tags"],
            default: []
        },
        description: {
            type: String, 
            required: true,
            trim: true
        },
        healthStatus: {
            type: String, 
            default: "Healthy"
        },
        isAdopted: {
            type: Boolean, 
            default: false
        },
        adoptedAt: {
            type: Date
        },
        shelterLocation: {
            type: String,
            default: "Downtown Shelter"
        },
        image: {
            type: String,
            default: ""
        },
        images: {
            type: [String],
            validate: [val => val.length <= 5, "{PATH} exceeds the limit of 5 images"],
            default: []
        }
    },
    { timestamps: true }
);

// Synchronize legacy `image` with `images[0]`
dogSchema.pre("save", function (next) {
    if (Array.isArray(this.images) && this.images.length > 0) {
        if (!this.image) {
            this.image = this.images[0];
        }
    } else if (this.image) {
        this.images = [this.image];
    }
    next();
});

dogSchema.index({ name: 1 });
dogSchema.index({ breed: 1 });
dogSchema.index({ isAdopted: 1 });

module.exports = mongoose.model("Dog", dogSchema);