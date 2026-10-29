import request from './request'

// 员工分页条件查询（后端已就绪，可联调）
// params: { name, gender, begin, end, page, pageSize }，返回 { total, rows }
export function listEmps(params) {
  return request.get('/emps', { params })
}

// 批量删除员工（后端已就绪，可联调）：DELETE /emps?ids=1,2,3
// 注意：ids 需拼接为逗号串，避免 axios 默认把数组序列化为 ids[]=
export function deleteEmps(ids) {
  return request.delete('/emps', { params: { ids: ids.join(',') } })
}

// 添加员工：POST /emps，body 为 JSON（username/name/gender 必填，其余可选，含 exprList 工作经历）
export function addEmp(data) {
  return request.post('/emps', data)
}
