const express = require('express');
const router = express.Router();

const {register,login} = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/me',authMiddleware,(req,res)=>{
    res.json({
        succes:true,
        user : req.user
    })
});
router.post('/register',register);
router.post('/login',login);
module.exports = router;