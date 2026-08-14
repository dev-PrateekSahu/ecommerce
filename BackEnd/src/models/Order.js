const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
    {
        user:{
            type: mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
        },
        items : [{
            product : {
                type: mongoose.Schema.Types.ObjectId,
                ref:"Product",
                required:true
            },
            quantity:{
                type: Number,
                min: 1,
                required:true,
            },
            price : {
                type: Number,
                min: 0,
                required:true
            }
        }],
        totalAmount:{
            type:Number,
            required:true
        },
        status:{
            type:String,
            enum:["pending","confirmed","shipped","delivered","cancelled"],
            default:"pending"
        },
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    }, 
    {
        timestamps:true
    }
);

module.exports = mongoose.model("Order",OrderSchema);