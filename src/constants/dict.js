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

// 学历：1 初中, 2 高中, 3 大专, 4 本科, 5 硕士, 6 博士
export const DEGREE_MAP = { 1: '初中', 2: '高中', 3: '大专', 4: '本科', 5: '硕士', 6: '博士' }

// 学历下拉选项（由 DEGREE_MAP 派生，value 为数字传给后端）
export const DEGREE_OPTIONS = Object.entries(DEGREE_MAP).map(([k, v]) => ({ value: Number(k), label: v }))

// 是否是院校学生：1 是, 0 否
export const IS_COLLEGE_OPTIONS = [
  { value: 1, label: '是' },
  { value: 0, label: '否' },
]
