<template>
  <div class="mobile-bi">
    <van-nav-bar title="数据概览" left-text="返回" left-arrow @click-left="goBack" />

    <div class="bi-scroll">
      <div class="summary-grid">
        <div class="summary-item" @click="$emit('nav', 'intakes')">
          <div class="summary-icon icon-blue">
            <van-icon name="apps-o" />
          </div>
          <div class="summary-num">{{ summary.totalEnterprises }}</div>
          <div class="summary-label">企业总数</div>
        </div>
        <div class="summary-item">
          <div class="summary-icon icon-green">
            <van-icon name="chart-trending-o" />
          </div>
          <div class="summary-num">{{ formatArea(summary.totalArea) }}</div>
          <div class="summary-label">总面积(㎡)</div>
        </div>
        <div class="summary-item" @click="$emit('nav', 'landed')">
          <div class="summary-icon icon-yellow">
            <van-icon name="passed" />
          </div>
          <div class="summary-num">{{ summary.landedCount }}</div>
          <div class="summary-label">已落地</div>
        </div>
        <div class="summary-item">
          <div class="summary-icon icon-purple">
            <van-icon name="bar-chart-o" />
          </div>
          <div class="summary-num">{{ summary.conversionRate }}%</div>
          <div class="summary-label">转化率</div>
        </div>
      </div>

      <div class="mini-row">
        <div class="mini-card mini-card-half">
          <div class="mini-header">
            <span class="mini-title">本周新增</span>
          </div>
          <div class="mini-big-num">{{ summary.weekNewIntakes }}</div>
          <div class="mini-sub">近7天新增进件</div>
        </div>
        <div class="mini-card mini-card-half">
          <div class="mini-header">
            <span class="mini-title">跟进中</span>
          </div>
          <div class="mini-big-num pending">{{ summary.pendingCount }}</div>
          <div class="mini-sub">待处理事项</div>
        </div>
      </div>

      <div class="chart-card">
        <div class="chart-title">状态分布</div>
        <v-chart class="mini-chart" :option="statusOption" autoresize />
      </div>

      <div class="chart-card">
        <div class="chart-title">近7天趋势</div>
        <v-chart class="mini-chart" :option="trendOption" autoresize />
      </div>

      <div class="chart-card">
        <div class="chart-title">行业 TOP 5</div>
        <v-chart class="mini-chart" :option="industryOption" autoresize />
      </div>

      <div class="chart-card">
        <div class="chart-title">近30天概览</div>
        <div class="recent-row">
          <div class="recent-item">
            <span class="recent-num">{{ mapData.recent30days?.created ?? 0 }}</span>
            <span class="recent-label">新增进件</span>
          </div>
          <div class="recent-item">
            <span class="recent-num">{{ mapData.recent30days?.approved ?? 0 }}</span>
            <span class="recent-label">新落地</span>
          </div>
          <div class="recent-item">
            <span class="recent-num">{{ mapData.recent30days?.visited ?? 0 }}</span>
            <span class="recent-label">拜访次数</span>
          </div>
        </div>
      </div>

      <div class="chart-card last-card">
        <div class="chart-title">全国热点省份</div>
        <div class="province-list">
          <div
            v-for="(p, idx) in topProvinces"
            :key="p.name"
            class="province-item"
          >
            <span class="rank" :class="`rank-${idx + 1}`">{{ idx + 1 }}</span>
            <span class="name">{{ p.name }}</span>
            <span class="val">{{ p.enterpriseCount }} 家</span>
          </div>
          <div v-if="topProvinces.length === 0" class="empty-tip">暂无数据</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { PieChart, LineChart, BarChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components';
import VChart from 'vue-echarts';
import * as echarts from 'echarts/core';
import {
  getMapData,
  getStatusDistribution,
  getTrendData,
  getIndustryDistribution,
  getSummary,
  type MapData,
  type StatusItem,
  type TrendData,
  type IndustryItem,
  type Summary,
} from '@/api/modules/bi';

use([
  CanvasRenderer,
  PieChart,
  LineChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
]);

defineEmits<{
  (e: 'nav', target: string): void;
}>();

const summary = ref<Summary>({ totalEnterprises: 0, totalArea: 0, landedCount: 0, conversionRate: 0, pendingCount: 0, weekNewIntakes: 0 });
const mapData = ref<MapData>({ provinces: [], totals: { totalEnterprises: 0, totalArea: 0, totalLanded: 0, conversionRate: 0 }, recent30days: { created: 0, approved: 0, visited: 0 } });
const statusData = ref<StatusItem[]>([]);
const trendData = ref<TrendData>({ dates: [], created: [], landed: [] });
const industryData = ref<IndustryItem[]>([]);

const formatArea = (v: number) => {
  if (v >= 10000) return (v / 10000).toFixed(1) + '万';
  return String(v);
};

const topProvinces = computed(() => {
  return [...mapData.value.provinces]
    .sort((a, b) => b.enterpriseCount - a.enterpriseCount)
    .slice(0, 5);
});

const statusOption = computed(() => ({
  tooltip: { trigger: 'item', fontSize: 12 },
  legend: {
    orient: 'horizontal',
    bottom: 0,
    textStyle: { fontSize: 10, color: '#999' },
    itemWidth: 8,
    itemHeight: 8,
  },
  color: ['#00d4ff', '#4ecca3', '#ffd93d', '#ff6b6b', '#a78bfa', '#f472b6', '#94a3b8'],
  series: [
    {
      type: 'pie',
      radius: ['35%', '60%'],
      center: ['50%', '45%'],
      label: { show: false },
      data: statusData.value,
    },
  ],
}));

const trendOption = computed(() => {
  const dates = trendData.value.dates;
  const last7 = dates.length > 7 ? dates.slice(-7) : dates;
  const created = trendData.value.created.slice(-last7.length);
  const landed = trendData.value.landed.slice(-last7.length);
  const shortLabels = last7.map((d) => d.slice(5));
  return {
    tooltip: { trigger: 'axis', fontSize: 11 },
    legend: { data: ['新增', '落地'], textStyle: { fontSize: 10 }, top: 0 },
    grid: { left: 30, right: 10, top: 25, bottom: 20 },
    xAxis: {
      type: 'category',
      data: shortLabels,
      axisLabel: { fontSize: 10, color: '#999' },
      axisLine: { lineStyle: { color: '#eee' } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { fontSize: 10, color: '#999' },
      splitLine: { lineStyle: { color: '#f0f0f0' } },
    },
    series: [
      {
        name: '新增',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 5,
        data: created,
        itemStyle: { color: '#00d4ff' },
        lineStyle: { width: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0,212,255,0.3)' },
            { offset: 1, color: 'rgba(0,212,255,0)' },
          ]),
        },
      },
      {
        name: '落地',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 5,
        data: landed,
        itemStyle: { color: '#ff6b6b' },
        lineStyle: { width: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(255,107,107,0.3)' },
            { offset: 1, color: 'rgba(255,107,107,0)' },
          ]),
        },
      },
    ],
  };
});

