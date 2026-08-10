<template>
  <div class="bigscreen2-viewport" :style="viewportStyle">
    <div class="bigscreen2" :style="bigscreenInnerStyle">
      <!-- 背景装饰 -->
      <div class="bs2-bg-grid" />
      <div class="bs2-bg-glow bs2-bg-glow-left" />
      <div class="bs2-bg-glow bs2-bg-glow-right" />
      <div class="bs2-scan-line" />

      <!-- 顶部标题 -->
      <div class="bs2-header">
        <div class="bs2-header-left">
          <span class="bs2-tag">INDUSTRIAL · INVESTMENT</span>
        </div>
        <h1 class="bs2-title">
          <span class="bs2-bracket">[</span>
          <span class="bs2-title-text">产业投资进件数据中心</span>
          <span class="bs2-bracket">]</span>
        </h1>
        <div class="bs2-header-right">
          <span class="bs2-time">{{ currentTime }}</span>
          <span class="bs2-week">{{ currentWeek }}</span>
          <span class="bs2-btn" @click="manualRefresh">
            <span class="bs2-btn-icon">⟳</span>刷新
          </span>
          <span class="bs2-btn" @click="exitFullscreen">退出</span>
        </div>
      </div>

      <!-- 主体：三栏布局 -->
      <div class="bs2-body">
        <!-- 左栏 -->
        <div class="bs2-col bs2-col-left">
          <!-- 汇总指标 -->
          <div class="bs2-panel bs2-panel-tall">
            <div class="bs2-panel-title">
              <span class="bs2-title-bar"></span>
              <span>汇总指标</span>
              <span class="bs2-title-en">OVERVIEW</span>
            </div>
            <div class="bs2-overview-grid">
              <div class="ov-item">
                <div class="ov-num cyan">{{ summary.totalEnterprises }}</div>
                <div class="ov-label">企业总数</div>
              </div>
              <div class="ov-item">
                <div class="ov-num green">{{ summary.totalArea.toLocaleString() }}</div>
                <div class="ov-label">入驻总面积 (㎡)</div>
              </div>
              <div class="ov-item">
                <div class="ov-num magenta">{{ summary.landedCount }}</div>
                <div class="ov-label">已落地</div>
              </div>
              <div class="ov-item">
                <div class="ov-num magenta">{{ summary.conversionRate }}%</div>
                <div class="ov-label">转化率</div>
              </div>
              <div class="ov-item">
                <div class="ov-num blue">
                  <span class="ov-arrow">▲</span>+{{ summary.weekNewIntakes || 0 }}
                </div>
                <div class="ov-label">本周新增</div>
              </div>
              <div class="ov-item">
                <div class="ov-num orange">
                  <span class="ov-arrow">▦</span>{{ summary.pendingCount || 0 }}
                </div>
                <div class="ov-label">待处理</div>
              </div>
            </div>
          </div>

          <!-- 状态分布 -->
          <div class="bs2-panel">
            <div class="bs2-panel-title">
              <span class="bs2-title-bar"></span>
              <span>状态分布</span>
              <span class="bs2-title-en">STATUS</span>
            </div>
            <div class="bs2-chart-wrap">
              <v-chart v-if="statusData.length" class="bs2-chart" :option="statusOption" autoresize />
            </div>
          </div>
        </div>

        <!-- 中栏（主地图） -->
        <div class="bs2-col bs2-col-center">
          <div class="bs2-map-panel">
            <div class="bs2-map-header">
              <div class="bs2-map-coord">
                <span>LON: 116.40°E</span>
                <span>LAT: 39.90°N</span>
              </div>
              <div class="bs2-map-status">
                <span class="scan-dot"></span>
                <span>SCAN: ACTIVE</span>
                <span class="live-dot"></span>
                <span>LIVE</span>
              </div>
            </div>
            <div class="bs2-map-area">
              <v-chart
                v-if="chinaMapReady"
                ref="mapChartRef"
                class="bs2-map-chart"
                :option="mapOption"
                autoresize
              />
              <div v-else class="bs2-map-loading">
                <div class="loading-ring"></div>
                <span>地图加载中...</span>
              </div>
            </div>
            <div class="bs2-map-footer">
              <div class="map-foot-item">
                <span class="foot-label">SOURCES:</span>
                <span class="foot-val">{{ summary.totalEnterprises }} RECORDS</span>
              </div>
              <div class="map-foot-item">
                <span class="foot-label">UPDATED:</span>
                <span class="foot-val">{{ currentTime.split(' ')[0] }}</span>
              </div>
              <div class="map-foot-item">
                <span class="foot-label">REGION:</span>
                <span class="foot-val">NATIONWIDE</span>
              </div>
              <div class="map-foot-item">
                <span class="foot-label">ZOOM:</span>
                <span class="foot-val">100%</span>
              </div>
            </div>
          </div>

          <!-- TOP 排行 -->
          <div class="bs2-panel bs2-panel-bottom">
            <div class="bs2-panel-title">
              <span class="bs2-title-bar"></span>
              <span>TOP 企业面积排行</span>
              <span class="bs2-title-en">TOP ENTERPRISE AREA RANKING</span>
            </div>
            <div class="bs2-chart-wrap">
              <v-chart v-if="provinceRanking.length" class="bs2-chart-bar" :option="rankingOption" autoresize />
            </div>
          </div>
        </div>

        <!-- 右栏 -->
        <div class="bs2-col bs2-col-right">
          <!-- 近30天概览 -->
          <div class="bs2-panel">
            <div class="bs2-panel-title">
              <span class="bs2-title-bar"></span>
              <span>近30天概览</span>
              <span class="bs2-title-en">30-DAY OVERVIEW</span>
            </div>
            <div class="bs2-30day-grid">
              <div class="d30-item">
                <div class="d30-num cyan">{{ recent30.created }}</div>
                <div class="d30-label">新增进件</div>
              </div>
              <div class="d30-item">
                <div class="d30-num green">{{ recent30.approved }}</div>
                <div class="d30-label">新增落地</div>
              </div>
              <div class="d30-item">
                <div class="d30-num blue">{{ recent30.visited }}</div>
                <div class="d30-label">拜访次数</div>
              </div>
              <div class="d30-item">
                <div class="d30-num magenta">{{ summary.conversionRate }}%</div>
                <div class="d30-label">整体转化率</div>
              </div>
              <div class="d30-item">
                <div class="d30-num orange">{{ summary.landedCount }}</div>
                <div class="d30-label">累计落地</div>
              </div>
            </div>
          </div>

          <!-- 行业分布 -->
          <div class="bs2-panel">
            <div class="bs2-panel-title">
              <span class="bs2-title-bar"></span>
              <span>行业分布</span>
              <span class="bs2-title-en">INDUSTRY</span>
            </div>
            <div class="bs2-chart-wrap">
              <v-chart v-if="industryData.length" class="bs2-chart-bar-h" :option="industryOption" autoresize />
            </div>
          </div>

          <!-- 实时数据排行 -->
          <div class="bs2-panel bs2-panel-tall">
            <div class="bs2-panel-title">
              <span class="bs2-title-bar"></span>
              <span>实时数据</span>
              <span class="bs2-title-en">REAL-TIME DATA</span>
            </div>
            <div class="bs2-realtime-list">
              <div
                v-for="(item, idx) in provinceRanking"
                :key="item.name"
                class="rt-item"
              >
                <div class="rt-rank" :class="'rank-' + (idx + 1)">{{ String(idx + 1).padStart(2, '0') }}</div>
                <div class="rt-name">{{ item.name }}</div>
                <div class="rt-bar-wrap">
                  <div class="rt-bar" :style="{ width: barWidth(item.value, provinceRanking[0]?.value) + '%' }"></div>
                </div>
                <div class="rt-num">{{ item.value }}</div>
              </div>
              <div v-if="!provinceRanking.length" class="rt-empty">暂无数据</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 30天趋势（底部通栏） -->
      <div class="bs2-footer-panel">
        <div class="bs2-panel-title">
          <span class="bs2-title-bar"></span>
          <span>近30天趋势</span>
          <span class="bs2-title-en">30-DAY TREND</span>
        </div>
        <div class="bs2-chart-wrap bs2-trend-wrap">
          <v-chart v-if="trendData.dates?.length" class="bs2-chart-trend" :option="trendOption" autoresize />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { MapChart, PieChart, BarChart, LineChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  VisualMapComponent,
  GridComponent,
} from 'echarts/components';
import VChart from 'vue-echarts';
import * as echarts from 'echarts/core';
import { BI_DESIGN_WIDTH, BI_DESIGN_HEIGHT, toggleFullscreen } from '@/utils/fullscreen';
import {
  getAllBiData,
  type MapData,
  type StatusItem,
  type TrendData,
  type IndustryItem,
  type Summary,
} from '@/api/modules/bi';

