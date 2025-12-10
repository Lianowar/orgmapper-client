import { Routes, Route, Navigate } from 'react-router-dom'
import ChatPage from './features/chat/ChatPage'
import AdminLayout from './components/AdminLayout'
import EmployeesPage from './features/employees/EmployeesPage'
import EmployeeDetailPage from './features/employees/EmployeeDetailPage'
import EmployeeCreatePage from './features/employees/EmployeeCreatePage'
import SessionDetailPage from './features/sessions/SessionDetailPage'
import QuestionsPage from './features/questions/QuestionsPage'
import PromptsPage from './features/prompts/PromptsPage'
import SettingsPage from './features/settings/SettingsPage'
import DashboardPage from './features/dashboard/DashboardPage'

export default function App() {
  return (
    <Routes>
      <Route path="/i/:token" element={<ChatPage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="employees" replace />} />
        <Route path="employees" element={<EmployeesPage />} />
        <Route path="employees/new" element={<EmployeeCreatePage />} />
        <Route path="employees/:id" element={<EmployeeDetailPage />} />
        <Route path="employees/:employeeId/sessions/:sessionId" element={<SessionDetailPage />} />
        <Route path="questions" element={<QuestionsPage />} />
        <Route path="prompts" element={<PromptsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  )
}