const industryOption = computed(() => {
  const top = industryData.value.slice(0, 5);
  return {
    tooltip: { trigger: 'axis', fontSize: 11, axisPointer: { type: 'shadow' } },
    grid: { left: 80, right: 10, top: 10, bottom: 10 },
    xAxis: {
      type: 'value',
      axisLabel: { fontSize: 10, color: '#999' },
      splitLine: { lineStyle: { color: '#f0f0f0' } },
    },
    yAxis: {
      type: 'category',
      data: top.map((i) => i.name).reverse(),
      axisLabel: { fontSize: 11, color: '#333' },
    },
    series: [
      {
        type: 'bar',
        data: top.map((i) => i.value).reverse(),
        barWidth: 14,
        itemStyle: {
          borderRadius: [0, 4, 4, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#00d4ff' },
            { offset: 1, color: '#4ecca3' },
          ]),
        },
      },
    ],
  };
});

const goBack = () => {
  window.history.back();
};

const fetchAll = async () => {
  try {
    const [map, sts, tr, ind, sum] = await Promise.all([
      getMapData().catch(() => null),
      getStatusDistribution().catch(() => []),
      getTrendData(30).catch(() => ({ dates: [], created: [], landed: [] })),
      getIndustryDistribution().catch(() => []),
      getSummary().catch(() => null),
    ]);
    if (map) mapData.value = map;
    statusData.value = sts || [];
    trendData.value = tr || { dates: [], created: [], landed: [] };
    industryData.value = ind || [];
    if (sum) summary.value = sum;
  } catch {
  }
};

