import request from './request'

// 部门列表查询（后端已就绪，可联调）
export function listDepts() {
  return request.get('/depts')
}

// TODO 以下接口后端待完善，就绪后取消注释即可联调
// export function addDept(data) {
//   return request.post('/depts', data)
// }
// export function updateDept(data) {
//   return request.put('/depts', data)
// }
// export function getDept(id) {
//   return request.get(`/depts/${id}`)
// }
// export function deleteDept(id) {
//   return request.delete('/depts', { params: { id } })
// }
