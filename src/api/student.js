import request from './request'

// 学员分页条件查询：GET /students?name&degree&clazzId&page&pageSize → { total, rows }
export function listStudents(params) {
  return request.get('/students', { params })
}

// 根据 ID 查询学员（编辑回显）：GET /students/{id}
// t 为时间戳防缓存参数：固定 URL 的 GET 可能被复用旧响应，导致编辑回显旧数据
export function getStudent(id) {
  return request.get(`/students/${id}`, { params: { t: Date.now() } })
}

// 添加学员：POST /students
export function addStudent(data) {
  return request.post('/students', data)
}

// 修改学员：PUT /students，body 需带 id
export function updateStudent(data) {
  return request.put('/students', data)
}

// 删除学员：DELETE /students/{ids}（本表单 ID 拼入路径，单个删除直接传一个 ID）
export function deleteStudent(id) {
  return request.delete(`/students/${id}`)
}

// 违纪处理（扣分）：PUT /students/violation/{id}/{score}
export function punishStudent(id, score) {
  return request.put(`/students/violation/${id}/${score}`)
}
