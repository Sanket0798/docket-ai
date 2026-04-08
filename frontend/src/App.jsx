import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';

// Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyEmail from './pages/auth/VerifyEmail';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Onboarding
import OnboardingStep1 from './pages/onboarding/Step1';
import OnboardingStep2 from './pages/onboarding/Step2';
import OnboardingStep3 from './pages/onboarding/Step3';

// Dashboard
import Dashboard from './pages/dashboard/Dashboard';
import WorkspaceProjects from './pages/dashboard/WorkspaceProjects';

// Project flow
import UploadScript from './pages/project/UploadScript';
import ScriptEditor from './pages/project/ScriptEditor';
import ScriptSubmitted from './pages/project/ScriptSubmitted';
import AIQuestions from './pages/project/AIQuestions';
import Preview from './pages/project/Preview';
import ExportSuccess from './pages/project/ExportSuccess';

// Account
import Credits from './pages/account/Credits';
import PaymentHistory from './pages/account/PaymentHistory';
import CreditUsage from './pages/account/CreditUsage';
import Profile from './pages/account/Profile';

// 404
import NotFound from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Onboarding */}
            <Route path="/onboarding/step1" element={<ProtectedRoute><OnboardingStep1 /></ProtectedRoute>} />
            <Route path="/onboarding/step2" element={<ProtectedRoute><OnboardingStep2 /></ProtectedRoute>} />
            <Route path="/onboarding/step3" element={<ProtectedRoute><OnboardingStep3 /></ProtectedRoute>} />

            {/* Dashboard */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/workspace/:workspaceId" element={<ProtectedRoute><WorkspaceProjects /></ProtectedRoute>} />

            {/* Project flow */}
            <Route path="/workspace/:workspaceId/upload" element={<ProtectedRoute><UploadScript /></ProtectedRoute>} />
            <Route path="/workspace/:workspaceId/project/:projectId/editor" element={<ProtectedRoute><ScriptEditor /></ProtectedRoute>} />
            <Route path="/workspace/:workspaceId/project/:projectId/submitted" element={<ProtectedRoute><ScriptSubmitted /></ProtectedRoute>} />
            <Route path="/workspace/:workspaceId/project/:projectId/questions" element={<ProtectedRoute><AIQuestions /></ProtectedRoute>} />
            <Route path="/workspace/:workspaceId/project/:projectId/preview" element={<ProtectedRoute><Preview /></ProtectedRoute>} />
            <Route path="/workspace/:workspaceId/project/:projectId/success" element={<ProtectedRoute><ExportSuccess /></ProtectedRoute>} />

            {/* Account */}
            <Route path="/credits" element={<ProtectedRoute><Credits /></ProtectedRoute>} />
            <Route path="/payment-history" element={<ProtectedRoute><PaymentHistory /></ProtectedRoute>} />
            <Route path="/credit-usage" element={<ProtectedRoute><CreditUsage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            {/* Default */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
