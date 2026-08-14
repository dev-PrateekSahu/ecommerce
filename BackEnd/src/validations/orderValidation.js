const { z } = require('zod');

const updateOrderStatusSchema = z.object({
    status: z.enum([
        'confirmed',
        'shipped',
        'delivered',
        'cancelled'
    ])
});

module.exports = { updateOrderStatusSchema };
