const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { uploadPDF, uploadAudio } = require('../middleware/upload');
const {
  getProjects,
  createProject,
  getProject,
  uploadScript,
  uploadAudioFile,
  updateScriptText,
  updateProjectStatus,
  deleteProject,
} = require('../controllers/project.controller');

router.get('/workspace/:workspaceId', protect, getProjects);
router.post('/workspace/:workspaceId', protect, createProject);
router.get('/:id', protect, getProject);
router.post('/:id/upload-pdf', protect, uploadPDF.single('file'), uploadScript);
router.post('/:id/upload-audio', protect, uploadAudio.single('file'), uploadAudioFile);
router.put('/:id/script', protect, updateScriptText);
router.put('/:id/status', protect, updateProjectStatus);
router.delete('/:id', protect, deleteProject);

module.exports = router;
