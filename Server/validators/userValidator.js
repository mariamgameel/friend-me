const Joi = require("joi");

const registerSchema = Joi.object({
    username: Joi.string().min(3).trim().required(),
    email: Joi.string().email().lowercase().trim().required(),
    password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/)
    .required()
    .messages({
        "string.pattern.base": "Password must contain at least one letter and one number"
    })
});

const loginSchema = Joi.object({
    email: Joi.string().email().lowercase().trim().required(),
    password: Joi.string().required(),
});

module.exports = {
    registerSchema,
    loginSchema
};