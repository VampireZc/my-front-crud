import { Avatar, Dropdown, Layout, Menu, Space, Typography } from 'antd'
import {
  ApartmentOutlined,
  BarChartOutlined,
  FileTextOutlined,
  IdcardOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SolutionOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { clearAuth, getUser } from '../utils/auth'

const { Header, Sider, Content } = Layout

// 各管理模块（顶栏展示当前登录用户并提供退出登录）
const menuItems = [
  { key: '/dept', icon: <ApartmentOutlined />, label: '部门管理' },
  { key: '/employee', icon: <TeamOutlined />, label: '员工管理' },
  { key: '/report', icon: <BarChartOutlined />, label: '报表统计' },
  { key: '/log', icon: <FileTextOutlined />, label: '日志管理' },
  { key: '/class', icon: <SolutionOutlined />, label: '班级管理' },
  { key: '/student', icon: <IdcardOutlined />, label: '学员管理' },
]

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()

  // 顶栏当前登录用户：登录成功后写入 localStorage，这里读取展示
  const user = getUser()
  const displayName = user?.name || user?.username || '未登录'

  const handleLogout = () => {
    clearAuth()
    navigate('/login', { replace: true })
  }

  const currentTitle =
    menuItems.find((m) => pathname.startsWith(m.key))?.label ?? '后台管理系统'

  return (
    <Layout style={{ height: '100vh', overflow: 'hidden' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} style={{ height: '100%', overflowY: 'auto' }}>
        <div className="logo">{collapsed ? 'CRUD' : '后台管理系统'}</div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout style={{ height: '100%', minWidth: 0 }}>
        <Header className="app-header">
          <Space>
            <span
              className="trigger-icon"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </span>
            <Typography.Text strong>{currentTitle}</Typography.Text>
          </Space>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'account',
                  icon: <UserOutlined />,
                  label: `账号：${user?.username ?? '-'}`,
                  disabled: true,
                },
                { type: 'divider' },
                {
                  key: 'logout',
                  icon: <LogoutOutlined />,
                  label: '退出登录',
                  onClick: handleLogout,
                },
              ],
            }}
          >
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} />
              <span>{displayName}</span>
            </Space>
          </Dropdown>
        </Header>
        <Content className="app-content" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
