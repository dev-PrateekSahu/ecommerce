require('dotenv').config();
const express = require('express');
const app = express();

const productRoutes = require('./routes/productRoutes');
const connectDB = require('./config/db');
connectDB();
app.use(express.json());

const errorMiddleware = require('./middlewares/errorMiddleware');


app.use('/api/products',productRoutes);

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "Server is running"
    });
});

app.use(errorMiddleware);


app.listen(3000,()=>{
    console.log(`Server is running on port `);
    
});