let timer: ReturnType<typeof setInterval> | null = null;

onMounted(async () => {
  await fetchAll();
  timer = setInterval(fetchAll, 60000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<style scoped>
.mobile-bi {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 20px;
}

.bi-scroll {
  padding: 12px;
}

.summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 12px;
}

.summary-item {
  background: #fff;
  border-radius: 10px;
  padding: 14px 10px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.summary-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 8px;
  font-size: 20px;
  color: #fff;
}

.icon-blue { background: linear-gradient(135deg, #00d4ff, #0ea5e9); }
.icon-green { background: linear-gradient(135deg, #4ecca3, #22c55e); }
.icon-yellow { background: linear-gradient(135deg, #ffd93d, #f97316); }
.icon-purple { background: linear-gradient(135deg, #a78bfa, #8b5cf6); }

.summary-num {
  font-size: 22px;
  font-weight: bold;
  color: #1a1a2e;
  font-family: 'Consolas', monospace;
}

.summary-label {
  font-size: 12px;
  color: #888;
  margin-top: 2px;
}

.mini-row {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}

.mini-card {
  background: #fff;
  border-radius: 10px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.mini-card-half { flex: 1; }

.mini-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.mini-title {
  font-size: 12px;
  color: #888;
}

.mini-big-num {
  font-size: 26px;
  font-weight: bold;
  color: #00d4ff;
  font-family: 'Consolas', monospace;
}

.mini-big-num.pending { color: #ffd93d; }

.mini-sub {
  font-size: 11px;
  color: #bbb;
  margin-top: 4px;
}

.chart-card {
  background: #fff;
  border-radius: 10px;
  padding: 12px 12px 6px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.chart-title {
  font-size: 14px;
  font-weight: bold;
  color: #1a1a2e;
  margin-bottom: 6px;
  padding-left: 8px;
  border-left: 3px solid #00d4ff;
}

.mini-chart {
  height: 180px;
  width: 100%;
}

.recent-row {
  display: flex;
  padding: 8px 0;
}

.recent-item {
  flex: 1;
  text-align: center;
  border-right: 1px solid #f0f0f0;
}

.recent-item:last-child { border-right: none; }

.recent-num {
  display: block;
  font-size: 22px;
  font-weight: bold;
  color: #00d4ff;
  font-family: 'Consolas', monospace;
}

.recent-label {
  font-size: 11px;
  color: #888;
}

.province-list {
  padding: 4px 0;
}

.province-item {
  display: flex;
  align-items: center;
  padding: 10px 6px;
  border-bottom: 1px solid #f5f5f5;
  gap: 10px;
}

.province-item:last-child { border-bottom: none; }

.rank {
  width: 22px;
  height: 22px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  background: #e0e7ff;
  color: #4f46e5;
}

.rank-1 { background: #fee2e2; color: #ef4444; }
.rank-2 { background: #fef3c7; color: #f59e0b; }
.rank-3 { background: #d1fae5; color: #10b981; }

.name {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.val {
  font-size: 13px;
  color: #00d4ff;
  font-weight: bold;
}

.empty-tip {
  text-align: center;
  padding: 20px;
  color: #bbb;
  font-size: 13px;
}

.last-card { margin-bottom: 0; }
</style>
