import { Avatar, Dropdown, Layout, Menu, Space, Typography } from 'antd'
import {
  ApartmentOutlined,
  BarChartOutlined,
  FileTextOutlined,
  LoginOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SolutionOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

const { Header, Sider, Content } = Layout

// 六大管理模块（登录认证作为预留入口放在顶栏）
const menuItems = [
  { key: '/dept', icon: <ApartmentOutlined />, label: '部门管理' },
  { key: '/employee', icon: <TeamOutlined />, label: '员工管理' },
  { key: '/report', icon: <BarChartOutlined />, label: '报表统计' },
  { key: '/log', icon: <FileTextOutlined />, label: '日志管理' },
  { key: '/class', icon: <SolutionOutlined />, label: '班级/学生管理' },
]

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const currentTitle =
    menuItems.find((m) => pathname.startsWith(m.key))?.label ?? '后台管理系统'

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="logo">{collapsed ? 'CRUD' : '后台管理系统'}</div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
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
                  key: 'login',
                  icon: <LoginOutlined />,
                  label: '登录 / 注册（接口预留）',
                  onClick: () => navigate('/login'),
                },
              ],
            }}
          >
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} />
              <span>管理员</span>
            </Space>
          </Dropdown>
        </Header>
        <Content className="app-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
