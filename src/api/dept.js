import request from './request'

// 部门列表分页查询（后端已就绪，可联调；params: { page, pageSize }）
export function listDepts(params) {
  return request.get('/depts', { params })
}

// 删除部门（后端已就绪，可联调）
export function deleteDept(id) {
  return request.delete('/depts', { params: { id } })
}

// 添加部门（后端已就绪，可联调）
export function addDept(data) {
  return request.post('/depts', data)
}

// 修改部门（后端已就绪，可联调）
export function updateDept(data) {
  return request.put('/depts', data)
}

// 根据 ID 查询部门（后端已就绪，可联调；用于编辑回显）
export function getDept(id) {
  return request.get(`/depts/${id}`)
}

// 按部门名称搜索（查询参数形式：GET /depts?name=xxx，与编辑的 /depts/{id} 路径传参区分）
export function searchDept(name) {
  return request.get('/depts', { params: { name } })
}
