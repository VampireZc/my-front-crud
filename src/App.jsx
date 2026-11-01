import { App as AntdApp, ConfigProvider } from 'antd'
import zhCNraw from 'antd/locale/zh_CN'
import { RouterProvider } from 'react-router-dom'
import router from './router'

// 防御 Vite 对 antd CJS 默认导出的互操作差异：某些预构建缓存下 default 会被再包一层 { default: ... }
// 解包后传给 ConfigProvider，确保 locale 真正生效（否则日期/分页等会回退英文）
const zhCN = zhCNraw?.default ?? zhCNraw

// 全局：antd 中文语言 + App 上下文（提供 useApp 的 message/modal）
export default function App() {
  return (
    <ConfigProvider locale={zhCN} theme={{ token: { colorPrimary: '#1677ff' } }}>
      <AntdApp>
        <RouterProvider router={router} />
      </AntdApp>
    </ConfigProvider>
  )
}
