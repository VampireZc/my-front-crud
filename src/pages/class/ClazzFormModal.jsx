import { App, Col, DatePicker, Form, Input, Modal, Row, Select, Spin } from 'antd'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { addClazz, getClazz, updateClazz } from '../../api/clazz'
import { getEmpSimple } from '../../api/emp'

// 后端班级详情 → 表单值（开课/结课转 dayjs，masterId/subject 直接作为下拉 value）
function detailToForm(d) {
  return {
    name: d.name,
    room: d.room,
    beginDate: d.beginDate ? dayjs(d.beginDate) : undefined,
    endDate: d.endDate ? dayjs(d.endDate) : undefined,
    masterId: d.masterId ?? undefined,
    subject: d.subject ?? undefined,
  }
}

const ADD_BASE = {}

// 新增/编辑班级弹窗：editingId 为空 => 新增；班主任/学科下拉来自 /emps/simple
// 编辑先拉详情，数据就绪后再挂载 Form（配合父组件 key 重挂载，避免跨记录残留）
export default function ClazzFormModal({ open, editingId, onCancel, onSuccess }) {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)
  const [masterOptions, setMasterOptions] = useState([])
  const [subjectOptions, setSubjectOptions] = useState([])
  const [formValues, setFormValues] = useState(null)
  // formKey 每次数据就绪自增：强制 Form 重新挂载，确保新的 initialValues 生效
  const [formKey, setFormKey] = useState(0)

  const isEdit = editingId != null

  useEffect(() => {
    if (!open) return
    let cancelled = false

    // 打开即清空，避免展示上一次陈旧值
    // oxlint-disable-next-line react/set-state-in-effect -- 打开即重置
    setFormValues(null)

    // 班主任 / 学科枚举下拉
    getEmpSimple()
      .then((res) => {
        if (cancelled) return
        setMasterOptions((res?.masterEnum ?? []).map((m) => ({ value: m.value, label: m.name })))
        setSubjectOptions((res?.subEnum ?? []).map((s) => ({ value: s.value, label: s.name })))
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
      getClazz(editingId)
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
      name: values.name,
      room: values.room,
      beginDate: values.beginDate ? values.beginDate.format('YYYY-MM-DD') : undefined,
      endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : undefined,
      masterId: values.masterId,
      subject: values.subject,
    }
    setSubmitting(true)
    try {
      if (isEdit) {
        await updateClazz({ id: editingId, ...payload })
        message.success(`班级「${payload.name}」修改成功`)
      } else {
        await addClazz(payload)
        message.success(`班级「${payload.name}」添加成功`)
      }
      onSuccess()
    } catch {
      // 失败提示已由 axios 拦截器统一处理
    } finally {
      setSubmitting(false)
    }
  }

  // 数据就绪才挂载 Form（配合 key 强制重挂，确保展示的是本次请求的数据）
  const showForm = open && formValues

  return (
    <Modal
      title={isEdit ? '编辑班级' : '新增班级'}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={submitting}
      width={600}
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
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="班级名称" rules={[{ required: true, message: '请输入班级名称' }]}>
                <Input placeholder="如：JavaEE就业166期" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="room" label="教室" rules={[{ required: true, message: '请输入教室' }]}>
                <Input placeholder="如：101" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="beginDate" label="开课时间" rules={[{ required: true, message: '请选择开课时间' }]}>
                <DatePicker style={{ width: '100%' }} placeholder="请选择开课时间" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="endDate" label="结课时间" rules={[{ required: true, message: '请选择结课时间' }]}>
                <DatePicker style={{ width: '100%' }} placeholder="请选择结课时间" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="masterId" label="班主任" rules={[{ required: true, message: '请选择班主任' }]}>
                <Select placeholder="请选择班主任" showSearch optionFilterProp="label" options={masterOptions} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="subject" label="学科" rules={[{ required: true, message: '请选择学科' }]}>
                <Select placeholder="请选择学科" options={subjectOptions} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      )}
    </Modal>
  )
}
