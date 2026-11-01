import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import { App, Button, Card, DatePicker, Form, Input, Popconfirm, Space, Table, Tag } from 'antd'
import dayjs from 'dayjs'
import { useCallback, useEffect, useState } from 'react'
import { deleteClazz, listClazzs } from '../../api/clazz'
import ClazzFormModal from './ClazzFormModal'

const { RangePicker } = DatePicker

// 日期统一格式化：标准 YYYY-MM-DD
const fmtDate = (v) => (v ? dayjs(v).format('YYYY-MM-DD') : '-')

// 班级状态标签颜色（后端直接返回中文状态串）
const STATUS_COLOR = { 未开班: 'default', 已开班: 'processing', 已结课: 'success' }

// 班级管理页：分页条件查询（班级名称 + 结课时间范围）+ 新增/编辑/删除
export default function ClassManage() {
  const { message } = App.useApp()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  // 筛选条件对象（仅存有效值），改变时触发重新查询
  const [query, setQuery] = useState({})
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [filterForm] = Form.useForm()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  // 每次打开弹窗自增：配合 key 强制 ClazzFormModal 整体重挂载，得到全新空 store，避免跨记录残留
  const [formNonce, setFormNonce] = useState(0)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await listClazzs({ ...query, page, pageSize })
      setData(res?.rows ?? [])
      setTotal(res?.total ?? 0)
    } catch {
      // 失败提示已由 axios 拦截器统一处理
    } finally {
      setLoading(false)
    }
  }, [query, page, pageSize])

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- 条件/翻页变化时拉取数据是标准请求模式
    loadData()
  }, [loadData])

  // 应用筛选：回到第一页
  const handleFilter = () => {
    const values = filterForm.getFieldsValue()
    const [begin, end] = values.range ?? []
    const next = {}
    if (values.name?.trim()) next.name = values.name.trim()
    if (begin) next.begin = begin.format('YYYY-MM-DD')
    if (end) next.end = end.format('YYYY-MM-DD')
    setPage(1)
    setQuery(next)
  }

  const handleResetFilter = () => {
    filterForm.resetFields()
    setPage(1)
    setQuery({})
  }

  // 删除后刷新：当前页被删空且非首页则回退一页，否则原地刷新
  const refreshAfterDelete = () => {
    if (data.length <= 1 && page > 1) {
      setPage((p) => p - 1)
    } else {
      loadData()
    }
  }

  const handleDelete = async (record) => {
    try {
      await deleteClazz(record.id)
      message.success(`已删除班级「${record.name}」`)
      refreshAfterDelete()
    } catch {
      // 失败提示已由 axios 拦截器统一处理
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 70 },
    { title: '班级名称', dataIndex: 'name', width: 160 },
    { title: '教室', dataIndex: 'room', width: 90 },
    { title: '开课时间', dataIndex: 'beginDate', width: 130, render: fmtDate },
    { title: '结课时间', dataIndex: 'endDate', width: 130, render: fmtDate },
    { title: '班主任', dataIndex: 'masterName', width: 110, render: (v) => v ?? '-' },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (s) => (s ? <Tag color={STATUS_COLOR[s] ?? 'default'}>{s}</Tag> : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      render: (_, record) => (
        <Space size={0}>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingId(record.id)
              setFormNonce((n) => n + 1)
              setModalOpen(true)
            }}
          >
            编辑
          </Button>
          <Popconfirm title={`确定删除班级「${record.name}」吗？`} onConfirm={() => handleDelete(record)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      {/* 顶部筛选 */}
      <Card>
        <Form form={filterForm} layout="inline" onFinish={handleFilter}>
          <Form.Item name="name" label="班级名称">
            <Input placeholder="请输入班级名称" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="range" label="结课时间">
            <RangePicker />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
              <Button onClick={handleResetFilter}>重置</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* 列表 */}
      <Card
        title="班级列表"
        extra={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingId(null)
                setFormNonce((n) => n + 1)
                setModalOpen(true)
              }}
            >
              新增班级
            </Button>
            <Button icon={<ReloadOutlined />} onClick={loadData}>
              刷新
            </Button>
          </Space>
        }
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          scroll={{ x: 'max-content' }}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (t) => `共 ${t} 条`,
          }}
          onChange={(pg) => {
            setPage(pg.current ?? 1)
            setPageSize(pg.pageSize ?? 10)
          }}
        />
      </Card>

      {modalOpen && (
        <ClazzFormModal
          key={`${editingId ?? 'new'}-${formNonce}`}
          open
          editingId={editingId}
          onCancel={() => setModalOpen(false)}
          onSuccess={() => {
            setModalOpen(false)
            loadData()
          }}
        />
      )}
    </Space>
  )
}
