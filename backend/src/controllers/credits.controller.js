const { pool } = require('../config/db');
const crypto = require('crypto');
require('dotenv').config();

// Initialize Razorpay only if keys are present
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_ID !== 'your_razorpay_key_id') {
  const Razorpay = require('razorpay');
  razorpay = new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

const getPlans = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM credit_plans WHERE is_active = TRUE');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getCreditUsage = async (req, res) => {
  try {
    const [purchased] = await pool.query(
      'SELECT COALESCE(SUM(credits_purchased), 0) as total FROM payments WHERE user_id = ? AND status = "completed"',
      [req.user.id]
    );
    const [spent] = await pool.query(
      'SELECT COALESCE(SUM(credits_used), 0) as total FROM credit_transactions WHERE user_id = ? AND type = "debit"',
      [req.user.id]
    );
    const [userRows] = await pool.query('SELECT credits FROM users WHERE id = ?', [req.user.id]);

    res.json({
      total_purchased: purchased[0].total,
      total_spent:     spent[0].total,
      credits_left:    userRows[0]?.credits || 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getCreditHistory = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ct.*, p.name as project_name
       FROM credit_transactions ct
       LEFT JOIN projects p ON p.id = ct.project_id
       WHERE ct.user_id = ?
       ORDER BY ct.created_at DESC
       LIMIT 50`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const createOrder = async (req, res) => {
  try {
    const { plan_id } = req.body;
    const [plans] = await pool.query('SELECT * FROM credit_plans WHERE id = ?', [plan_id]);
    if (plans.length === 0)
      return res.status(404).json({ message: 'Plan not found' });

    const plan = plans[0];
    let orderId;

    if (razorpay) {
      // Real Razorpay order
      const order = await razorpay.orders.create({
        amount:   plan.price * 100, // paise
        currency: 'INR',
        receipt:  `receipt_${Date.now()}`,
        notes:    { plan_id: plan.id, user_id: req.user.id },
      });
      orderId = order.id;
    } else {
      // Mock order for dev
      orderId = `order_mock_${crypto.randomBytes(8).toString('hex')}`;
      console.log(`[DEV] Mock Razorpay order created: ${orderId} for plan ${plan.name}`);
    }

    await pool.query(
      'INSERT INTO payments (user_id, razorpay_order_id, plan_name, amount, credits_purchased, status) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, orderId, plan.name, plan.price, plan.credits, 'pending']
    );

    res.json({
      order_id:    orderId,
      amount:      plan.price * 100,
      currency:    'INR',
      key_id:      process.env.RAZORPAY_KEY_ID || 'mock',
      plan,
      is_mock:     !razorpay,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { order_id, payment_id, razorpay_signature, payment_method } = req.body;

    const [payments] = await pool.query(
      'SELECT * FROM payments WHERE razorpay_order_id = ? AND user_id = ?',
      [order_id, req.user.id]
    );
    if (payments.length === 0)
      return res.status(404).json({ message: 'Order not found' });

    const payment = payments[0];

    // Verify signature if real Razorpay
    if (razorpay && razorpay_signature) {
      const body = order_id + '|' + payment_id;
      const expectedSig = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex');

      if (expectedSig !== razorpay_signature)
        return res.status(400).json({ message: 'Payment verification failed' });
    }

    const finalPaymentId = payment_id || `pay_mock_${Date.now()}`;

    await pool.query(
      'UPDATE payments SET razorpay_payment_id = ?, payment_method = ?, status = "completed" WHERE id = ?',
      [finalPaymentId, payment_method || 'UPI', payment.id]
    );

    // Add credits to user
    await pool.query(
      'UPDATE users SET credits = credits + ? WHERE id = ?',
      [payment.credits_purchased, req.user.id]
    );

    // Log credit transaction
    await pool.query(
      'INSERT INTO credit_transactions (user_id, action, credits_used, type, status) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, `Purchased ${payment.plan_name} plan`, payment.credits_purchased, 'credit', 'completed']
    );

    res.json({ message: 'Payment verified', credits_added: payment.credits_purchased });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getPaymentHistory = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getPlans, getCreditUsage, getCreditHistory, createOrder, verifyPayment, getPaymentHistory };
