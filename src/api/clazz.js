import request from './request'

// 班级分页条件查询：GET /clazzs?name&begin&end&page&pageSize → { total, rows }
export function listClazzs(params) {
  return request.get('/clazzs', { params })
}

// 根据 ID 查询班级（编辑回显）：GET /clazzs/{id}
// t 为时间戳防缓存参数：固定 URL 的 GET 可能被复用旧响应，导致编辑回显旧数据
export function getClazz(id) {
  return request.get(`/clazzs/${id}`, { params: { t: Date.now() } })
}

// 添加班级：POST /clazzs，body { name, room, beginDate, endDate, masterId, subject }
export function addClazz(data) {
  return request.post('/clazzs', data)
}

// 修改班级：PUT /clazzs，body 需带 id
export function updateClazz(data) {
  return request.put('/clazzs', data)
}

// 删除班级：DELETE /clazzs/{id}（单个 ID，路径参数）
export function deleteClazz(id) {
  return request.delete(`/clazzs/${id}`)
}
