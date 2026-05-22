const { Order, OrderItem, Product, Cart, User } = require('../models');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy');

exports.createOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body;
    const userId = req.user.id;
    
    const cartItems = await Cart.findAll({
      where: { userId },
      include: [{ model: Product }],
    });
    
    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
    
    let totalAmount = 0;
    const orderItems = cartItems.map(item => {
      const itemTotal = item.Product.price * item.quantity;
      totalAmount += parseFloat(itemTotal);
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: item.Product.price,
        productName: item.Product.name,
        productImage: item.Product.imageUrl,
      };
    });
    
    for (const item of cartItems) {
      if (item.Product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${item.Product.name}` });
      }
    }
    
    const order = await Order.create({
      userId,
      totalAmount,
      shippingAddress,
      status: 'pending',
      paymentStatus: 'pending',
    });
    
    for (const item of orderItems) {
      await OrderItem.create({ ...item, orderId: order.id });
      await Product.update(
        { stock: Product.stock - item.quantity },
        { where: { id: item.productId } }
      );
    }
    
    await Cart.destroy({ where: { userId } });
    
    // Create Stripe payment intent (if Stripe is configured)
    let clientSecret = null;
    if (process.env.STRIPE_SECRET_KEY) {
      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(totalAmount * 100),
          currency: 'usd',
          metadata: { orderId: order.id, userId },
        });
        await order.update({ paymentIntentId: paymentIntent.id });
        clientSecret = paymentIntent.client_secret;
      } catch (stripeError) {
        console.log('Stripe not configured, skipping payment intent');
      }
    }
    
    res.status(201).json({
      success: true,
      order,
      clientSecret,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [{ model: OrderItem, include: [{ model: Product }] }],
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [{ model: OrderItem, include: [{ model: Product }] }],
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};