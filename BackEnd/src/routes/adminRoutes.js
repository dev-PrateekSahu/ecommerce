const express = require('express');
const router = express.Router();
const {getAllUsers,getAllSellers,getAllProducts,getAllOrders,updateSellerStatus,getSellerApplications,approveSellerApplication,rejectSellerApplication} = require('../controllers/adminController');
const adminMiddleware = require('../middlewares/adminMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validateMiddleware');
const { updateSellerStatusSchema } = require('../validations/adminValidation');
router.get('/users',authMiddleware,adminMiddleware,getAllUsers);
router.get('/sellers',authMiddleware,adminMiddleware,getAllSellers);
router.get('/products',authMiddleware,adminMiddleware,getAllProducts);
router.get('/orders',authMiddleware,adminMiddleware,getAllOrders);
router.patch('/sellers/:id/status',authMiddleware,adminMiddleware,validate(updateSellerStatusSchema),updateSellerStatus);

router.get('/seller-applications',authMiddleware,adminMiddleware,getSellerApplications);
router.patch('/seller-applications/:id/approve',authMiddleware,adminMiddleware,approveSellerApplication);
router.patch('/seller-applications/:id/reject',authMiddleware,adminMiddleware,rejectSellerApplication);

module.exports = router;