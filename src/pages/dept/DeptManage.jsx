import { EditOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import { App, Button, Card, Form, Input, Modal, Popconfirm, Space, Table } from 'antd'
import dayjs from 'dayjs'
import { useCallback, useEffect, useState } from 'react'
import { addDept, deleteDept, getDept, listDepts, searchDept, updateDept } from '../../api/dept'

const fmtTime = (v) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-')

// 部门管理页：列表（分页）/删除/新增/编辑已联调；点击编辑时按 ID 请求详情并回显名称
export default function DeptManage() {
  const { message } = App.useApp()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [searchName, setSearchName] = useState('')
  const [editing, setEditing] = useState(null) // null=添加, record=编辑
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [form] = Form.useForm()

  // 分页拉取列表
  const fetchList = useCallback(async (page, size) => {
    const p = page ?? 1
    const ps = size ?? 10
    setLoading(true)
    try {
      const res = await listDepts({ page: p, pageSize: ps })
      // 后端返回 PageInfo 结构：{ total, rows }
      setData(res?.rows ?? [])
      setPagination((prev) => ({ ...prev, current: p, pageSize: ps, total: res?.total ?? 0 }))
    } catch {
      // 错误提示已由 axios 拦截器统一处理
    } finally {
      setLoading(false)
    }
  }, [])

  // 解构出基本类型供依赖，避免依赖整个 pagination 对象（否则更新 total 会触发循环请求）
  const page = pagination.current
  const size = pagination.pageSize
  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- 挂载/翻页时拉取对应页是标准数据请求模式
    fetchList(page, size)
  }, [fetchList, page, size])

  // 按部门名称搜索：调用 /depts?name=xxx；空关键词直接拦截，不发请求
  const handleSearch = async (value) => {
    const name = (value ?? '').trim()
    if (!name) {
      message.warning('请输入部门名称后再搜索')
      return
    }
    setLoading(true)
    try {
      const res = await searchDept(name)
      // 后端可能返回单对象或数组，统一归一化为数组
      const rows = Array.isArray(res) ? res : res ? [res] : []
      setData(rows)
      // 搜索结果不参与分页，同步总数以免分页器误导（不改 current，避免触发列表重新拉取）
      setPagination((prev) => ({ ...prev, total: rows.length }))
    } catch {
      // 失败提示已由 axios 拦截器统一处理
    } finally {
      setLoading(false)
    }
  }

  const openModal = async (record = null) => {
    setEditing(record)
    form.setFieldsValue({ name: '' })
    setModalOpen(true)
    console.log(record);
    
    // 编辑：按 ID 请求详情，将返回的名称回显到输入框
    if (record?.id != null) {
      setDetailLoading(true)
      try {
        const res = await getDept(record.id)        
        form.setFieldsValue({ name: res ?? '' })
      } catch {
        // 查询失败时退回行数据自带的名称兼容
        form.setFieldsValue({ name: record.name ?? '' })
      } finally {
        setDetailLoading(false)
      }
    }
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    try {
      if (editing) {
        // 编辑：带上原记录 id 发起修改
        await updateDept({ id: editing.id, ...values })
        message.success(`部门「${values.name}」修改成功`)
      } else {
        await addDept(values)
        message.success(`部门「${values.name}」添加成功`)
      }
      setModalOpen(false)
      // 增/改后停留在当前页
      fetchList(pagination.current, pagination.pageSize)
    } catch {
      // 失败提示已由 axios 拦截器统一处理
    }
  }

  const handleDelete = async (record) => {
    try {
      await deleteDept(record.id)
      message.success(`部门「${record.name}」删除成功`)
      // 删除后若当前页变空且非首页，回退一页；否则停留当前页
      const isLastOnPage = data.length === 1 && pagination.current > 1
      fetchList(isLastOnPage ? pagination.current - 1 : pagination.current, pagination.pageSize)
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
          <Input.Search
            placeholder="按部门名称搜索"
            allowClear
            style={{ width: 200 }}
            value={searchName}
            onChange={(e) => {
              // 清空时不再自动发请求，避免空值搜索；需要全量列表点「刷新」
              setSearchName(e.target.value)
            }}
            onSearch={handleSearch}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              setSearchName('')
              fetchList(1, pagination.pageSize)
            }}
          >
            刷新
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
            添加部门
          </Button>
        </Space>
      }
    >
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (t) => `共 ${t} 条`,
        }}
        onChange={(pg) =>
          setPagination((prev) => ({ ...prev, current: pg.current ?? 1, pageSize: pg.pageSize ?? 10 }))
        }
      />
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
            <Input placeholder="请输入部门名称" maxLength={20} disabled={detailLoading} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}
