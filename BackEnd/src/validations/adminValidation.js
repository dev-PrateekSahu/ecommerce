const { z } = require('zod');

const updateSellerStatusSchema = z.object({
    isActive: z.boolean()
});

module.exports = { updateSellerStatusSchema };
