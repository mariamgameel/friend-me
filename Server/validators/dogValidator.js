const Joi = require("joi");

const createDogSchema = Joi.object({
    name: Joi.string().required(),
    age: Joi.number().min(0).required(),
    breed: Joi.string().required(),
    gender: Joi.string().valid("Male", "Female").required(),
    description: Joi.string().required(),
    healthStatus: Joi.string(),
    isAdopted: Joi.boolean(),
    image: Joi.string().allow('', null)
});

const updateDogSchema = Joi.object({
    name: Joi.string(),
    age: Joi.number().min(0),
    breed: Joi.string(),
    gender: Joi.string().valid("Male", "Female"),
    description: Joi.string(),
    healthStatus: Joi.string(),
    isAdopted: Joi.boolean(),
    image: Joi.string().allow('', null)
});

module.exports = {
    createDogSchema,
    updateDogSchema
};