use([
  CanvasRenderer,
  MapChart,
  PieChart,
  BarChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  VisualMapComponent,
  GridComponent,
]);

const router = useRouter();

// ===== 尺寸适配 =====
const BI_V2_WIDTH = 1920;
const BI_V2_HEIGHT = 1080;

const viewportSize = ref({ w: window.innerWidth, h: window.innerHeight });
const scaleMode = ref<'contain' | 'cover'>('contain');

const bigscreenInnerStyle = computed(() => {
  const scale = Math.min(viewportSize.value.w / BI_V2_WIDTH, viewportSize.value.h / BI_V2_HEIGHT);
  return {
    transform: `scale(${scale})`,
    width: BI_V2_WIDTH + 'px',
    height: BI_V2_HEIGHT + 'px',
  };
});

const viewportStyle = computed(() => ({
  width: '100vw',
  height: '100vh',
}));

// ===== 时间 =====
const currentTime = ref('');
const currentWeek = ref('');
let timeTimer: number | null = null;

const weekMap = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

function updateTime() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const h = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  currentTime.value = `${y}-${m}-${d} ${h}:${min}:${s}`;
  currentWeek.value = weekMap[now.getDay()].toUpperCase();
}

// ===== 数据 =====
const chinaMapReady = ref(false);
const mapData = ref<any>({ provinces: [], totals: {} });
const statusData = ref<StatusItem[]>([]);
const trendData = ref<TrendData>({ dates: [], created: [], landed: [] });
const industryData = ref<IndustryItem[]>([]);
const summary = ref<Summary>({
  totalEnterprises: 0,
  totalArea: 0,
  landedCount: 0,
  conversionRate: 0,
  pendingCount: 0,
  weekNewIntakes: 0,
});
const recent30 = ref({ created: 0, approved: 0, visited: 0 });

