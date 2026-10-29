// 员工相关字典（与后端约定一致，供列表展示与表单下拉复用）

// 职位：1 班主任, 2 讲师, 3 学工主管, 4 教研主管, 5 咨询师
export const JOB_MAP = { 1: '班主任', 2: '讲师', 3: '学工主管', 4: '教研主管', 5: '咨询师' }

// 性别：1 男, 2 女
export const GENDER_OPTIONS = [
  { value: 1, label: '男' },
  { value: 2, label: '女' },
]

// 职位下拉选项（由 JOB_MAP 派生）
export const JOB_OPTIONS = Object.entries(JOB_MAP).map(([k, v]) => ({ value: Number(k), label: v }))
