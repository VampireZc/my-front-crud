import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { App, Button, Card, Form, Input, Typography } from 'antd'
import { Link } from 'react-router-dom'

// 登录静态占位页：UI 与校验完整，提交时提示接口未就绪
export default function LoginPage() {
  const { message } = App.useApp()

  const onFinish = () => {
    // TODO: 后端登录接口就绪后，改为真实请求 + 存 token + navigate('/dept')
    message.info('登录接口待后端完善，当前为静态占位页')
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
            <Button type="primary" htmlType="submit" size="large" block>
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
