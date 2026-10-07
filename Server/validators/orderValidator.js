const Joi = require("joi");

const createOrderSchema = Joi.object({
    items: Joi.array().items(
        Joi.object({
            product: Joi.string().hex().length(24).required(),
            quantity: Joi.number().integer().min(1).required()
        })
    ).min(1).required(),
    shippingAddress: Joi.object({
        fullName: Joi.string().trim().required(),
        phone: Joi.string().trim().required(),
        city: Joi.string().trim().required(),
        address: Joi.string().trim().allow("").optional(),
        street: Joi.string().trim().allow("").optional(),
        state: Joi.string().trim().allow("").optional(),
        zipCode: Joi.string().trim().allow("").optional(),
    }).unknown(true).required()
});

const updateOrderStatusSchema = Joi.object({
    status: Joi.string().valid("Pending", "Processing", "Shipped", "Delivered", "Cancelled").required()
});

module.exports = {
    createOrderSchema,
    updateOrderStatusSchema
};
