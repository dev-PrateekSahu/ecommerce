const {z} = require('zod');

const mongoose = require('mongoose');
const addToCartSchema = z.object({
    productId: z
        .string()
        .refine(
            (id) => mongoose.Types.ObjectId.isValid(id),
            "Invalid product ID"
        ),

    quantity: z
        .number()
        .int()
        .min(1)
});

const updateCartSchema = z.object({
    quantity: z.number().int().min(0)
});

module.exports = {
    addToCartSchema,updateCartSchema
};