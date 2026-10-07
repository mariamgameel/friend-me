const Joi = require("joi");

const contactMessageSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    email: Joi.string().email().lowercase().trim().required(),
    subject: Joi.string().trim().min(3).max(150).required(),
    body: Joi.string().trim().min(10).max(2000).required()
});

module.exports = { contactMessageSchema };
