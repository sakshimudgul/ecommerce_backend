const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  orderNumber: { type: DataTypes.STRING, unique: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  totalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  status: { type: DataTypes.ENUM('pending', 'processing', 'confirmed', 'shipped', 'delivered', 'cancelled'), defaultValue: 'pending' },
  paymentIntentId: { type: DataTypes.STRING },
  paymentStatus: { type: DataTypes.ENUM('pending', 'paid', 'failed'), defaultValue: 'pending' },
  shippingAddress: { type: DataTypes.TEXT },
}, { timestamps: true });

Order.beforeCreate = async (order) => {
  if (!order.orderNumber) {
    order.orderNumber = `ORD-${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 1000)}`;
  }
};

module.exports = Order;