// React 19 兼容补丁：必须最先引入，修复 antd 静态 message/notification/modal 在 React 19 下不渲染
import '@ant-design/v5-patch-for-react-19'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// dayjs 中文 locale：DatePicker/RangePicker 面板的月份、星期等文案来自 dayjs，需显式设为中文
dayjs.locale('zh-cn')

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
