import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { App, Button, Card, Form, Input, Typography } from 'antd'
import { Link } from 'react-router-dom'

// 注册静态占位页：UI 与校验完整，提交时提示接口未就绪
export default function RegisterPage() {
  const { message } = App.useApp()

  const onFinish = () => {
    // TODO: 后端注册接口就绪后，改为真实请求
    message.info('注册接口待后端完善，当前为静态占位页')
  }

  return (
    <div className="auth-wrap">
      <Card style={{ width: 360 }} title="后台管理系统 · 注册">
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, max: 20, message: '用户名长度为 3-20 个字符' },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" size="large" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码不能少于 6 位' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" size="large" />
          </Form.Item>
          <Form.Item
            name="confirm"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'))
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="确认密码" size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block>
              注 册
            </Button>
          </Form.Item>
          <Typography.Text type="secondary">
            已有账号？<Link to="/login">去登录</Link>
          </Typography.Text>
        </Form>
      </Card>
    </div>
  )
}
