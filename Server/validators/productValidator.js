const Joi = require("joi");

const createProductSchema = Joi.object({
    name: Joi.string().required(),
    price: Joi.number().positive().required(),
    description: Joi.string(),
    stock: Joi.number().min(0),
    image: Joi.string().allow('', null)
});

const updateProductSchema = Joi.object({
    name: Joi.string(),
    price: Joi.number().positive(),
    description: Joi.string(),
    stock: Joi.number().min(0),
    image: Joi.string().allow('', null)
});

module.exports = {
    createProductSchema,
    updateProductSchema
};