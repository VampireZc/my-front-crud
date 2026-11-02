import request from './request'

// 操作日志列表：GET /report/log
// 返回扁平数组 [{ id, operateEmpId, operateTime, className, methodName, methodParams, returnValue, costTime }]
export function listLogs() {
  return request.get('/report/log')
}
