const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

const login = asyncHandler(async(req,res)=>{
    let {email, password} = req.body;
    const user = await User.findOne({email});
    if(!user){
        throw new AppError("Incorrect email or password",401);
    }else{
        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch){
            throw new AppError("Incorrect email or password",401);
        }

        const token = jwt.sign({ id:user._id }, process.env.JWT_SECRET);

        res.status(200).json({
            success: true,
            message: "Logged In successfully",
            token
        });
    }
});

const register = asyncHandler(async (req, res) => {
    let {name,email,password} = req.body;
    const already = await User.findOne({email});
    if(already){
        throw new AppError("User already exists",409);
    }else{
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password,salt);

        const user = await User.create({
            name,
            email,
            password: hash
        });
        res.status(201).json({
            success: true,
            message: "User created successfully"
        });
    }
});

module.exports = {register,login};