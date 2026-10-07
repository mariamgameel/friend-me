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
        }),
    role: Joi.string().optional()
});

const loginSchema = Joi.object({
    email: Joi.string().email().lowercase().trim().required(),
    password: Joi.string().required()
});

const updateProfileSchema = Joi.object({
    username: Joi.string().min(3).trim().required()
});

const changePasswordSchema = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string()
        .min(8)
        .pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/)
        .required()
        .messages({
            "string.pattern.base": "New password must contain at least one letter and one number"
        })
});

module.exports = {
    registerSchema,
    loginSchema,
    updateProfileSchema,
    changePasswordSchema
};