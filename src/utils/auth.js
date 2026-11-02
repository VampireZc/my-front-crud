// 登录态本地存储：token 作为已登录标记，user 存 { id, username, name } 供顶栏展示
const TOKEN_KEY = 'token'
const USER_KEY = 'userInfo'

export function setAuth(token, user) {
  if (token != null) localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user ?? null))
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY))
  } catch {
    return null
  }
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}