const provinceRanking = computed(() => {
  return [...mapData.value.provinces]
    .sort((a: any, b: any) => b.enterpriseCount - a.enterpriseCount)
    .slice(0, 10)
    .map((p: any) => ({
      name: p.name.replace(/省|市|自治区|特别行政区/g, ''),
      value: p.enterpriseCount,
      area: p.totalArea,
    }));
});

function barWidth(val: number, max: number) {
  if (!max) return 0;
  return Math.max((val / max) * 100, val > 0 ? 5 : 0);
}

// ===== 地图加载 =====
async function loadChinaMap() {
  if (chinaMapReady.value) return;
  try {
    const res = await fetch('/map/china.json');
    if (!res.ok) throw new Error('地图加载失败');
    const geo = await res.json();
    echarts.registerMap('china', geo);
    chinaMapReady.value = true;
  } catch (e) {
    console.warn('地图加载失败:', e);
  }
}

// ===== 图表配置 =====
const CHART_COLORS = ['#00D9FF', '#00FF9D', '#FFD700', '#FF6B9D', '#A855F7', '#FF9F43', '#54A0FF', '#5F27CD', '#00CEC9', '#FD79A8'];

const mapOption = computed(() => {
  const data = mapData.value.provinces.map((p: any) => ({
    name: p.name,
    value: p.enterpriseCount,
  }));
  const maxVal = Math.max(...data.map((d: any) => d.value), 10);
  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(10, 14, 39, 0.9)',
      borderColor: '#00D9FF',
      textStyle: { color: '#fff', fontSize: 12 },
      formatter: (p: any) => {
        const d = mapData.value.provinces.find((x: any) => x.name === p.name);
        if (!d) return p.name;
        return `<b>${p.name}</b><br/>企业数: ${d.enterpriseCount}<br/>总面积: ${d.totalArea} ㎡<br/>已落地: ${d.landedCount}`;
      },
    },
    visualMap: {
      show: true,
      left: 30,
      bottom: 40,
      orient: 'vertical',
      min: 0,
      max: maxVal,
      text: ['高', '低'],
      textStyle: { color: '#8899BB', fontSize: 11 },
      inRange: {
        color: ['#0A1628', '#0D3B5C', '#0A6E8C', '#00D9FF', '#00FF9D'],
      },
      itemWidth: 14,
      itemHeight: 120,
    },
    series: [
      {
        name: '企业分布',
        type: 'map',
        map: 'china',
        roam: false,
        zoom: 1.2,
        label: {
          show: true,
          color: '#AABBCC',
          fontSize: 9,
        },
        emphasis: {
          label: { color: '#fff', fontWeight: 'bold' },
          itemStyle: {
            areaColor: '#00D9FF',
            shadowBlur: 20,
            shadowColor: '#00D9FF',
          },
        },
        itemStyle: {
          borderColor: '#1A3A5C',
          borderWidth: 0.8,
          areaColor: '#0A1628',
        },
        data,
      },
    ],
  };
});

