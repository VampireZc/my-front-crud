import { DeleteOutlined, EditOutlined, MinusCircleOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import { App, Button, Card, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Table } from 'antd'
import dayjs from 'dayjs'
import { useCallback, useEffect, useState } from 'react'
import { listAllClazzs } from '../../api/clazz'
import { deleteStudent, listStudents, punishStudent } from '../../api/student'
import { DEGREE_MAP, DEGREE_OPTIONS } from '../../constants/dict'
import StudentFormModal from './StudentFormModal'

const fmtDate = (v) => (v ? dayjs(v).format('YYYY-MM-DD') : '-')

// 学员管理页：分页条件查询（姓名 + 最高学历 + 班级）+ 新增/编辑/删除 + 违纪处理
export default function StudentManage() {
  const { message } = App.useApp()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState({})
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [clazzOptions, setClazzOptions] = useState([])
  const [filterForm] = Form.useForm()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formNonce, setFormNonce] = useState(0)
  // 违纪处理弹窗状态
  const [violateTarget, setViolateTarget] = useState(null)
  const [violateScore, setViolateScore] = useState(1)
  const [violating, setViolating] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await listStudents({ ...query, page, pageSize })
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

  // 班级筛选下拉：加载一次
  useEffect(() => {
    let cancelled = false
    listAllClazzs()
      .then((rows) => {
        if (cancelled) return
        const list = Array.isArray(rows) ? rows : (rows?.rows ?? [])
        setClazzOptions(list.map((c) => ({ value: c.id, label: c.name })))
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const handleFilter = () => {
    const values = filterForm.getFieldsValue()
    const next = {}
    if (values.name?.trim()) next.name = values.name.trim()
    if (values.degree != null) next.degree = values.degree
    if (values.clazzId != null) next.clazzId = values.clazzId
    setPage(1)
    setQuery(next)
  }

  const handleResetFilter = () => {
    filterForm.resetFields()
    setPage(1)
    setQuery({})
  }

  // 删除后刷新：当前页删空且非首页则回退一页，否则原地刷新
  const refreshAfterDelete = () => {
    if (data.length <= 1 && page > 1) {
      setPage((p) => p - 1)
    } else {
      loadData()
    }
  }

  const handleDelete = async (record) => {
    try {
      await deleteStudent(record.id)
      message.success(`已删除学员「${record.name}」`)
      refreshAfterDelete()
    } catch {
      // 失败提示已由 axios 拦截器统一处理
    }
  }

  const openViolate = (record) => {
    setViolateTarget(record)
    setViolateScore(1)
  }

  const handleViolate = async () => {
    if (!violateTarget || !violateScore || violateScore < 1) return
    setViolating(true)
    try {
      await punishStudent(violateTarget.id, violateScore)
      message.success(`已对学员「${violateTarget.name}」扣分 ${violateScore}`)
      setViolateTarget(null)
      loadData()
    } catch {
      // 失败提示已由 axios 拦截器统一处理
    } finally {
      setViolating(false)
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 70 },
    { title: '姓名', dataIndex: 'name', width: 100 },
    { title: '学号', dataIndex: 'no', width: 130 },
    { title: '性别', dataIndex: 'gender', width: 70, render: (g) => (g === 2 ? '女' : '男') },
    { title: '手机号', dataIndex: 'phone', width: 130 },
    { title: '最高学历', dataIndex: 'degree', width: 100, render: (d) => DEGREE_MAP[d] ?? '-' },
    { title: '班级', dataIndex: 'clazzName', width: 130, render: (v) => v ?? '-' },
    { title: '是否院校', dataIndex: 'isCollege', width: 90, render: (v) => (v === 1 ? '是' : '否') },
    { title: '违纪次数', dataIndex: 'violationCount', width: 90, render: (v) => v ?? 0 },
    { title: '违纪扣分', dataIndex: 'violationScore', width: 90, render: (v) => v ?? 0 },
    { title: '毕业时间', dataIndex: 'graduationDate', width: 130, render: fmtDate },
    {
      title: '操作',
      key: 'action',
      width: 220,
      fixed: 'right',
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
          <Button type="link" size="small" icon={<MinusCircleOutlined />} onClick={() => openViolate(record)}>
            违纪
          </Button>
          <Popconfirm title={`确定删除学员「${record.name}」吗？`} onConfirm={() => handleDelete(record)}>
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
          <Form.Item name="name" label="姓名">
            <Input placeholder="请输入姓名" allowClear style={{ width: 140 }} />
          </Form.Item>
          <Form.Item name="degree" label="最高学历">
            <Select placeholder="请选择" allowClear options={DEGREE_OPTIONS} style={{ width: 120 }} />
          </Form.Item>
          <Form.Item name="clazzId" label="班级">
            <Select placeholder="请选择" allowClear showSearch optionFilterProp="label" options={clazzOptions} style={{ width: 160 }} />
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
        title="学员列表"
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
              新增学员
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
        <StudentFormModal
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

      {/* 违纪处理：输入扣分后提交 PUT /students/violation/{id}/{score} */}
      <Modal
        title="违纪处理"
        open={violateTarget != null}
        onOk={handleViolate}
        onCancel={() => setViolateTarget(null)}
        confirmLoading={violating}
        okText="确认扣分"
        cancelText="取消"
        destroyOnClose
      >
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          <span>
            学员：<strong>{violateTarget?.name}</strong>（当前违纪 {violateTarget?.violationCount ?? 0} 次 / 扣分 {violateTarget?.violationScore ?? 0}）
          </span>
          <Space>
            <span>本次扣分</span>
            <InputNumber min={1} value={violateScore} onChange={setViolateScore} addonAfter="分" />
          </Space>
        </Space>
      </Modal>
    </Space>
  )
}
