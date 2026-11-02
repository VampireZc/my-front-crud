import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { App, Button, Card, Form, Input, Typography } from 'antd'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../../api/auth'
import { setAuth } from '../../utils/auth'

// 登录页：提交用户名/密码 -> POST /login -> 存 token+用户 -> 跳转后台
export default function LoginPage() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const onFinish = async (values) => {
    setLoading(true)
    try {
      const data = await login({ username: values.username, password: values.password })
      setAuth(data?.token, { id: data?.id, username: data?.username, name: data?.name })
      message.success(`欢迎回来，${data?.name || data?.username || ''}`)
      navigate('/dept', { replace: true })
    } catch {
      // 失败提示已由 axios 拦截器统一处理
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrap">
      <Card style={{ width: 360 }} title="后台管理系统 · 登录">
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input prefix={<UserOutlined />} placeholder="用户名" size="large" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码" size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block loading={loading}>
              登 录
            </Button>
          </Form.Item>
          <Typography.Text type="secondary">
            还没有账号？<Link to="/register">去注册</Link>
          </Typography.Text>
          <Typography.Text type="secondary" style={{ float: 'right' }}>
            <Link to="/dept">跳过，直接体验后台 →</Link>
          </Typography.Text>
        </Form>
      </Card>
    </div>
  )
}
