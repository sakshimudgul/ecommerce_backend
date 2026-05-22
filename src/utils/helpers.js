const formatPrice = (price) => {
  return parseFloat(price).toFixed(2);
};

const generateOrderNumber = () => {
  return `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

module.exports = { formatPrice, generateOrderNumber };