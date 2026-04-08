const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectDB } = require('./src/config/db');

const authRoutes = require('./src/routes/auth.routes');
const workspaceRoutes = require('./src/routes/workspace.routes');
const projectRoutes = require('./src/routes/project.routes');
const onboardingRoutes = require('./src/routes/onboarding.routes');
const creditsRoutes = require('./src/routes/credits.routes');
const profileRoutes = require('./src/routes/profile.routes');
const questionsRoutes = require('./src/routes/questions.routes');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects/:projectId/questions', questionsRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/credits', creditsRoutes);
app.use('/api/profile', profileRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'Docket Factory API running' }));

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
});
