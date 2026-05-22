const express = require('express');
const { addReview, getProductReviews, deleteReview } = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/product/:productId', getProductReviews);
router.post('/', authMiddleware, addReview);
router.delete('/:id', authMiddleware, deleteReview);

module.exports = router;