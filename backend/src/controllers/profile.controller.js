const { pool } = require('../config/db');

const getProfile = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, first_name, last_name, email, phone, company_name, credits, avatar_url, is_email_verified, created_at FROM users WHERE id = ?',
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
    const { first_name, last_name, phone, company_name } = req.body;
    if (!first_name || !last_name)
      return res.status(400).json({ message: 'First name and last name are required' });
    await pool.query(
      'UPDATE users SET first_name = ?, last_name = ?, phone = ?, company_name = ? WHERE id = ?',
      [first_name, last_name, phone || null, company_name || null, req.user.id]
    );
    res.json({ message: 'Profile updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getProfile, updateProfile };
