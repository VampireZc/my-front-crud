import { createBrowserRouter, Navigate } from 'react-router-dom'
import MainLayout from '../layout/MainLayout'
import DeptManage from '../pages/dept/DeptManage'
import LoginPage from '../pages/login/LoginPage'
import RegisterPage from '../pages/login/RegisterPage'
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
      { path: 'employee', element: <Placeholder title="员工管理" /> },
      { path: 'report', element: <Placeholder title="报表统计" /> },
      { path: 'log', element: <Placeholder title="日志管理" /> },
      { path: 'class', element: <Placeholder title="班级/学生管理" /> },
    ],
  },
])

export default router
