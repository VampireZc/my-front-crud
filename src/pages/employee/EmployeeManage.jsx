import { DeleteOutlined, PlusOutlined, ReloadOutlined, UserOutlined } from '@ant-design/icons'
import { App, Avatar, Button, Card, DatePicker, Form, Input, Popconfirm, Select, Space, Table } from 'antd'
import dayjs from 'dayjs'
import { useCallback, useEffect, useState } from 'react'
import { deleteEmps, listEmps } from '../../api/emp'
import { GENDER_OPTIONS, JOB_MAP } from '../../constants/dict'
import EmpFormModal from './EmpFormModal'

const { RangePicker } = DatePicker

// 日期统一格式化：标准 YYYY-MM-DD（后端可能返回带时间或不一致格式）
const fmtDate = (v) => (v ? dayjs(v).format('YYYY-MM-DD') : '-')

// 员工管理页：分页条件查询 + 顶部筛选 + 勾选批量删除（后端已就绪）
export default function EmployeeManage() {
  const { message } = App.useApp()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  // 筛选条件对象（仅存有效值），改变时触发重新查询
  const [query, setQuery] = useState({})
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [filterForm] = Form.useForm()
  const [modalOpen, setModalOpen] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await listEmps({ ...query, page, pageSize })
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
    if (values.gender != null) next.gender = values.gender
    if (begin) next.begin = begin.format('YYYY-MM-DD')
    if (end) next.end = end.format('YYYY-MM-DD')
    setSelectedRowKeys([])
    setPage(1)
    setQuery(next)
  }

  const handleResetFilter = () => {
    filterForm.resetFields()
    setSelectedRowKeys([])
    setPage(1)
    setQuery({})
  }

  // 删除后刷新：当前页被删空且非首页则回退一页，否则原地刷新
  const refreshAfterDelete = (removedOnPage) => {
    setSelectedRowKeys([])
    if (data.length - removedOnPage <= 0 && page > 1) {
      setPage((p) => p - 1)
    } else {
      loadData()
    }
  }

  const handleBatchDelete = async () => {
    if (!selectedRowKeys.length) return
    try {
      await deleteEmps(selectedRowKeys)
      message.success(`已删除 ${selectedRowKeys.length} 名员工`)
      // 估算当前页被删除条数用于回退判断
      const removedOnPage = selectedRowKeys.filter((id) => data.some((row) => row.id === id)).length
      refreshAfterDelete(removedOnPage)
    } catch {
      // 失败提示已由 axios 拦截器统一处理
    }
  }

  const handleDeleteOne = async (record) => {
    try {
      await deleteEmps([record.id])
      message.success(`已删除员工「${record.name}」`)
      refreshAfterDelete(1)
    } catch {
      // 失败提示已由 axios 拦截器统一处理
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 70 },
    {
      title: '照片',
      dataIndex: 'image',
      width: 70,
      render: (src) => <Avatar src={src} icon={!src && <UserOutlined />} />,
    },
    { title: '姓名', dataIndex: 'name', width: 120 },
    { title: '用户名', dataIndex: 'username', width: 140 },
    { title: '性别', dataIndex: 'gender', width: 70, render: (g) => (g === 2 ? '女' : '男') },
    { title: '职位', dataIndex: 'job', width: 110, render: (j) => JOB_MAP[j] ?? '-' },
    { title: '部门', dataIndex: 'deptName', width: 120, render: (v) => v ?? '-' },
    { title: '入职日期', dataIndex: 'entryDate', width: 130, render: fmtDate },
    { title: '薪资', dataIndex: 'salary', width: 100, render: (v) => (v != null ? `¥${v}` : '-') },
    {
      title: '操作',
      key: 'action',
      width: 90,
      render: (_, record) => (
        <Popconfirm title={`确定删除员工「${record.name}」吗？`} onConfirm={() => handleDeleteOne(record)}>
          <Button type="link" size="small" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Popconfirm>
      ),
    },
  ]

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      {/* 顶部筛选 */}
      <Card>
        <Form form={filterForm} layout="inline" onFinish={handleFilter}>
          <Form.Item name="name" label="姓名">
            <Input placeholder="请输入姓名" allowClear style={{ width: 140 }} />
          </Form.Item>
          <Form.Item name="gender" label="性别">
            <Select placeholder="请选择" allowClear options={GENDER_OPTIONS} style={{ width: 100 }} />
          </Form.Item>
          <Form.Item name="range" label="入职日期">
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
        title="员工列表"
        extra={
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
              新增员工
            </Button>
            <Button icon={<ReloadOutlined />} onClick={loadData}>
              刷新
            </Button>
            <Popconfirm
              title={`确定删除选中的 ${selectedRowKeys.length} 名员工吗？`}
              onConfirm={handleBatchDelete}
              disabled={!selectedRowKeys.length}
            >
              <Button danger icon={<DeleteOutlined />} disabled={!selectedRowKeys.length}>
                批量删除{selectedRowKeys.length ? `（${selectedRowKeys.length}）` : ''}
              </Button>
            </Popconfirm>
          </Space>
        }
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          rowSelection={{ selectedRowKeys, onChange: (keys) => setSelectedRowKeys(keys) }}
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

      <EmpFormModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onSuccess={() => {
          setModalOpen(false)
          loadData()
        }}
      />
    </Space>
  )
}
