const { Review, Product, Order, OrderItem, User } = require('../models');

exports.addReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.user.id;
    
    const hasPurchased = await Order.findOne({
      where: { userId, paymentStatus: 'paid' },
      include: [{ model: OrderItem, where: { productId }, required: true }],
    });
    
    if (!hasPurchased) {
      return res.status(403).json({ message: 'You can only review products you have purchased' });
    }
    
    const existingReview = await Review.findOne({ where: { userId, productId } });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }
    
    const review = await Review.create({ userId, productId, rating, comment });
    
    const product = await Product.findByPk(productId);
    const reviews = await Review.findAll({ where: { productId } });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    
    await product.update({ ratingAvg: avgRating, ratingCount: reviews.length });
    
    res.status(201).json({ success: true, review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { productId: req.params.productId },
      include: [{ model: User, attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    
    if (req.user.role !== 'admin' && review.userId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    await review.destroy();
    
    const product = await Product.findByPk(review.productId);
    const reviews = await Review.findAll({ where: { productId: review.productId } });
    const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
    
    await product.update({ ratingAvg: avgRating, ratingCount: reviews.length });
    
    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};