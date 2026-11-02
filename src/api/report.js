import request from './request'

// 员工性别统计：GET /report/empSex，返回 [{ name, value }]（扇形图）
export function getEmpSexReport() {
  return request.get('/report/empSex')
}

// 员工职位人数统计：GET /report/empJob，返回 { jobList, dataList }（柱状图）
export function getEmpJobReport() {
  return request.get('/report/empJob')
}

// 班级人数统计：GET /report/clazzNum，复用员工职位结构 { jobList, dataList }（jobList 存班级名）→ 柱状图
export function getClazzNumReport() {
  return request.get('/report/clazzNum')
}

// 学历人数统计：GET /report/gender，复用员工性别结构 [{ name, value }] → 扇形图
export function getDegreeReport() {
  return request.get('/report/gender')
}
