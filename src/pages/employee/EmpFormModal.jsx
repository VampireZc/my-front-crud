import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { App, Button, Col, DatePicker, Form, Input, InputNumber, Modal, Radio, Row, Select, Space, Typography } from 'antd'
import { useEffect, useState } from 'react'
import { listDepts } from '../../api/dept'
import { addEmp } from '../../api/emp'
import { GENDER_OPTIONS, JOB_OPTIONS } from '../../constants/dict'

const { RangePicker } = DatePicker

// 新增员工弹窗表单：username/name/gender 必填，其余可选，含动态工作经历 exprList
export default function EmpFormModal({ open, onCancel, onSuccess }) {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)
  const [deptOptions, setDeptOptions] = useState([])

  // 打开时拉取部门列表用于下拉（取足够大的 pageSize 拿全量）
  useEffect(() => {
    if (!open) return
    listDepts({ page: 1, pageSize: 1000 })
      .then((res) => {
        const rows = res?.rows ?? (Array.isArray(res) ? res : [])
        setDeptOptions(rows.map((d) => ({ value: d.id, label: d.name })))
      })
      .catch(() => {
        // 失败提示已由 axios 拦截器统一处理
      })
  }, [open])

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
          company: e.company,
          job: e.job,
          begin: begin ? begin.format('YYYY-MM-DD') : undefined,
          end: end ? end.format('YYYY-MM-DD') : undefined,
        }
      }),
    }
    setSubmitting(true)
    try {
      await addEmp(payload)
      message.success(`员工「${payload.name}」添加成功`)
      onSuccess()
    } catch {
      // 失败提示已由 axios 拦截器统一处理
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      title="新增员工"
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={submitting}
      width={720}
      destroyOnClose
      okText="保存"
      cancelText="取消"
    >
      <Form form={form} layout="vertical" preserve={false} initialValues={{ gender: 1 }}>
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

        <Typography.Title level={5}>
          任职信息
        </Typography.Title>
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

        <Typography.Title level={5}>
          工作经历（可选）
        </Typography.Title>
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
    </Modal>
  )
}