const statusOption = computed(() => ({
  backgroundColor: 'transparent',
  tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
  legend: {
    bottom: 0,
    textStyle: { color: '#8899BB', fontSize: 11 },
    itemWidth: 10,
    itemHeight: 10,
  },
  series: [
    {
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['50%', '42%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderColor: '#0A0E27',
        borderWidth: 2,
      },
      label: { show: false },
      emphasis: {
        label: { show: true, color: '#fff', fontSize: 12, fontWeight: 'bold' },
      },
      data: statusData.value.map((s, i) => ({
        name: s.name,
        value: s.value,
        itemStyle: { color: CHART_COLORS[i % CHART_COLORS.length] },
      })),
    },
  ],
}));

const industryOption = computed(() => {
  const top = industryData.value.slice(0, 6).reverse();
  return {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 70, right: 20, top: 10, bottom: 10 },
    xAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#667799', fontSize: 10 },
      splitLine: { lineStyle: { color: 'rgba(0, 217, 255, 0.08)' } },
    },
    yAxis: {
      type: 'category',
      data: top.map((i) => i.name),
      axisLine: { lineStyle: { color: '#1A2A4A' } },
      axisTick: { show: false },
      axisLabel: { color: '#AABBCC', fontSize: 11 },
    },
    series: [
      {
        type: 'bar',
        data: top.map((i, idx) => ({
          value: i.value,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: 'rgba(0, 217, 255, 0.1)' },
              { offset: 1, color: CHART_COLORS[idx % CHART_COLORS.length] },
            ]),
          },
        })),
        barWidth: 12,
        label: {
          show: true,
          position: 'right',
          color: '#00D9FF',
          fontSize: 10,
        },
      },
    ],
  };
});

const rankingOption = computed(() => {
  const data = provinceRanking.value;
  return {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 50, right: 20, top: 15, bottom: 20 },
    xAxis: {
      type: 'category',
      data: data.map((d) => d.name),
      axisLine: { lineStyle: { color: '#1A2A4A' } },
      axisTick: { show: false },
      axisLabel: { color: '#AABBCC', fontSize: 10, interval: 0 },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#667799', fontSize: 10 },
      splitLine: { lineStyle: { color: 'rgba(0, 217, 255, 0.08)' } },
    },
    series: [
      {
        type: 'bar',
        data: data.map((d, i) => ({
          value: d.value,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: CHART_COLORS[i % CHART_COLORS.length] },
              { offset: 1, color: 'rgba(0, 217, 255, 0.2)' },
            ]),
            borderRadius: [4, 4, 0, 0],
          },
        })),
        barWidth: 18,
        label: {
          show: true,
          position: 'top',
          color: '#fff',
          fontSize: 10,
        },
      },
    ],
  };
});

const trendOption = computed(() => ({
  backgroundColor: 'transparent',
  tooltip: { trigger: 'axis' },
  legend: {
    right: 20,
    top: 0,
    textStyle: { color: '#8899BB', fontSize: 11 },
    data: ['新增进件', '新落地'],
  },
  grid: { left: 40, right: 20, top: 35, bottom: 25 },
  xAxis: {
    type: 'category',
    data: trendData.value.dates.map((d) => d.slice(5)),
    axisLine: { lineStyle: { color: '#1A2A4A' } },
    axisTick: { show: false },
    axisLabel: { color: '#667799', fontSize: 10, interval: 4 },
  },
  yAxis: {
    type: 'value',
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: '#667799', fontSize: 10 },
    splitLine: { lineStyle: { color: 'rgba(0, 217, 255, 0.08)' } },
  },
  series: [
    {
      name: '新增进件',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { color: '#00D9FF', width: 2 },
      itemStyle: { color: '#00D9FF' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(0, 217, 255, 0.3)' },
          { offset: 1, color: 'rgba(0, 217, 255, 0)' },
        ]),
      },
      data: trendData.value.created,
    },
    {
      name: '新落地',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { color: '#FF6B9D', width: 2 },
      itemStyle: { color: '#FF6B9D' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(255, 107, 157, 0.3)' },
          { offset: 1, color: 'rgba(255, 107, 157, 0)' },
        ]),
      },
      data: trendData.value.landed,
    },
  ],
}));

