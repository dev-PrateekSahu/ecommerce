const {z} = require('zod');

const createProductSchema = z.object({
    name : z
        .string()
        .min(2,"Product length must contain atleast 2 characters"),
            
    description: z
        .string()
        .min(10, "Description must contain at least 10 characters"),

    price: z
        .number()
        .nonnegative("Price cannot be negative"),

    stock: z
        .number()
        .int("Stock must be an integer")
        .nonnegative("Stock cannot be negative")
});

module.exports = {createProductSchema};