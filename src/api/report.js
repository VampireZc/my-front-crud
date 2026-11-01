import request from './request'

// 员工性别统计：GET /report/empSex，返回 [{ name, value }]（扇形图）
export function getEmpSexReport() {
  return request.get('/report/empSex')
}

// 员工职位人数统计：GET /report/empJob，返回 { jobList, dataList }（柱状图）
export function getEmpJobReport() {
  return request.get('/report/empJob')
}