// ===== 数据加载 =====
async function fetchAll() {
  try {
    const data = await getAllBiData();
    if (!data) return;

    mapData.value = {
      provinces: data.provinces || [],
      totals: data.totals || {},
    };
    statusData.value = data.statusDistribution || [];
    trendData.value = data.trend || { dates: [], created: [], landed: [] };
    industryData.value = data.industryDistribution || [];
    summary.value = data.summary || {
      totalEnterprises: 0,
      totalArea: 0,
      landedCount: 0,
      conversionRate: 0,
      pendingCount: 0,
      weekNewIntakes: 0,
    };
    recent30.value = data.recent30days || { created: 0, approved: 0, visited: 0 };
  } catch (e) {
    console.error('数据加载失败:', e);
  }
}

function manualRefresh() {
  fetchAll();
}

function exitFullscreen() {
  router.push('/pc/dashboard');
}

// ===== 生命周期 =====
let resizeHandler: (() => void) | null = null;
let refreshTimer: number | null = null;

onMounted(() => {
  updateTime();
  timeTimer = window.setInterval(updateTime, 1000);

  resizeHandler = () => {
    viewportSize.value = { w: window.innerWidth, h: window.innerHeight };
  };
  window.addEventListener('resize', resizeHandler);

  // 🚀 并行加载：地图和数据同时请求，数据先到先渲染
  loadChinaMap();
  fetchAll().then(() => {
    refreshTimer = window.setInterval(fetchAll, 60000);
  });
});

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer);
  if (timeTimer) clearInterval(timeTimer);
  if (resizeHandler) window.removeEventListener('resize', resizeHandler);
});
</script>

<style scoped>
.bigscreen2-viewport {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #0A0E27;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bigscreen2 {
  position: relative;
  transform-origin: center center;
  background: radial-gradient(ellipse at center, #0D1530 0%, #0A0E27 60%, #070A1A 100%);
  color: #fff;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  overflow: hidden;
}

/* 背景装饰 */
.bs2-bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(0, 217, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 217, 255, 0.03) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
}

.bs2-bg-glow {
  position: absolute;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.15;
  pointer-events: none;
}

.bs2-bg-glow-left {
  top: -200px;
  left: -200px;
  background: #00D9FF;
}

.bs2-bg-glow-right {
  bottom: -200px;
  right: -200px;
  background: #FF6B9D;
}

.bs2-scan-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(0, 217, 255, 0.4), transparent);
  animation: scan 4s linear infinite;
  pointer-events: none;
}

@keyframes scan {
  0% { top: 0; }
  100% { top: 100%; }
}

/* 顶部 */
.bs2-header {
  position: relative;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  border-bottom: 1px solid rgba(0, 217, 255, 0.15);
  background: linear-gradient(180deg, rgba(0, 217, 255, 0.05) 0%, transparent 100%);
}

.bs2-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  margin: 0;
  font-size: 30px;
  font-weight: 700;
  letter-spacing: 8px;
  background: linear-gradient(180deg, #FFFFFF 0%, #00D9FF 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 30px rgba(0, 217, 255, 0.3);
}

.bs2-bracket {
  color: #00D9FF;
  -webkit-text-fill-color: #00D9FF;
  margin: 0 8px;
  font-weight: 400;
}

.bs2-header-left,
.bs2-header-right {
  display: flex;
  align-items: center;
  gap: 20px;
  min-width: 400px;
}

.bs2-header-right {
  justify-content: flex-end;
}

.bs2-tag {
  color: #00D9FF;
  font-size: 13px;
  letter-spacing: 3px;
  opacity: 0.8;
}

