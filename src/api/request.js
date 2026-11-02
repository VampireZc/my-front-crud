import axios from 'axios'
import { message } from 'antd'
import { clearAuth, getToken } from '../utils/auth'

// 统一请求实例： baseURL 走 vite 代理，/api -> http://localhost:8080
const request = axios.create({
  baseURL: '/api',
  timeout: 5000,
})

// 请求拦截器：登录后统一在请求头携带 token（无 token 时跳过，如 /login 本身）
request.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.token = token
    }
    return config
  },
  (error) => Promise.reject(error),
)

// 登录失效：清除本地登录态并跳回登录页（已在登录页则不重复跳转）
function redirectToLogin() {
  clearAuth()
  if (window.location.pathname !== '/login') {
    window.location.assign('/login')
  }
}

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
    // token 失效 / 未登录（后端若用其它业务码请告知）
    if (res.code === 401 || res.code === 403) {
      message.error('登录已过期，请重新登录')
      redirectToLogin()
      return Promise.reject(new Error('登录已过期'))
    }
    message.error(res.msg || '请求失败')
    return Promise.reject(new Error(res.msg || '请求失败'))
  },
  (error) => {
    const status = error.response?.status
    if (status === 401 || status === 403) {
      message.error('登录已过期，请重新登录')
      redirectToLogin()
      return Promise.reject(error)
    }
    const msg = error.response?.data?.msg || error.message || '网络异常，请稍后重试'
    message.error(msg)
    return Promise.reject(error)
  },
)

export default request
