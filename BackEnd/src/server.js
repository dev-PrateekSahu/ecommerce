const express = require('express');
const app = express();

const productRoutes = require('../routes/productRoutes');

app.use('/api/product',productRoutes);

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "Server is running"
    });
});




app.listen(3000,()=>{
    console.log(`Server is running on port `);
    
});