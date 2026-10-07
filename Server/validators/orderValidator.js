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
        address: Joi.string().trim().required()
    }).required()
});

const updateOrderStatusSchema = Joi.object({
    status: Joi.string().valid("Pending", "Shipped", "Delivered", "Cancelled").required()
});

module.exports = {
    createOrderSchema,
    updateOrderStatusSchema
};
