const Joi = require("joi");

const categories = ["Food", "Toys", "Beds", "Walking", "Grooming", "Travel", "Other"];

const createProductSchema = Joi.object({
    name: Joi.string().trim().required(),
    price: Joi.number().positive().required(),
    category: Joi.string().valid(...categories).default("Other"),
    featured: Joi.boolean().default(false),
    description: Joi.string().allow('', null),
    stock: Joi.number().min(0).default(0),
    image: Joi.string().allow('', null)
});

const updateProductSchema = Joi.object({
    name: Joi.string().trim(),
    price: Joi.number().positive(),
    category: Joi.string().valid(...categories),
    featured: Joi.boolean(),
    description: Joi.string().allow('', null),
    stock: Joi.number().min(0),
    image: Joi.string().allow('', null)
});

module.exports = {
    createProductSchema,
    updateProductSchema,
    categories
};