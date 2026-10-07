const Joi = require("joi");

const applicationSchema = Joi.object({
    housingType: Joi.string().valid("House", "Apartment", "Other").required(),
    hasYard: Joi.boolean().required(),
    ownsOrRents: Joi.string().valid("Own", "Rent").required(),
    otherPets: Joi.string().allow('', null).default(""),
    experience: Joi.string().valid("None", "Some", "Experienced").required(),
    hoursAlonePerDay: Joi.number().min(0).max(24).required(),
    phone: Joi.string().trim().required(),
    message: Joi.string().max(500).allow('', null).default("")
});

const createRequestSchema = Joi.object({
    dog: Joi.string().hex().length(24).required(),
    application: applicationSchema.optional()
});

const updateStatusSchema = Joi.object({
    status: Joi.string().valid("Pending", "Approved", "Rejected", "Cancelled").required(),
    adminNote: Joi.string().allow('', null)
});

module.exports = {
    createRequestSchema,
    updateStatusSchema,
    applicationSchema
};