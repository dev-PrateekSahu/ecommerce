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

const updateProductSchema = z.object({
    name: z
        .string()
        .min(2, "Product name must contain at least 2 characters")
        .optional(),

    description: z
        .string()
        .min(10, "Description must contain at least 10 characters")
        .optional(),

    price: z
        .number()
        .nonnegative("Price cannot be negative")
        .optional(),

    stock: z
        .number()
        .int("Stock must be an integer")
        .nonnegative("Stock cannot be negative")
        .optional()
}).refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field is required for update' }
);

module.exports = {createProductSchema,updateProductSchema};