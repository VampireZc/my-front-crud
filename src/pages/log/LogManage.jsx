import { ReloadOutlined } from '@ant-design/icons'
import { Button, Card, Table, Tooltip } from 'antd'
import dayjs from 'dayjs'
import { useCallback, useEffect, useState } from 'react'
import { listLogs } from '../../api/log'

// 操作时间格式化：后端返回 ISO 串，统一展示到秒
const fmtTime = (v) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-')

// 长文本列：省略号 + 悬浮显示完整内容
const ellipsisCell = (text) => (
  <Tooltip title={text} placement="topLeft">
    <span>{text}</span>
  </Tooltip>
)

const columns = [
  { title: 'ID', dataIndex: 'id', width: 72 },
  { title: '操作人ID', dataIndex: 'operateEmpId', width: 100 },
  { title: '操作时间', dataIndex: 'operateTime', width: 180, render: fmtTime },
  { title: '类名', dataIndex: 'className', ellipsis: { showTitle: false }, render: ellipsisCell },
  { title: '方法', dataIndex: 'methodName', width: 140, ellipsis: { showTitle: false }, render: ellipsisCell },
  { title: '请求参数', dataIndex: 'methodParams', ellipsis: { showTitle: false }, render: ellipsisCell },
  { title: '返回值', dataIndex: 'returnValue', ellipsis: { showTitle: false }, render: ellipsisCell },
  { title: '耗时(ms)', dataIndex: 'costTime', width: 100 },
]

// 日志管理页：拉取全量操作日志，客户端分页展示，提供手动刷新
export default function LogManage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await listLogs()
      setData(res ?? [])
    } catch {
      // 失败提示已由 axios 拦截器统一处理
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- 挂载时拉取日志数据
    load()
  }, [load])

  return (
    <Card
      title="日志管理"
      extra={
        <Button icon={<ReloadOutlined />} onClick={load} loading={loading}>
          刷新
        </Button>
      }
    >
      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={data}
        pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `共 ${t} 条` }}
        scroll={{ x: 'max-content' }}
      />
    </Card>
  )
}
