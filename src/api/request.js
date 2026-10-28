import axios from 'axios'
import { message } from 'antd'

// 统一请求实例： baseURL 走 vite 代理，/api -> http://localhost:8080
const request = axios.create({
  baseURL: '/api',
  timeout: 5000,
})

// 响应拦截器：解构后端统一格式 { code, msg, data }，code===1 为成功
request.interceptors.response.use(
  (response) => {
    const res = response.data
    // 非标准结构直接返回原始数据
    if (!res || typeof res !== 'object' || !('code' in res)) {
      return res
    }
    if (res.code === 1) {
      return res.data
    }
    message.error(res.msg || '请求失败')
    return Promise.reject(new Error(res.msg || '请求失败'))
  },
  (error) => {
    const msg = error.response?.data?.msg || error.message || '网络异常，请稍后重试'
    message.error(msg)
    return Promise.reject(error)
  },
)

export default request
