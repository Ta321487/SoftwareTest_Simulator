<script setup>
import { ref } from 'vue'

const props = defineProps({
  mode: {
    type: String,
    default: 'apm',
    validator: (v) => ['apm', 'monitor', 'incident', 'overview'].includes(v),
  },
  initialBottleneck: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['bottleneck-identified'])

const selectedNode = ref(props.initialBottleneck ? 'mysql' : null)

const traceNodes = [
  { id: 'nginx', label: 'Nginx', latency: 200, pct: 18 },
  { id: 'gateway', label: 'Gateway', latency: 50, pct: 5 },
  { id: 'order', label: 'Order-Service', latency: 120, pct: 11 },
  { id: 'mysql', label: 'MySQL', latency: 800, pct: 66, bottleneck: true },
]

const metrics = [
  { id: 'a', label: '订单创建接口错误率', value: '2.8%', tone: 'error', hint: '重点监控' },
  { id: 'b', label: '服务器 CPU 负载', value: '78%', tone: 'warn', hint: '重点监控' },
  { id: 'c', label: '订单支付转化率', value: '↓ 12%', tone: 'warn', hint: '重点监控' },
  { id: 'd', label: '列表页按钮圆角', value: '8px', tone: 'neutral', hint: '不是监控重点' },
]

const incidentSteps = [
  { time: '14:02', text: '订单创建 QPS 突增，缓存命中率跌至 12%' },
  { time: '14:05', text: 'Redis 集群雪崩，大量请求穿透到 MySQL' },
  { time: '14:08', text: 'DB 连接池打满，Order-Service 大面积超时' },
  { time: '14:32', text: '服务恢复，累计宕机约 30 分钟（P0）' },
]

function selectNode(id) {
  selectedNode.value = id
  if (id === 'mysql') {
    emit('bottleneck-identified', { node: 'mysql', latency: 800 })
  }
}
</script>

<template>
  <div class="order-obs sim-card">
    <header class="order-obs__header">
      <div>
        <p class="order-obs__brand">
          订单可观测 ·
          {{
            mode === 'apm'
              ? 'APM'
              : mode === 'monitor'
                ? '灰度监控'
                : mode === 'incident'
                  ? '事故时间线'
                  : '项目概览'
          }}
        </p>
        <p class="order-obs__version">order-module · v3.0 灰度</p>
      </div>
      <span class="order-obs__env">测试 / 灰度</span>
    </header>

    <!-- APM 链路 -->
    <div v-if="mode === 'apm'" class="order-obs__apm">
      <p class="order-obs__apm-title">订单创建接口 · P99 = <strong>3.2s</strong></p>
      <div class="order-obs__trace">
        <button
          v-for="node in traceNodes"
          :key="node.id"
          type="button"
          class="order-obs__trace-node"
          :class="{
            'order-obs__trace-node--active': selectedNode === node.id,
            'order-obs__trace-node--hot': node.bottleneck,
          }"
          @click="selectNode(node.id)"
        >
          <span class="order-obs__trace-label">{{ node.label }}</span>
          <span class="order-obs__trace-bar">
            <span class="order-obs__trace-fill" :style="{ width: `${node.pct}%` }" />
          </span>
          <span class="order-obs__trace-ms">{{ node.latency }}ms · {{ node.pct }}%</span>
        </button>
      </div>
      <p v-if="selectedNode === 'mysql'" class="order-obs__status order-obs__status--ok">
        ✓ 已定位：MySQL 占链路 66%，是最慢环节
      </p>
      <p v-else class="order-obs__guide">点击各环节查看耗时占比，找出最慢的一节。</p>
    </div>

    <!-- 灰度监控 -->
    <div v-else-if="mode === 'monitor'" class="order-obs__metrics">
      <p class="order-obs__apm-title">灰度 5% · QPS 1000</p>
      <div class="order-obs__metric-grid">
        <div
          v-for="m in metrics"
          :key="m.id"
          class="order-obs__metric"
          :class="`order-obs__metric--${m.tone}`"
        >
          <p class="order-obs__metric-label">{{ m.label }}</p>
          <p class="order-obs__metric-value">{{ m.value }}</p>
          <p class="order-obs__metric-hint">{{ m.hint }}</p>
        </div>
      </div>
      <p class="order-obs__guide">发布夜优先盯错误率、CPU、转化率——UI 样式不是线上监控项。</p>
    </div>

    <!-- P0 事故 -->
    <div v-else-if="mode === 'incident'" class="order-obs__incident">
      <p class="order-obs__incident-grade">P0 · 缓存雪崩 → 连接池耗尽</p>
      <ol class="order-obs__timeline">
        <li v-for="(step, i) in incidentSteps" :key="i">
          <span class="order-obs__time">{{ step.time }}</span>
          {{ step.text }}
        </li>
      </ol>
      <p class="order-obs__guide">复盘写可落地措施：限流、预热、熔断、连接池扩容、告警阈值等。</p>
    </div>

    <!-- 项目概览 -->
    <div v-else class="order-obs__overview">
      <dl class="order-obs__dl">
        <dt>技术栈</dt>
        <dd>Java + Spring Boot + TestNG</dd>
        <dt>复杂度</dt>
        <dd>订单状态机 · 多子流程</dd>
        <dt>自动化</dt>
        <dd>团队 3 人熟悉 Java，API 层优先</dd>
      </dl>
    </div>
  </div>
</template>
