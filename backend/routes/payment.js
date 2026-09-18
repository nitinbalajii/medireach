const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const router = express.Router();

// Initialize Razorpay instance with mock/test keys
// For a portfolio project, we can use test mode keys
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag', // Mock test key
  key_secret: process.env.RAZORPAY_KEY_SECRET || '5tM4W4U2Wk1R5Q2H9G4J8F2', // Mock secret
});

// POST /api/payment/create-order
router.post('/create-order', async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    const options = {
      amount: amount * 100, // amount in the smallest currency unit (paise)
      currency: 'INR',
      receipt: `receipt_order_${Math.floor(Math.random() * 10000)}`,
    };

    const order = await razorpay.orders.create(options);
    
    if (!order) {
      return res.status(500).json({ error: 'Failed to create Razorpay order' });
    }

    res.json(order);
  } catch (error) {
    console.error('Razorpay Error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

// POST /api/payment/verify
router.post('/verify', (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    const key_secret = process.env.RAZORPAY_KEY_SECRET || '5tM4W4U2Wk1R5Q2H9G4J8F2';
    
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", key_secret)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      return res.status(200).json({ success: true, message: "Payment verified successfully" });
    } else {
      return res.status(400).json({ success: false, message: "Invalid signature sent!" });
    }
  } catch (error) {
    console.error('Verify Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
