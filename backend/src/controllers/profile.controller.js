const { pool } = require('../config/db');

const getProfile = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, full_name, email, phone, credits, avatar_url, is_email_verified, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0)
      return res.status(404).json({ message: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { full_name, phone } = req.body;
    await pool.query(
      'UPDATE users SET full_name = ?, phone = ? WHERE id = ?',
      [full_name, phone || null, req.user.id]
    );
    res.json({ message: 'Profile updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getProfile, updateProfile };
