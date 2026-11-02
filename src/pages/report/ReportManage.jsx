import { Card, Col, Row, Spin } from 'antd'
import ReactECharts from 'echarts-for-react'
import { useCallback, useEffect, useState } from 'react'
import { getClazzNumReport, getDegreeReport, getEmpJobReport, getEmpSexReport } from '../../api/report'

// 报表统计页：员工职位人数/班级人数（柱状图）+ 员工性别占比/学历人数（扇形图）
export default function ReportManage() {
  const [job, setJob] = useState(null)
  const [sex, setSex] = useState(null)
  const [clazzNum, setClazzNum] = useState(null)
  const [degree, setDegree] = useState(null)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [jobRes, sexRes, clazzRes, degreeRes] = await Promise.all([
        getEmpJobReport(),
        getEmpSexReport(),
        getClazzNumReport(),
        getDegreeReport(),
      ])
      setJob(jobRes ?? null)
      setSex(sexRes ?? null)
      setClazzNum(clazzRes ?? null)
      setDegree(degreeRes ?? null)
    } catch {
      // 失败提示已由 axios 拦截器统一处理
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- 挂载时拉取统计数据的标准请求模式
    load()
  }, [load])

  // 职位柱状图配置
  const jobOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: 48, right: 24, top: 24, bottom: 48 },
    xAxis: { type: 'category', data: job?.jobList ?? [], axisLabel: { interval: 0, rotate: 30 } },
    yAxis: { type: 'value', minInterval: 1 },
    series: [
      {
        type: 'bar',
        data: job?.dataList ?? [],
        barMaxWidth: 48,
        itemStyle: { color: '#1677ff', borderRadius: [4, 4, 0, 0] },
        label: { show: true, position: 'top' },
      },
    ],
  }

  // 性别扇形图配置
  const sexOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {c} 人 ({d}%)' },
    legend: { bottom: 0 },
    series: [
      {
        type: 'pie',
        radius: '62%',
        center: ['50%', '45%'],
        data: sex ?? [],
        label: { formatter: '{b}\n{c} 人' },
        emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.3)' } },
      },
    ],
  }

  // 班级人数柱状图（复用职位结构 { jobList, dataList }，jobList 存班级名）
  const clazzNumOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: 48, right: 24, top: 24, bottom: 48 },
    xAxis: { type: 'category', data: clazzNum?.jobList ?? [], axisLabel: { interval: 0, rotate: 30 } },
    yAxis: { type: 'value', minInterval: 1 },
    series: [
      {
        type: 'bar',
        data: clazzNum?.dataList ?? [],
        barMaxWidth: 48,
        itemStyle: { color: '#52c41a', borderRadius: [4, 4, 0, 0] },
        label: { show: true, position: 'top' },
      },
    ],
  }

  // 学历人数扇形图（复用性别结构 [{ name, value }]）
  const degreeOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {c} 人 ({d}%)' },
    legend: { bottom: 0 },
    series: [
      {
        type: 'pie',
        radius: '62%',
        center: ['50%', '45%'],
        data: degree ?? [],
        label: { formatter: '{b}\n{c} 人' },
        emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.3)' } },
      },
    ],
  }

  return (
    <Spin spinning={loading}>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="员工职位人数">
            <ReactECharts option={jobOption} notMerge lazyUpdate style={{ height: 360 }} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="员工性别占比">
            <ReactECharts option={sexOption} notMerge lazyUpdate style={{ height: 360 }} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="班级人数统计">
            <ReactECharts option={clazzNumOption} notMerge lazyUpdate style={{ height: 360 }} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="学历人数统计">
            <ReactECharts option={degreeOption} notMerge lazyUpdate style={{ height: 360 }} />
          </Card>
        </Col>
      </Row>
    </Spin>
  )
}
