import { createBrowserRouter, Navigate } from 'react-router-dom'
import MainLayout from '../layout/MainLayout'
import DeptManage from '../pages/dept/DeptManage'
import EmployeeManage from '../pages/employee/EmployeeManage'
import LoginPage from '../pages/login/LoginPage'
import RegisterPage from '../pages/login/RegisterPage'
import ReportManage from '../pages/report/ReportManage'
import ClassManage from '../pages/class/ClassManage'
import StudentManage from '../pages/student/StudentManage'
import Placeholder from '../pages/Placeholder'

const router = createBrowserRouter([
  // 登录 / 注册：预留静态页（不套后台布局）
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Navigate to="/dept" replace /> },
      { path: 'dept', element: <DeptManage /> },
      { path: 'employee', element: <EmployeeManage /> },
      { path: 'report', element: <ReportManage /> },
      { path: 'log', element: <Placeholder title="日志管理" /> },
      { path: 'class', element: <ClassManage /> },
      { path: 'student', element: <StudentManage /> },
    ],
  },
])

export default router
