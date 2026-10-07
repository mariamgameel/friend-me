const Joi = require("joi");

const applicationSchema = Joi.object({
    housingType: Joi.string().allow("", null).optional(),
    hasYard: Joi.boolean().optional(),
    ownsOrRents: Joi.string().allow("", null).optional(),
    ownOrRent: Joi.string().allow("", null).optional(),
    otherPets: Joi.string().allow("", null).default(""),
    experience: Joi.string().allow("", null).optional(),
    hoursAlonePerDay: Joi.number().min(0).max(24).optional(),
    schedule: Joi.string().allow("", null).optional(),
    reason: Joi.string().allow("", null).optional(),
    phone: Joi.string().trim().allow("", null).optional(),
    message: Joi.string().max(500).allow("", null).default("")
}).unknown(true);

const createRequestSchema = Joi.object({
    dog: Joi.string().hex().length(24).required(),
    application: applicationSchema.optional()
});

const updateStatusSchema = Joi.object({
    status: Joi.string().valid("Pending", "Approved", "Rejected", "Cancelled").required(),
    adminNote: Joi.string().allow("", null)
});

module.exports = {
    createRequestSchema,
    updateStatusSchema,
    applicationSchema
};