.bs2-time,
.bs2-week {
  color: #8899BB;
  font-size: 13px;
  font-family: 'Consolas', monospace;
}

.bs2-btn {
  padding: 5px 14px;
  border: 1px solid rgba(0, 217, 255, 0.3);
  border-radius: 4px;
  color: #AABBCC;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.bs2-btn:hover {
  background: rgba(0, 217, 255, 0.1);
  border-color: #00D9FF;
  color: #00D9FF;
}

.bs2-btn-icon {
  margin-right: 4px;
  display: inline-block;
}

/* 主体 */
.bs2-body {
  position: absolute;
  top: 80px;
  bottom: 200px;
  left: 20px;
  right: 20px;
  display: grid;
  grid-template-columns: 380px 1fr 380px;
  gap: 16px;
}

.bs2-col {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.bs2-col-center {
  gap: 16px;
}

/* 面板 */
.bs2-panel {
  position: relative;
  background: linear-gradient(180deg, rgba(0, 217, 255, 0.04) 0%, rgba(0, 217, 255, 0.01) 100%);
  border: 1px solid rgba(0, 217, 255, 0.2);
  padding: 12px 16px;
  flex: 1;
  min-height: 0;
}

.bs2-panel::before,
.bs2-panel::after {
  content: '';
  position: absolute;
  width: 14px;
  height: 14px;
  border: 2px solid #00D9FF;
}

.bs2-panel::before {
  top: -1px;
  left: -1px;
  border-right: none;
  border-bottom: none;
}

.bs2-panel::after {
  bottom: -1px;
  right: -1px;
  border-left: none;
  border-top: none;
}

.bs2-panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 217, 255, 0.1);
}

