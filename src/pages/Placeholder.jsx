import { Card, Result } from 'antd'
import { ToolOutlined } from '@ant-design/icons'

// 待后端接口就绪后替换为真实页面的通用占位页
export default function Placeholder({ title }) {
  return (
    <Card>
      <Result
        icon={<ToolOutlined />}
        title={`${title} · 建设中`}
        subTitle="该模块后端接口尚未完善，就绪后即可联调"
      />
    </Card>
  )
}
