const express = require('express');
const router = express.Router();

const {register,login} = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validateMiddleware');
const {registerSchema,loginSchema} = require('../validations/authValidation');

router.get('/me',authMiddleware,(req,res)=>{
    const user = req.user.toObject();
    delete user.password;

    res.json({
        success: true,
        user
    });
});
router.post('/register',validate(registerSchema),register);
router.post('/login',validate(loginSchema),login);
module.exports = router;