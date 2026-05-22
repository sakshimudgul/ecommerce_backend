const { Cart, Product } = require('../models');

exports.getCart = async (req, res) => {
  try {
    const items = await Cart.findAll({
      where: { userId: req.user.id },
      include: [{ model: Product }],
    });
    res.json({ success: true, items });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user.id;
    
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    let cartItem = await Cart.findOne({ where: { userId, productId } });
    
    if (cartItem) {
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      cartItem = await Cart.create({ userId, productId, quantity });
    }
    
    const items = await Cart.findAll({
      where: { userId },
      include: [{ model: Product }],
    });
    
    res.json({ success: true, items });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;
    
    const cartItem = await Cart.findOne({ where: { userId, productId } });
    if (!cartItem) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    if (quantity <= 0) {
      await cartItem.destroy();
    } else {
      cartItem.quantity = quantity;
      await cartItem.save();
    }
    
    const items = await Cart.findAll({
      where: { userId },
      include: [{ model: Product }],
    });
    
    res.json({ success: true, items });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;
    
    await Cart.destroy({ where: { userId, productId } });
    
    const items = await Cart.findAll({
      where: { userId },
      include: [{ model: Product }],
    });
    
    res.json({ success: true, items });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};