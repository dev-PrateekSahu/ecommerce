const {z} = require('zod');

const addToCartSchema = z.object({
    productId: z.string(),
    quantity: z.number().min(1).int()
});

const updateCartSchema = z.object({
    quantity: z.number().int().min(0)
});

module.exports = {
    addToCartSchema,updateCartSchema
};