const mongoose = require('mongoose');

const sellerApplicationSchema = new mongoose.Schema(
    {
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
            unique:true
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending"
        }
    },
    {
        timestamps:true
    }
);

module.exports = mongoose.model("SellerApplication",sellerApplicationSchema);