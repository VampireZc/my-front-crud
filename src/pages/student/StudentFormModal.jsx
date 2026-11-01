import { App, Col, DatePicker, Form, Input, InputNumber, Modal, Radio, Row, Select, Spin } from 'antd'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { listAllClazzs } from '../../api/clazz'
import { addStudent, getStudent, updateStudent } from '../../api/student'
import { DEGREE_OPTIONS, GENDER_OPTIONS, IS_COLLEGE_OPTIONS } from '../../constants/dict'

// 后端学员详情 → 表单值（毕业时间转 dayjs；违纪次数/扣分保留以便修改时原样回传）
function detailToForm(d) {
  return {
    name: d.name,
    no: d.no,
    gender: d.gender,
    phone: d.phone,
    degree: d.degree ?? undefined,
    clazzId: d.clazzId ?? undefined,
    idCard: d.idCard,
    isCollege: d.isCollege ?? undefined,
    address: d.address,
    graduationDate: d.graduationDate ? dayjs(d.graduationDate) : undefined,
    violationCount: d.violationCount,
    violationScore: d.violationScore,
  }
}

const ADD_BASE = { gender: 1, isCollege: 0 }

// 新增/编辑学员弹窗：editingId 为空 => 新增；班级下拉来自 /clazzs/list，学历/性别/是否院校为前端枚举（传数字）
// 编辑先拉详情，数据就绪后再挂载 Form（配合父组件 key 重挂载，避免跨记录残留）
export default function StudentFormModal({ open, editingId, onCancel, onSuccess }) {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)
  const [clazzOptions, setClazzOptions] = useState([])
  const [formValues, setFormValues] = useState(null)
  const [formKey, setFormKey] = useState(0)

  const isEdit = editingId != null

  useEffect(() => {
    if (!open) return
    let cancelled = false

    // 打开即清空，避免展示上一次陈旧值
    // oxlint-disable-next-line react/set-state-in-effect -- 打开即重置
    setFormValues(null)

    listAllClazzs()
      .then((rows) => {
        if (cancelled) return
        const list = Array.isArray(rows) ? rows : (rows?.rows ?? [])
        setClazzOptions(list.map((c) => ({ value: c.id, label: c.name })))
      })
      .catch(() => {
        // 失败提示已由 axios 拦截器统一处理
      })

    const applyValues = (values) => {
      if (cancelled) return
      setFormValues(values)
      setFormKey((k) => k + 1)
    }

    if (isEdit) {
      getStudent(editingId)
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
      no: values.no,
      gender: values.gender,
      phone: values.phone,
      degree: values.degree,
      clazzId: values.clazzId,
      idCard: values.idCard || undefined,
      isCollege: values.isCollege,
      address: values.address || undefined,
      graduationDate: values.graduationDate ? values.graduationDate.format('YYYY-MM-DD') : undefined,
    }
    setSubmitting(true)
    try {
      if (isEdit) {
        // 修改接口要求违纪次数/扣分：原样回传（表单内不可编辑）
        await updateStudent({
          id: editingId,
          ...payload,
          violationCount: values.violationCount ?? 0,
          violationScore: values.violationScore ?? 0,
        })
        message.success(`学员「${payload.name}」修改成功`)
      } else {
        await addStudent(payload)
        message.success(`学员「${payload.name}」添加成功`)
      }
      onSuccess()
    } catch {
      // 失败提示已由 axios 拦截器统一处理
    } finally {
      setSubmitting(false)
    }
  }

  const showForm = open && formValues

  return (
    <Modal
      title={isEdit ? '编辑学员' : '新增学员'}
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
          {/* 违纪次数/扣分随详情带回，修改时原样提交（不在表单编辑） */}
          <Form.Item name="violationCount" hidden>
            <InputNumber />
          </Form.Item>
          <Form.Item name="violationScore" hidden>
            <InputNumber />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
                <Input placeholder="学员姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="no" label="学号" rules={[{ required: true, message: '请输入学号' }]}>
                <Input placeholder="学号" />
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
                rules={[
                  { required: true, message: '请输入手机号' },
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
                ]}
              >
                <Input placeholder="11 位手机号" allowClear />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="degree" label="最高学历" rules={[{ required: true, message: '请选择最高学历' }]}>
                <Select placeholder="请选择学历" options={DEGREE_OPTIONS} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="clazzId" label="班级" rules={[{ required: true, message: '请选择班级' }]}>
                <Select placeholder="请选择班级" showSearch optionFilterProp="label" options={clazzOptions} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="isCollege" label="是否院校学生">
                <Radio.Group options={IS_COLLEGE_OPTIONS} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="graduationDate" label="毕业时间">
                <DatePicker style={{ width: '100%' }} placeholder="请选择毕业时间" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="idCard" label="身份证号">
                <Input placeholder="身份证号（可选）" allowClear />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="address" label="联系地址">
                <Input placeholder="联系地址（可选）" allowClear />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      )}
    </Modal>
  )
}
