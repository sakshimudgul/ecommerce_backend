const stripe = require('../config/stripe');

class PaymentService {
  static async createPaymentIntent(amount, currency = 'usd', metadata = {}) {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      metadata,
      automatic_payment_methods: { enabled: true },
    });
    return paymentIntent;
  }

  static async getPaymentIntent(paymentIntentId) {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  }
}

module.exports = PaymentService;