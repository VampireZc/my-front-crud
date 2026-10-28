import { EditOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import { App, Button, Card, Form, Input, Modal, Popconfirm, Space, Table } from 'antd'
import dayjs from 'dayjs'
import { useCallback, useEffect, useState } from 'react'
import { addDept, deleteDept, listDepts } from '../../api/dept'

const fmtTime = (v) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-')

// 部门管理页：列表/删除/新增已联调；编辑仅 UI 预留，提交时提示接口未就绪
export default function DeptManage() {
  const { message } = App.useApp()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null) // null=添加, record=编辑
  const [form] = Form.useForm()

  const fetchList = useCallback(async () => {
    setLoading(true)
    try {
      const res = await listDepts()
      setData(res || [])
    } catch {
      // 错误提示已由 axios 拦截器统一处理
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- 挂载时拉取列表是标准数据请求模式
    fetchList()
  }, [fetchList])

  const openModal = (record = null) => {
    setEditing(record)
    form.setFieldsValue({ name: record?.name ?? '' })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    // 编辑：后端修改接口尚未就绪，先提示占位
    if (editing) {
      message.info(`部门修改接口待后端完善（${values.name}）`)
      setModalOpen(false)
      return
    }
    // 新增：真实联调
    try {
      await addDept(values)
      message.success(`部门「${values.name}」添加成功`)
      setModalOpen(false)
      fetchList()
    } catch {
      // 失败提示已由 axios 拦截器统一处理
    }
  }

  const handleDelete = async (record) => {
    try {
      await deleteDept(record.id)
      message.success(`部门「${record.name}」删除成功`)
      fetchList()
    } catch {
      // 失败提示已由 axios 拦截器统一处理
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: '部门名称', dataIndex: 'name' },
    { title: '创建时间', dataIndex: 'createTime', render: fmtTime, width: 200 },
    { title: '修改时间', dataIndex: 'updateTime', render: fmtTime, width: 200 },
    {
      title: '操作',
      key: 'action',
      width: 160,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openModal(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除该部门吗？" onConfirm={() => handleDelete(record)}>
            <Button type="link" size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <Card
      title="部门列表"
      extra={
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchList}>
            刷新
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
            添加部门
          </Button>
        </Space>
      }
    >
      <Table rowKey="id" columns={columns} dataSource={data} loading={loading} pagination={false} />
      <Modal
        title={editing ? '编辑部门' : '添加部门'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="name"
            label="部门名称"
            rules={[
              { required: true, message: '请输入部门名称' },
              { max: 20, message: '部门名称不能超过 20 个字符' },
            ]}
          >
            <Input placeholder="请输入部门名称" maxLength={20} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}
