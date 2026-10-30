import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { App, Button, Col, DatePicker, Form, Input, InputNumber, Modal, Radio, Row, Select, Space, Spin, Typography } from 'antd'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { listDepts } from '../../api/dept'
import { addEmp, getEmp, updateEmp } from '../../api/emp'
import { GENDER_OPTIONS, JOB_OPTIONS } from '../../constants/dict'

const { RangePicker } = DatePicker

// 后端员工详情 → 表单值（日期转 dayjs、工作经历起止转 RangePicker，保留 id/empId 以便更新）
function detailToForm(detail) {
  return {
    username: detail.username,
    name: detail.name,
    gender: detail.gender,
    phone: detail.phone,
    image: detail.image,
    deptId: detail.deptId ?? undefined,
    job: detail.job ?? undefined,
    salary: detail.salary ?? undefined,
    entryDate: detail.entryDate ? dayjs(detail.entryDate) : undefined,
    exprList: (detail.exprList ?? []).map((e) => ({
      id: e.id,
      empId: e.empId,
      company: e.company,
      job: e.job,
      range: [e.begin ? dayjs(e.begin) : null, e.end ? dayjs(e.end) : null],
    })),
  }
}

const ADD_BASE = { gender: 1, exprList: [] }

// 新增/编辑员工弹窗：editingId 为空 => 新增；编辑先拉详情，数据就绪后再挂载 Form（Form.List 直接按 exprList 渲染行）
export default function EmpFormModal({ open, editingId, onCancel, onSuccess }) {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)
  const [deptOptions, setDeptOptions] = useState([])
  const [formValues, setFormValues] = useState(null)
  // formKey 每次数据就绪自增：强制 Form 重新挂载，确保新的 initialValues 生效（避免复用上一条缓存数据）
  const [formKey, setFormKey] = useState(0)

  const isEdit = editingId != null

  // 打开时：拉部门下拉；编辑先 GET /emps/{id}，新增直接给初值——数据齐了再挂载 Form
  useEffect(() => {
    if (!open) return
    let cancelled = false

    // 先清空，避免复用上一次（相同 editingId）的旧数据渲染
    // oxlint-disable-next-line react/set-state-in-effect -- 打开即重置，确保不展示陈旧值
    setFormValues(null)

    listDepts({ page: 1, pageSize: 1000 })
      .then((res) => {
        if (cancelled) return
        const rows = res?.rows ?? (Array.isArray(res) ? res : [])
        setDeptOptions(rows.map((d) => ({ value: d.id, label: d.name })))
      })
      .catch(() => {
        // 失败提示已由 axios 拦截器统一处理
      })

    // 数据就绪：写入值并自增 key，强制 Form 重新挂载以应用新的 initialValues
    const applyValues = (values) => {
      if (cancelled) return
      setFormValues(values)
      setFormKey((k) => k + 1)
    }

    if (isEdit) {
      getEmp(editingId)
        .then((detail) => applyValues(detailToForm(detail)))
        .catch(() => applyValues({ ...ADD_BASE }))
    } else {
      applyValues({ ...ADD_BASE })
    }

    return () => {
      cancelled = true
    }
  }, [open, isEdit, editingId])

  const handleOk = async () => {
    const values = await form.validateFields()
    const payload = {
      username: values.username,
      name: values.name,
      gender: values.gender,
      phone: values.phone || undefined,
      image: values.image || undefined,
      deptId: values.deptId ?? undefined,
      job: values.job ?? undefined,
      salary: values.salary ?? undefined,
      entryDate: values.entryDate ? values.entryDate.format('YYYY-MM-DD') : undefined,
      exprList: (values.exprList ?? []).map((e) => {
        const [begin, end] = e.range ?? []
        return {
          id: e.id,
          empId: e.empId,
          company: e.company,
          job: e.job,
          begin: begin ? begin.format('YYYY-MM-DD') : undefined,
          end: end ? end.format('YYYY-MM-DD') : undefined,
        }
      }),
    }
    setSubmitting(true)
    try {
      if (isEdit) {
        await updateEmp({ id: editingId, ...payload })
        message.success(`员工「${payload.name}」修改成功`)
      } else {
        await addEmp(payload)
        message.success(`员工「${payload.name}」添加成功`)
      }
      onSuccess()
    } catch {
      // 失败提示已由 axios 拦截器统一处理
    } finally {
      setSubmitting(false)
    }
  }

  // 数据就绪才挂载 Form（配合下面的 key 强制重挂，确保展示的是本次请求的数据）
  const showForm = open && formValues

  return (
    <Modal
      title={isEdit ? '编辑员工' : '新增员工'}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={submitting}
      width={720}
      destroyOnClose
      okText="保存"
      cancelText="取消"
    >
      {!showForm ? (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <Spin />
        </div>
      ) : (
        <Form key={formKey} form={form} layout="vertical" initialValues={formValues}>
          <Typography.Title level={5} style={{ marginTop: 0 }}>
            基本信息
          </Typography.Title>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="username"
                label="用户名"
                rules={[
                  { required: true, message: '请输入用户名' },
                  { pattern: /^[a-zA-Z0-9_]{3,20}$/, message: '用户名为 3-20 位字母、数字或下划线' },
                ]}
              >
                <Input placeholder="登录用户名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
                <Input placeholder="真实姓名" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="gender" label="性别" rules={[{ required: true, message: '请选择性别' }]}>
                <Radio.Group options={GENDER_OPTIONS} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="手机号"
                rules={[{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }]}
              >
                <Input placeholder="11 位手机号" allowClear />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="image" label="照片 URL">
            <Input placeholder="图片地址（可选）" allowClear />
          </Form.Item>

          <Typography.Title level={5}>任职信息</Typography.Title>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="deptId" label="部门">
                <Select placeholder="请选择部门" allowClear options={deptOptions} showSearch optionFilterProp="label" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="job" label="职位">
                <Select placeholder="请选择职位" allowClear options={JOB_OPTIONS} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="entryDate" label="入职日期">
                <DatePicker style={{ width: '100%' }} placeholder="请选择日期" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="salary" label="薪资">
                <InputNumber min={0} addonBefore="¥" placeholder="月薪" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Typography.Title level={5}>工作经历（可选）</Typography.Title>
          <div style={{ background: '#fafafa', borderRadius: 8, padding: '16px 16px 0' }}>
            <Form.List name="exprList">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field) => (
                    <Space key={field.key} align="baseline">
                      <Form.Item name={[field.name, 'company']} rules={[{ required: true, message: '请输入公司名称' }]}>
                        <Input placeholder="公司名称" style={{ width: 180 }} />
                      </Form.Item>
                      <Form.Item name={[field.name, 'job']} rules={[{ required: true, message: '请输入职位' }]}>
                        <Input placeholder="职位" style={{ width: 110 }} />
                      </Form.Item>
                      <Form.Item name={[field.name, 'range']} rules={[{ required: true, message: '请选择起止时间' }]}>
                        <RangePicker />
                      </Form.Item>
                      <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(field.name)} />
                    </Space>
                  ))}
                  <Button type="dashed" block icon={<PlusOutlined />} onClick={() => add()} style={{ marginBottom: 16 }}>
                    添加工作经历
                  </Button>
                </>
              )}
            </Form.List>
          </div>
        </Form>
      )}
    </Modal>
  )
}
