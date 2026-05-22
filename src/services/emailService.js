const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
  }

  async sendOrderConfirmation(order, user) {
    const mailOptions = {
      from: `"E-Commerce" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Order Confirmation #${order.orderNumber}`,
      html: `<h1>Order Confirmed!</h1><p>Order #${order.orderNumber}</p><p>Total: $${order.totalAmount}</p>`,
    };
    await this.transporter.sendMail(mailOptions);
  }
}

module.exports = new EmailService();