const Joi = require("joi");

const createRequestSchema = Joi.object({
    dog: Joi.string().hex().length(24).required()
});

const updateStatusSchema = Joi.object({
    status: Joi.string().valid("Pending", "Approved", "Rejected").required()
});

module.exports = {
    createRequestSchema,
    updateStatusSchema
};