.bs2-title-bar {
  width: 4px;
  height: 16px;
  background: linear-gradient(180deg, #00D9FF, transparent);
}

.bs2-panel-title span:nth-child(2) {
  font-size: 15px;
  font-weight: 600;
  color: #fff;
}

.bs2-title-en {
  margin-left: auto;
  font-size: 10px;
  color: #445577;
  letter-spacing: 1px;
}

/* 汇总指标 */
.bs2-overview-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.ov-item {
  text-align: center;
  padding: 10px 6px;
  background: rgba(0, 217, 255, 0.05);
  border: 1px solid rgba(0, 217, 255, 0.1);
  border-radius: 4px;
}

.ov-num {
  font-size: 24px;
  font-weight: 700;
  font-family: 'Consolas', 'DIN', monospace;
  margin-bottom: 4px;
}

.ov-num.cyan { color: #00D9FF; text-shadow: 0 0 10px rgba(0, 217, 255, 0.5); }
.ov-num.green { color: #00FF9D; text-shadow: 0 0 10px rgba(0, 255, 157, 0.5); }
.ov-num.magenta { color: #FF6B9D; text-shadow: 0 0 10px rgba(255, 107, 157, 0.5); }
.ov-num.blue { color: #54A0FF; }
.ov-num.orange { color: #FFD700; }

.ov-arrow {
  font-size: 14px;
  margin-right: 2px;
}

.ov-label {
  font-size: 11px;
  color: #8899BB;
}

/* 图表通用 */
.bs2-chart-wrap {
  width: 100%;
  height: calc(100% - 40px);
}

.bs2-chart {
  width: 100%;
  height: 100%;
}

.bs2-chart-bar-h {
  width: 100%;
  height: 100%;
}

/* 地图面板 */
.bs2-map-panel {
  position: relative;
  flex: 2;
  min-height: 0;
  background: radial-gradient(ellipse at center, rgba(0, 217, 255, 0.06) 0%, transparent 70%);
  border: 1px solid rgba(0, 217, 255, 0.2);
  padding: 10px;
  display: flex;
  flex-direction: column;
}

.bs2-map-panel::before,
.bs2-map-panel::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  border: 2px solid #00D9FF;
}

.bs2-map-panel::before {
  top: -1px;
  left: -1px;
  border-right: none;
  border-bottom: none;
}

.bs2-map-panel::after {
  bottom: -1px;
  right: -1px;
  border-left: none;
  border-top: none;
}

.bs2-map-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 12px;
  font-size: 11px;
  color: #667799;
  font-family: 'Consolas', monospace;
}

.bs2-map-coord {
  display: flex;
  gap: 16px;
}

.bs2-map-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.scan-dot, .live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.scan-dot {
  background: #00D9FF;
  animation: blink 1.5s ease-in-out infinite;
}

.live-dot {
  background: #FF4444;
  animation: blink 1s ease-in-out infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.bs2-map-area {
  flex: 1;
  position: relative;
}

.bs2-map-chart {
  width: 100%;
  height: 100%;
}

.bs2-map-loading {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: #667799;
  font-size: 14px;
}

.loading-ring {
  width: 40px;
  height: 40px;
  border: 2px solid rgba(0, 217, 255, 0.1);
  border-top-color: #00D9FF;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.bs2-map-footer {
  display: flex;
  justify-content: space-around;
  padding: 8px 20px;
  border-top: 1px solid rgba(0, 217, 255, 0.1);
  font-size: 10px;
  font-family: 'Consolas', monospace;
}

.map-foot-item {
  display: flex;
  gap: 6px;
  align-items: center;
}

.foot-label {
  color: #556688;
}

.foot-val {
  color: #00D9FF;
}

/* 底部排行面板 */
.bs2-panel-bottom {
  flex: 1;
}

.bs2-chart-bar {
  width: 100%;
  height: 100%;
}

/* 30天概览 */
.bs2-30day-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 4px 0;
}

.d30-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: rgba(0, 217, 255, 0.04);
  border-radius: 4px;
}

.d30-num {
  font-size: 20px;
  font-weight: 700;
  font-family: 'Consolas', monospace;
}

.d30-num.cyan { color: #00D9FF; }
.d30-num.green { color: #00FF9D; }
.d30-num.blue { color: #54A0FF; }
.d30-num.magenta { color: #FF6B9D; }
.d30-num.orange { color: #FFD700; }

.d30-label {
  font-size: 12px;
  color: #8899BB;
}

/* 实时数据排行 */
.bs2-realtime-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px 0;
  max-height: 100%;
  overflow: hidden;
}

.rt-item {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 28px;
}

.rt-rank {
  width: 28px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  font-family: 'Consolas', monospace;
  border-radius: 3px;
  flex-shrink: 0;
}

.rank-01 { background: linear-gradient(135deg, #FF6B9D, #FF4444); color: #fff; }
.rank-02 { background: linear-gradient(135deg, #FFD700, #FFA500); color: #0A0E27; }
.rank-03 { background: linear-gradient(135deg, #00D9FF, #54A0FF); color: #fff; }
.rank-04, .rank-05, .rank-06, .rank-07, .rank-08, .rank-09, .rank-10 {
  background: rgba(0, 217, 255, 0.1);
  color: #8899BB;
  border: 1px solid rgba(0, 217, 255, 0.2);
}

.rt-name {
  width: 70px;
  font-size: 12px;
  color: #AABBCC;
  flex-shrink: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rt-bar-wrap {
  flex: 1;
  height: 6px;
  background: rgba(0, 217, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.rt-bar {
  height: 100%;
  background: linear-gradient(90deg, #00D9FF, #00FF9D);
  border-radius: 3px;
  transition: width 0.8s ease;
}

.rt-num {
  width: 30px;
  text-align: right;
  font-size: 12px;
  font-weight: 600;
  color: #00D9FF;
  font-family: 'Consolas', monospace;
  flex-shrink: 0;
}

.rt-empty {
  text-align: center;
  color: #556688;
  font-size: 13px;
  padding: 20px 0;
}

/* 底部趋势通栏 */
.bs2-footer-panel {
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
  height: 170px;
  background: linear-gradient(180deg, rgba(0, 217, 255, 0.04) 0%, rgba(0, 217, 255, 0.01) 100%);
  border: 1px solid rgba(0, 217, 255, 0.2);
  padding: 10px 16px;
}

.bs2-footer-panel::before,
.bs2-footer-panel::after {
  content: '';
  position: absolute;
  width: 14px;
  height: 14px;
  border: 2px solid #00D9FF;
}

.bs2-footer-panel::before {
  top: -1px;
  left: -1px;
  border-right: none;
  border-bottom: none;
}

.bs2-footer-panel::after {
  bottom: -1px;
  right: -1px;
  border-left: none;
  border-top: none;
}

.bs2-trend-wrap {
  height: calc(100% - 36px);
}

.bs2-chart-trend {
  width: 100%;
  height: 100%;
}
</style>
