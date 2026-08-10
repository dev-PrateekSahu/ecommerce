const mongoonse = require('mongoose');

const connectDB = async ()=>{
    try{
        mongoonse.connect(process.env.MONGO_URI);
        console.log("Database connected");
    }catch{
         console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;