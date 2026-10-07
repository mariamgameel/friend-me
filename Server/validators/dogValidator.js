const Joi = require("joi");

const createDogSchema = Joi.object({
    name: Joi.string().trim().required(),
    age: Joi.number().min(0).required(),
    breed: Joi.string().trim().required(),
    gender: Joi.string().valid("Male", "Female").required(),
    size: Joi.string().valid("Small", "Medium", "Large").default("Medium"),
    energyLevel: Joi.string().valid("Low", "Medium", "High").default("Medium"),
    vaccinated: Joi.boolean().default(true),
    neutered: Joi.boolean().default(true),
    goodWithKids: Joi.boolean().default(true),
    goodWithDogs: Joi.boolean().default(true),
    goodWithCats: Joi.boolean().default(false),
    personalityTags: Joi.array().items(Joi.string().trim()).max(6).default([]),
    description: Joi.string().trim().required(),
    healthStatus: Joi.string().allow('', null).default("Healthy"),
    isAdopted: Joi.boolean().default(false),
    shelterLocation: Joi.string().allow('', null).default("Downtown Shelter"),
    image: Joi.string().allow('', null),
    images: Joi.array().items(Joi.string().uri().allow('')).max(5).default([])
});

const updateDogSchema = Joi.object({
    name: Joi.string().trim(),
    age: Joi.number().min(0),
    breed: Joi.string().trim(),
    gender: Joi.string().valid("Male", "Female"),
    size: Joi.string().valid("Small", "Medium", "Large"),
    energyLevel: Joi.string().valid("Low", "Medium", "High"),
    vaccinated: Joi.boolean(),
    neutered: Joi.boolean(),
    goodWithKids: Joi.boolean(),
    goodWithDogs: Joi.boolean(),
    goodWithCats: Joi.boolean(),
    personalityTags: Joi.array().items(Joi.string().trim()).max(6),
    description: Joi.string().trim(),
    healthStatus: Joi.string().allow('', null),
    isAdopted: Joi.boolean(),
    shelterLocation: Joi.string().allow('', null),
    image: Joi.string().allow('', null),
    images: Joi.array().items(Joi.string().uri().allow('')).max(5)
});

module.exports = {
    createDogSchema,
    updateDogSchema
};