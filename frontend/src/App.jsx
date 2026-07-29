import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './store/authStore'
import LoginPage from './pages/auth/LoginPage'
import { useIsMobile } from './hooks/useIsMobile'
import Dashboard from './pages/admin/Dashboard'
import TeachersPage from './pages/admin/TeachersPage'
import StudentsPage from './pages/admin/StudentsPage'
import ClassesPage from './pages/admin/ClassesPage'
import SubjectsPage from './pages/admin/SubjectsPage'
import AssignmentsPage from './pages/admin/AssignmentsPage'
import BackupPage from './pages/admin/BackupPage'
import GradesPage from './pages/admin/GradesPage'
import GradeValidationPage from './pages/admin/GradeValidationPage'
import ReportCardsPage from './pages/admin/ReportCardsPage'
import SettingsPage from './pages/admin/SettingsPage'
import StatisticsPage from './pages/admin/StatisticsPage'
import MobileDashboard from './pages/mobile/MobileDashboard'
import MobileStudents from './pages/mobile/MobileStudents'
import MobileTeachers from './pages/mobile/MobileTeachers'
import MobileClasses from './pages/mobile/MobileClasses'
import MobileSubjects from './pages/mobile/MobileSubjects'
import MobileAssignments from './pages/mobile/MobileAssignments'
import MobileGrades from './pages/mobile/MobileGrades'
import MobileGradeValidation from './pages/mobile/MobileGradeValidation'
import MobileReportCards from './pages/mobile/MobileReportCards'
import MobileStatistics from './pages/mobile/MobileStatistics'
import MobileSettings from './pages/mobile/MobileSettings'
import MobileBackup from './pages/mobile/MobileBackup'
import AdminLayout from './components/layout/AdminLayout'
import MobileLayout from './components/layout/MobileLayout'
import ProtectedRoute from './components/shared/ProtectedRoute'
import './index.css'

function DesktopRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="teachers" element={<TeachersPage />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="classes" element={<ClassesPage />} />
        <Route path="subjects" element={<SubjectsPage />} />
        <Route path="assignments" element={<AssignmentsPage />} />
        <Route path="grades" element={<GradesPage />} />
        <Route path="grades/validation" element={<GradeValidationPage />} />
        <Route path="report-cards" element={<ReportCardsPage />} />
        <Route path="statistics" element={<StatisticsPage />} />
        <Route path="backup" element={<BackupPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}

function MobileRoutes() {
  return (
    <Routes>
      <Route element={<MobileLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<MobileDashboard />} />
        <Route path="teachers" element={<MobileTeachers />} />
        <Route path="students" element={<MobileStudents />} />
        <Route path="classes" element={<MobileClasses />} />
        <Route path="subjects" element={<MobileSubjects />} />
        <Route path="assignments" element={<MobileAssignments />} />
        <Route path="grades" element={<MobileGrades />} />
        <Route path="grades/validation" element={<MobileGradeValidation />} />
        <Route path="report-cards" element={<MobileReportCards />} />
        <Route path="statistics" element={<MobileStatistics />} />
        <Route path="backup" element={<MobileBackup />} />
        <Route path="settings" element={<MobileSettings />} />
      </Route>
    </Routes>
  )
}

function AdaptiveAdminRoutes() {
  const isMobile = useIsMobile()
  return isMobile ? <MobileRoutes /> : <DesktopRoutes />
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute role="admin">
              <AdaptiveAdminRoutes />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  )
}
