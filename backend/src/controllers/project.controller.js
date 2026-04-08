const { pool } = require('../config/db');

const getProjects = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM projects WHERE workspace_id = ? AND user_id = ? ORDER BY created_at DESC',
      [req.params.workspaceId, req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const createProject = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Project name is required' });

    const [ws] = await pool.query(
      'SELECT id FROM workspaces WHERE id = ? AND user_id = ?',
      [req.params.workspaceId, req.user.id]
    );
    if (ws.length === 0)
      return res.status(404).json({ message: 'Workspace not found' });

    const [result] = await pool.query(
      'INSERT INTO projects (workspace_id, user_id, name) VALUES (?, ?, ?)',
      [req.params.workspaceId, req.user.id, name]
    );

    const [rows] = await pool.query('SELECT * FROM projects WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getProject = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM projects WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (rows.length === 0)
      return res.status(404).json({ message: 'Project not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const uploadScript = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    await pool.query(
      'UPDATE projects SET script_pdf_url = ? WHERE id = ? AND user_id = ?',
      [req.file.path, req.params.id, req.user.id]
    );
    res.json({ message: 'PDF uploaded', url: req.file.path });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const uploadAudioFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    await pool.query(
      'UPDATE projects SET audio_url = ? WHERE id = ? AND user_id = ?',
      [req.file.path, req.params.id, req.user.id]
    );
    res.json({ message: 'Audio uploaded', url: req.file.path });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateScriptText = async (req, res) => {
  try {
    const { script_text } = req.body;
    await pool.query(
      'UPDATE projects SET script_text = ? WHERE id = ? AND user_id = ?',
      [script_text, req.params.id, req.user.id]
    );
    res.json({ message: 'Script saved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateProjectStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['draft', 'processing', 'completed', 'failed'];
    if (!valid.includes(status))
      return res.status(400).json({ message: 'Invalid status' });

    await pool.query(
      'UPDATE projects SET status = ? WHERE id = ? AND user_id = ?',
      [status, req.params.id, req.user.id]
    );
    res.json({ message: 'Status updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteProject = async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM projects WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Project deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getProjects, createProject, getProject,
  uploadScript, uploadAudioFile, updateScriptText,
  updateProjectStatus, deleteProject,
};
