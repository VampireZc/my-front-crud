import request from './request'

// 登录：POST /login，body { username, password }
// 成功返回 data: { id, username, name, token }
export function login(data) {
  return request.post('/login', data)
}
