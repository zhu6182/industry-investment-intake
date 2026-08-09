<template>
  <div class="bigscreen-viewport" :style="viewportStyle">
    <div class="bigscreen" :style="bigscreenInnerStyle">
      <div class="bs-bg-grid" />
      <div class="bs-bg-glow bs-bg-glow-1" />
      <div class="bs-bg-glow bs-bg-glow-2" />
      <div class="bs-scan-line" />

      <div class="bs-header">
        <div class="bs-header-deco left">
          <div class="deco-segment" />
          <div class="deco-segment thin" />
          <div class="deco-dot" />
        </div>
        <div class="bs-header-side bs-header-side-left">
          <div class="bs-side-line" />
          <span class="bs-side-label">INDUSTRIAL · INVESTMENT</span>
          <div class="bs-side-line bs-side-line-dim" />
        </div>
        <h1 class="bs-title">
          <span class="bs-title-tag">DATA</span>
          <span class="bs-title-text">产业投资进件数据中心</span>
          <span class="bs-title-tag">CENTER</span>
        </h1>
        <div class="bs-header-side bs-header-side-right">
          <div class="bs-side-line bs-side-line-dim" />
          <span class="bs-side-label bs-side-label-right">{{ currentTime }} · {{ currentWeek }}</span>
          <div class="bs-side-line" />
        </div>
        <div class="bs-header-deco right">
          <div class="deco-dot" />
          <div class="deco-segment thin" />
          <div class="deco-segment" />
        </div>
        <div class="bs-header-info">
          <span class="bs-refresh" @click="manualRefresh">
            <span class="refresh-dot" />刷新
          </span>
          <span class="bs-mode" :title="scaleMode === 'contain' ? '当前：等比完整 (有黑边)' : '当前：等比撑满 (裁剪)'" @click="toggleScaleMode">
            {{ scaleMode === 'contain' ? '▢' : '▣' }}
          </span>
          <span class="bs-fs" @click="toggleFullscreenMode" :title="isFs ? '退出全屏' : '进入全屏'">
            {{ isFs ? '⊟' : '⛶' }}
          </span>
          <span class="bs-exit" @click="exitFullscreen">退出</span>
        </div>
      </div>

      <div class="bs-body">
        <div class="bs-col bs-left">
          <div class="bs-panel">
            <PanelCorners />
            <div class="bs-panel-title">
              <span class="title-bar" />
              <span>汇总指标</span>
              <span class="title-en">OVERVIEW</span>
            </div>
            <div class="bs-summary">
              <div class="summary-item">
                <div class="summary-num"><FlipNumber :value="summary.totalEnterprises" /></div>
                <div class="summary-label">进件总数</div>
                <div class="stat-bar"><div class="stat-bar-fill" :style="{ width: '78%' }" /></div>
              </div>
              <div class="summary-item">
                <div class="summary-num"><FlipNumber :value="summary.totalArea" /></div>
                <div class="summary-label">需求总面积(㎡)</div>
                <div class="stat-bar"><div class="stat-bar-fill" :style="{ width: '92%' }" /></div>
              </div>
              <div class="summary-item">
                <div class="summary-num"><FlipNumber :value="summary.landedCount" /></div>
                <div class="summary-label">已落地</div>
                <div class="stat-bar"><div class="stat-bar-fill" :style="{ width: '45%' }" /></div>
              </div>
              <div class="summary-item">
                <div class="summary-num">{{ summary.conversionRate }}%</div>
                <div class="summary-label">转化率</div>
                <div class="stat-bar"><div class="stat-bar-fill" :style="{ width: '60%' }" /></div>
              </div>
            </div>
          </div>

          <div class="bs-panel">
            <PanelCorners />
            <div class="bs-panel-title">
              <span class="title-bar" />
              <span>行业分布</span>
              <span class="title-en">INDUSTRY</span>
            </div>
            <v-chart class="bs-chart" :option="industryOption" autoresize />
          </div>
        </div>

        <div class="bs-col bs-center">
          <div class="bs-panel bs-map-panel">
            <PanelCorners />
            <div class="bs-panel-title">
              <span class="title-bar" />
              <span v-if="currentMapLevel === 'china'">全国分布</span>
              <span v-else>{{ currentProvince?.name }} · 城市分布</span>
              <span class="title-en">MAP</span>
              <span v-if="currentMapLevel === 'province'" class="bs-back" @click="backToChinaMap">
                ← 返回全国
              </span>
            </div>
            <div class="bs-map" v-loading="loadingMap">
              <v-chart
                v-if="chinaMapReady"
                ref="mapChartRef"
                class="bs-map-chart"
                :option="mapOption"
                @click="handleMapClick"
                autoresize
              />
              <div v-else class="bs-map-loading">地图加载中...</div>
            </div>
          </div>
        </div>

        <div class="bs-col bs-right">
          <div class="bs-panel">
            <PanelCorners />
            <div class="bs-panel-title">
              <span class="title-bar" />
              <span>状态分布</span>
              <span class="title-en">STATUS</span>
            </div>
            <v-chart class="bs-chart" :option="statusOption" autoresize />
          </div>

          <div class="bs-panel">
            <PanelCorners />
            <div class="bs-panel-title">
              <span class="title-bar" />
              <span>{{ currentMapLevel === 'china' ? '省份 TOP 10' : currentProvince?.name + ' TOP 10' }}</span>
              <span class="title-en">RANKING</span>
            </div>
            <div class="ranking-list">
              <div
                v-for="(prov, idx) in topProvinces"
                :key="prov.name"
                class="rank-item"
              >
                <span class="rank-no" :class="'rank-no-' + (idx + 1)">{{ idx + 1 }}</span>
                <span class="rt-name">{{ prov.name }}</span>
                <span class="rt-bar-wrap">
                  <span class="rt-bar" :style="{ width: barWidth(prov.enterpriseCount) + '%' }" />
                </span>
                <span class="rt-val">{{ prov.enterpriseCount }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { MapChart, PieChart, BarChart, LineChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  VisualMapComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent,
} from 'echarts/components';
import VChart from 'vue-echarts';
import * as echarts from 'echarts/core';
import {
  getMapData,
  getCityData,
  getStatusDistribution,
  getTrendData,
  getIndustryDistribution,
  getSummary,
  type MapData,
  type CityData,
  type StatusItem,
  type TrendData,
  type IndustryItem,
  type Summary,
} from '@/api/modules/bi';
import PanelCorners from './BigScreenParts/PanelCorners.vue';
import FlipNumber from './BigScreenParts/FlipNumber.vue';
import { BI_DESIGN_WIDTH, BI_DESIGN_HEIGHT, toggleFullscreen } from '@/utils/fullscreen';

use([
  CanvasRenderer,
  MapChart,
  PieChart,
  BarChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  VisualMapComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent,
]);

const DESIGN_W = BI_DESIGN_WIDTH;
const DESIGN_H = BI_DESIGN_HEIGHT;

const currentTime = ref('');
const currentWeek = ref('');
const router = useRouter();
const mapData = ref<MapData>({
  provinces: [],
  totals: { totalEnterprises: 0, totalArea: 0, totalLanded: 0, conversionRate: 0 },
  recent30days: { created: 0, approved: 0, visited: 0 },
});
const summary = ref<Summary>({
  totalEnterprises: 0,
  totalArea: 0,
  landedCount: 0,
  conversionRate: 0,
  pendingCount: 0,
  weekNewIntakes: 0,
});
const statusData = ref<StatusItem[]>([]);
const trendData = ref<TrendData>({ dates: [], created: [], landed: [] });
const industryData = ref<IndustryItem[]>([]);

const mapChartRef = ref<InstanceType<typeof VChart> | null>(null);
const currentMapLevel = ref<'china' | 'province'>('china');
const currentProvince = ref<{ name: string; code: string } | null>(null);
const cityMapData = ref<CityData[]>([]);
const loadingMap = ref(false);

const chinaMapCache = ref<any>(null);
const provinceMapCache = ref<Record<string, { mapName: string; geo: any }>>({});
const chinaMapReady = ref(false);

const viewportSize = reactive({ w: window.innerWidth, h: window.innerHeight });
const isFs = ref(!!document.fullscreenElement);

const scaleMode = ref<'contain' | 'cover'>('cover');
const toggleScaleMode = () => {
  scaleMode.value = scaleMode.value === 'contain' ? 'cover' : 'contain';
};

const scale = computed(() => {
  const sx = viewportSize.w / DESIGN_W;
  const sy = viewportSize.h / DESIGN_H;
  return scaleMode.value === 'cover' ? Math.max(sx, sy) : Math.min(sx, sy);
});

const viewportStyle = computed(() => ({
  width: '100vw',
  height: '100vh',
  overflow: 'hidden',
  background: '#02060f',
}));

const bigscreenInnerStyle = computed(() => {
  const s = scale.value;
  return {
    width: DESIGN_W + 'px',
    height: DESIGN_H + 'px',
    transform: 'translate(-50%, -50%) scale(' + s + ')',
    transformOrigin: 'center center',
    position: 'absolute' as const,
    left: '50%',
    top: '50%',
  };
});

let refreshTimer: ReturnType<typeof setInterval> | null = null;
let timeTimer: ReturnType<typeof setInterval> | null = null;
let resizeHandler: (() => void) | null = null;
let fsHandler: (() => void) | null = null;

const formatArea = (v: number) => {
  if (v >= 10000) return (v / 10000).toFixed(1) + '万';
  return String(v);
};

const topProvinces = computed(() => {
  const data = currentMapLevel.value === 'province'
    ? cityMapData.value.map((c) => ({
        name: c.name,
        enterpriseCount: c.enterpriseCount,
        totalArea: c.totalArea,
        landedCount: c.landedCount,
        code: '',
      }))
    : mapData.value.provinces;
  return [...data]
    .sort((a, b) => b.enterpriseCount - a.enterpriseCount)
    .slice(0, 10);
});

const barWidth = (v: number) => {
  const max = topProvinces.value[0]?.enterpriseCount || 1;
  return Math.max((v / max) * 100, v > 0 ? 5 : 0);
};

async function loadChinaMap() {
  if (chinaMapCache.value) return chinaMapCache.value;
  const res = await fetch('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json');
  if (!res.ok) throw new Error('加载中国地图失败');
  const geo = await res.json();
  chinaMapCache.value = geo;
  echarts.registerMap('china', geo);
  chinaMapReady.value = true;
  return geo;
}

async function loadProvinceMap(provinceCode: string) {
  if (provinceMapCache.value[provinceCode]) {
    return provinceMapCache.value[provinceCode];
  }
  const url = 'https://geo.datav.aliyun.com/areas_v3/bound/' + provinceCode + '_full.json';
  const res = await fetch(url);
  if (!res.ok) throw new Error('加载省份地图失败: ' + provinceCode);
  const geo = await res.json();
  const mapName = 'province_' + provinceCode;
  echarts.registerMap(mapName, geo);
  provinceMapCache.value[provinceCode] = { mapName, geo };
  return provinceMapCache.value[provinceCode];
}

function buildMapOption(seriesData: any[], mapName: string, maxVal: number, level: 'china' | 'province') {
  return {
    backgroundColor: 'transparent',
    visualMap: {
      show: true,
      left: 20,
      bottom: 40,
      orient: 'vertical',
      min: 0,
      max: Math.max(maxVal, 100),
      text: ['高', '低'],
      textStyle: { color: '#fff', fontSize: 11 },
      inRange: {
        color: ['#0a1a3a', '#1e3a8a', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'],
      },
      calculable: true,
      itemWidth: 12,
      itemHeight: 100,
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(10, 30, 70, 0.95)',
      borderColor: '#3b82f6',
      borderWidth: 1,
      textStyle: { color: '#fff' },
      formatter: (params: any) => {
        if (!params.data) return '<b style="color:#60a5fa">' + params.name + '</b><br/>暂无数据';
        const v = params.data;
        return '<div style="padding: 4px 8px;">' +
          '<div style="font-size: 14px; font-weight: 600; margin-bottom: 6px; color: #60a5fa;">' + params.name + '</div>' +
          '<div style="font-size: 12px; opacity: 0.9;">企业数：<span style="color: #ffd93d; font-weight: 600;">' + (v.enterpriseCount ?? 0) + '</span> 家</div>' +
          '<div style="font-size: 12px; opacity: 0.9;">总面积：<span style="color: #4ecca3; font-weight: 600;">' + formatNumber(v.value ?? 0) + '</span> ㎡</div>' +
          '<div style="font-size: 12px; opacity: 0.9;">已落地：<span style="color: #ff6b6b; font-weight: 600;">' + (v.landedCount ?? 0) + '</span> 家</div>' +
          (level === 'china' ? '<div style="font-size: 11px; margin-top: 6px; opacity: 0.6;">点击查看市级分布</div>' : '') +
          '</div>';
      },
    },
    series: [
      {
        name: level === 'china' ? 'china' : 'province',
        type: 'map',
        map: mapName,
        roam: true,
        zoom: level === 'china' ? 1.2 : 1.15,
        scaleLimit: { min: 0.8, max: 6 },
        label: {
          show: true,
          color: '#fff',
          fontSize: level === 'china' ? 10 : 11,
          textBorderColor: '#0a1a3a',
          textBorderWidth: 2,
        },
        itemStyle: {
          areaColor: 'rgba(20, 50, 120, 0.5)',
          borderColor: '#4a9eff',
          borderWidth: 1,
        },
        emphasis: {
          label: {
            show: true,
            color: '#fff',
            fontSize: level === 'china' ? 12 : 13,
            fontWeight: 600,
          },
          itemStyle: { areaColor: '#3b82f6' },
        },
        select: {
          label: { show: true, color: '#fff' },
          itemStyle: { areaColor: '#1d4ed8' },
        },
        data: seriesData,
      },
    ],
  };
}

const formatNumber = (v: number) => {
  if (v >= 10000) return (v / 10000).toFixed(1) + '万';
  return String(v);
};

const mapOption = computed(() => {
  if (!chinaMapReady.value) return {};
  if (currentMapLevel.value === 'china' || !mapData.value.provinces.length) {
    const seriesData = mapData.value.provinces.map((p) => ({
      name: p.name,
      value: p.totalArea,
      enterpriseCount: p.enterpriseCount,
      landedCount: p.landedCount,
      code: p.code,
    }));
    const maxVal = Math.max(0, ...mapData.value.provinces.map((p) => p.totalArea));
    return buildMapOption(seriesData, 'china', maxVal, 'china');
  }
  if (currentProvince.value) {
    const mapInfo = provinceMapCache.value[currentProvince.value.code];
    if (!mapInfo) return {};
    const seriesData = cityMapData.value.map((c) => ({
      name: c.name,
      value: c.totalArea,
      enterpriseCount: c.enterpriseCount,
      landedCount: c.landedCount,
    }));
    const maxVal = Math.max(0, ...cityMapData.value.map((c) => c.totalArea));
    return buildMapOption(seriesData, mapInfo.mapName, maxVal, 'province');
  }
  return {};
});

async function drillToProvince(provinceName: string, provinceCode: string) {
  if (!provinceCode) return;

  loadingMap.value = true;
  try {
    await loadProvinceMap(provinceCode);
    const cityRes = await getCityData(provinceCode);
    cityMapData.value = cityRes?.cities || [];

    currentMapLevel.value = 'province';
    currentProvince.value = { name: provinceName, code: provinceCode };
  } catch (e) {
    console.error('下钻失败:', e);
  } finally {
    loadingMap.value = false;
  }
}

async function backToChinaMap() {
  if (currentMapLevel.value === 'china') return;
  currentMapLevel.value = 'china';
  currentProvince.value = null;
  cityMapData.value = [];
}

const handleMapClick = (params: any) => {
  if (params.componentType !== 'series') return;
  if (currentMapLevel.value !== 'china') return;
  const code = (params.data?.code || mapData.value.provinces.find((p) => p.name === params.name)?.code) as string | undefined;
  if (!code) return;
  if (code === '1' || code === '100000' || code.length < 6) return;
  drillToProvince(params.name, code);
};

const statusOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(13,39,68,0.95)',
    borderColor: '#00d4ff',
    textStyle: { color: '#fff' },
  },
  legend: {
    orient: 'vertical',
    right: 10,
    top: 'center',
    textStyle: { color: '#aaa', fontSize: 11 },
    itemWidth: 10,
    itemHeight: 10,
  },
  color: ['#00d4ff', '#4ecca3', '#ffd93d', '#ff6b6b', '#a78bfa', '#f472b6', '#94a3b8'],
  series: [
    {
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['35%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: { borderColor: '#0d2744', borderWidth: 2 },
      label: { show: false },
      emphasis: {
        label: { show: true, color: '#fff', fontSize: 14, fontWeight: 'bold' },
      },
      data: statusData.value,
    },
  ],
}));

const trendOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(13,39,68,0.95)',
    borderColor: '#00d4ff',
    textStyle: { color: '#fff' },
  },
  legend: {
    data: ['新增进件', '新落地'],
    textStyle: { color: '#aaa' },
    top: 0,
  },
  grid: { left: 40, right: 20, top: 30, bottom: 25 },
  xAxis: {
    type: 'category',
    data: trendData.value.dates,
    axisLabel: { color: '#888', fontSize: 10, rotate: 30 },
    axisLine: { lineStyle: { color: '#1e6f9f' } },
    axisTick: { show: false },
  },
  yAxis: {
    type: 'value',
    axisLabel: { color: '#888', fontSize: 10 },
    axisLine: { show: false },
    axisTick: { show: false },
    splitLine: { lineStyle: { color: '#1e6f9f', type: 'dashed' } },
  },
  series: [
    {
      name: '新增进件',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      data: trendData.value.created,
      lineStyle: { color: '#00d4ff', width: 2 },
      itemStyle: { color: '#00d4ff' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(0,212,255,0.4)' },
          { offset: 1, color: 'rgba(0,212,255,0)' },
        ]),
      },
    },
    {
      name: '新落地',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      data: trendData.value.landed,
      lineStyle: { color: '#ff6b6b', width: 2 },
      itemStyle: { color: '#ff6b6b' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(255,107,107,0.4)' },
          { offset: 1, color: 'rgba(255,107,107,0)' },
        ]),
      },
    },
  ],
}));

const industryOption = computed(() => {
  const top = industryData.value.slice(0, 12);
  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(13,39,68,0.95)',
      borderColor: '#00d4ff',
      textStyle: { color: '#fff' },
    },
    grid: { left: 90, right: 20, top: 10, bottom: 10 },
    xAxis: {
      type: 'value',
      axisLabel: { color: '#888', fontSize: 10 },
      splitLine: { lineStyle: { color: '#1e6f9f', type: 'dashed' } },
    },
    yAxis: {
      type: 'category',
      data: top.map((i) => i.name).reverse(),
      axisLabel: { color: '#ccc', fontSize: 11 },
      axisLine: { lineStyle: { color: '#1e6f9f' } },
      axisTick: { show: false },
    },
    series: [
      {
        type: 'bar',
        data: top.map((i) => i.value).reverse(),
        barWidth: 14,
        itemStyle: {
          borderRadius: [0, 7, 7, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#00d4ff' },
            { offset: 1, color: '#4ecca3' },
          ]),
        },
      },
    ],
  };
});

const topOption = computed(() => {
  const dataSource = currentMapLevel.value === 'province' ? cityMapData.value : mapData.value.provinces;
  const sorted = [...dataSource]
    .sort((a, b) => b.enterpriseCount - a.enterpriseCount)
    .slice(0, 10);

  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(13,39,68,0.95)',
      borderColor: '#00d4ff',
      textStyle: { color: '#fff' },
    },
    grid: { left: 50, right: 20, top: 20, bottom: 40 },
    xAxis: {
      type: 'category',
      data: sorted.map((p) => p.name),
      axisLabel: { color: '#ccc', fontSize: 11, rotate: 30 },
      axisLine: { lineStyle: { color: '#1e6f9f' } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#888', fontSize: 10 },
      splitLine: { lineStyle: { color: '#1e6f9f', type: 'dashed' } },
    },
    series: [
      {
        type: 'bar',
        data: sorted.map((p) => p.enterpriseCount),
        barWidth: 24,
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
          color: (params: any) => {
            const colors = ['#ff6b6b', '#ffd93d', '#00d4ff', '#4ecca3', '#a78bfa', '#0ea5e9', '#14b8a6', '#f97316', '#22c55e', '#f472b6'];
            return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: colors[params.dataIndex % colors.length] },
              { offset: 1, color: 'rgba(0,0,0,0.3)' },
            ]);
          },
        },
      },
    ],
  };
});

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

    if (currentMapLevel.value === 'china') {
      await loadChinaMap();
    } else if (currentProvince.value) {
      const cityRes = await getCityData(currentProvince.value.code);
      cityMapData.value = cityRes?.cities || [];
      await loadProvinceMap(currentProvince.value.code);
    }
  } catch (e) {
    console.error('数据加载失败:', e);
  }
};

const manualRefresh = () => fetchAll();

const updateTime = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  currentTime.value = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
  const weeks = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  currentWeek.value = weeks[d.getDay()];
};

const toggleFullscreenMode = async () => {
  const ok = await toggleFullscreen();
  isFs.value = ok;
  // 触发一次 resize 让图表重新计算
  setTimeout(() => {
    window.dispatchEvent(new Event('resize'));
  }, 200);
};

function exitFullscreen() {
  router.push('/pc/dashboard');
}

onMounted(async () => {
  updateTime();
  timeTimer = setInterval(updateTime, 1000);

  // 监听窗口尺寸变化，重新计算 scale
  resizeHandler = () => {
    viewportSize.w = window.innerWidth;
    viewportSize.h = window.innerHeight;
  };
  window.addEventListener('resize', resizeHandler);

  // 监听浏览器全屏变化
  fsHandler = () => {
    isFs.value = !!document.fullscreenElement;
    viewportSize.w = window.innerWidth;
    viewportSize.h = window.innerHeight;
  };
  document.addEventListener('fullscreenchange', fsHandler);

  await loadChinaMap();
  await fetchAll();

  refreshTimer = setInterval(fetchAll, 30000);
});

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer);
  if (timeTimer) clearInterval(timeTimer);
  if (resizeHandler) window.removeEventListener('resize', resizeHandler);
  if (fsHandler) document.removeEventListener('fullscreenchange', fsHandler);
});

defineExpose({
  backToChinaMap,
  drillToProvince,
});
</script>
<style scoped>
.bigscreen-viewport {
  position: relative;
  overflow: hidden;
  background: #02060f;
}

.bigscreen {
  position: absolute;
  left: 50%;
  top: 50%;
  background:
    radial-gradient(ellipse at top, #0d2a52 0%, #050d1f 40%, #02060f 100%);
  color: #d8eaff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: 'Microsoft YaHei', 'Consolas', monospace;
}

.bigscreen {
  background:
    radial-gradient(ellipse at top, #0d2a52 0%, #050d1f 40%, #02060f 100%);
}

.bs-bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(0, 200, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 200, 255, 0.04) 1px, transparent 1px);
  background-size: 50px 50px;
  pointer-events: none;
  z-index: 0;
}

.bs-bg-glow {
  position: absolute;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.3;
  pointer-events: none;
  z-index: 0;
}
.bs-bg-glow-1 {
  top: -200px;
  left: 20%;
  background: #00d4ff;
}
.bs-bg-glow-2 {
  bottom: -200px;
  right: 20%;
  background: #ff6b6b;
}

.bs-scan-line {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00d4ff, transparent);
  animation: scanMove 4s linear infinite;
  pointer-events: none;
  z-index: 0;
  opacity: 0.6;
}
@keyframes scanMove {
  0% { top: 0; opacity: 0; }
  10% { opacity: 0.6; }
  90% { opacity: 0.6; }
  100% { top: 100%; opacity: 0; }
}

.bs-header {
  height: 80px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-bottom: 1px solid rgba(0, 200, 255, 0.2);
  padding: 0 20px;
  z-index: 2;
}

.bs-header-deco {
  display: flex;
  align-items: center;
  gap: 4px;
  position: absolute;
}
.bs-header-deco.left { left: 40px; }
.bs-header-deco.right { right: 40px; flex-direction: row-reverse; }

.deco-segment {
  width: 60px;
  height: 4px;
  background: linear-gradient(90deg, #00d4ff, transparent);
}
.deco-segment.thin {
  width: 30px;
  height: 2px;
  background: linear-gradient(90deg, #00d4ff, transparent);
  opacity: 0.6;
}
.deco-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #00d4ff;
  box-shadow: 0 0 8px #00d4ff;
}

.bs-header-side {
  display: flex;
  align-items: center;
  gap: 12px;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  color: #6dd5ff;
  font-size: 12px;
  letter-spacing: 2px;
}
.bs-header-side-left { left: 130px; }
.bs-header-side-right { right: 130px; }

.bs-side-line {
  width: 80px;
  height: 1px;
  background: linear-gradient(90deg, transparent, #00d4ff);
}
.bs-side-line-dim {
  background: linear-gradient(90deg, #00d4ff, transparent);
}

.bs-side-label-right {
  text-align: right;
  min-width: 200px;
}

.bs-title {
  margin: 0;
  font-size: 32px;
  font-weight: 600;
  color: #fff;
  letter-spacing: 4px;
  display: flex;
  align-items: center;
  gap: 14px;
  text-shadow: 0 0 12px rgba(0, 212, 255, 0.6);
  background: linear-gradient(180deg, #fff 0%, #6dd5ff 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.bs-title-tag {
  font-size: 14px;
  color: #00d4ff;
  padding: 4px 12px;
  border: 1px solid #00d4ff;
  border-radius: 4px;
  letter-spacing: 2px;
  background: rgba(0, 212, 255, 0.08);
  -webkit-text-fill-color: #00d4ff;
  text-shadow: none;
}

.bs-header-info {
  position: absolute;
  right: 60px;
  top: 14px;
  display: flex;
  gap: 10px;
  font-size: 12px;
}
.bs-refresh, .bs-fs, .bs-exit, .bs-mode {
  cursor: pointer;
  color: #6dd5ff;
  padding: 4px 10px;
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 4px;
  transition: all 0.2s;
  background: rgba(0, 212, 255, 0.05);
  font-size: 14px;
}
.bs-refresh:hover, .bs-fs:hover, .bs-exit:hover, .bs-mode:hover {
  background: rgba(0, 212, 255, 0.2);
  border-color: #00d4ff;
}

.refresh-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #4ecca3;
  margin-right: 6px;
  box-shadow: 0 0 6px #4ecca3;
  animation: pulse 1.5s infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.bs-body {
  flex: 1;
  display: flex;
  gap: 14px;
  padding: 14px;
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.bs-col {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
}
.bs-left, .bs-right {
  flex: 0 0 360px;
}
.bs-center {
  flex: 1;
  min-width: 0;
}

.bs-panel {
  flex: 1;
  min-height: 0;
  position: relative;
  background: linear-gradient(180deg, rgba(0, 50, 120, 0.25) 0%, rgba(0, 20, 60, 0.4) 100%);
  border: 1px solid rgba(0, 200, 255, 0.25);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 4px;
}

.bs-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, #00d4ff, transparent);
}

.bs-panel-title {
  padding: 10px 16px;
  font-size: 15px;
  font-weight: bold;
  color: #6dd5ff;
  border-bottom: 1px solid rgba(0, 200, 255, 0.2);
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  letter-spacing: 1px;
}
.title-bar {
  width: 3px;
  height: 14px;
  background: #00d4ff;
  box-shadow: 0 0 6px #00d4ff;
}
.title-en {
  font-size: 11px;
  color: #4a9eff;
  letter-spacing: 2px;
  opacity: 0.7;
  margin-left: auto;
  font-weight: normal;
}
.bs-back {
  font-size: 12px;
  color: #ffd93d;
  cursor: pointer;
  margin-left: auto;
  padding: 2px 8px;
  border: 1px solid rgba(255, 217, 61, 0.4);
  border-radius: 3px;
}
.bs-back:hover { background: rgba(255, 217, 61, 0.1); }

.bs-chart {
  flex: 1;
  min-height: 0;
}

.bs-map-panel {
  flex: 1;
}

.bs-map {
  flex: 1;
  position: relative;
  min-height: 0;
}

.bs-map-chart {
  width: 100%;
  height: 100%;
}

.bs-map-loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6dd5ff;
  font-size: 14px;
}

.bs-summary {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 14px;
  gap: 14px;
  min-height: 0;
  overflow: auto;
}
.summary-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 10px;
  background: linear-gradient(180deg, rgba(0, 100, 200, 0.1) 0%, rgba(0, 50, 120, 0.2) 100%);
  border: 1px solid rgba(0, 200, 255, 0.15);
  border-radius: 4px;
  position: relative;
  overflow: hidden;
  min-height: 0;
}
.summary-item::after {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(0, 212, 255, 0.2) 0%, transparent 60%);
  pointer-events: none;
}
.summary-num {
  font-size: 32px;
  font-weight: bold;
  color: #00d4ff;
  font-family: 'Consolas', monospace;
  text-shadow: 0 0 12px rgba(0, 212, 255, 0.6);
  line-height: 1.2;
}
.summary-label {
  font-size: 12px;
  color: #6dd5ff;
  letter-spacing: 1px;
  margin-top: 4px;
}
.stat-bar {
  width: 100%;
  height: 4px;
  background: rgba(0, 100, 200, 0.2);
  border-radius: 2px;
  margin-top: 6px;
  overflow: hidden;
}
.stat-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #00d4ff, #4ecca3);
  border-radius: 2px;
  transition: width 0.5s;
}

.ranking-list {
  flex: 1;
  padding: 10px 14px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
}
.rank-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}
.rank-no {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-weight: bold;
  font-size: 11px;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.1);
  color: #aaa;
}
.rank-no-1 {
  background: linear-gradient(135deg, #ff6b6b, #ff8e53);
  color: #fff;
  box-shadow: 0 0 8px rgba(255, 107, 107, 0.5);
}
.rank-no-2 {
  background: linear-gradient(135deg, #ffd93d, #ffb347);
  color: #fff;
}
.rank-no-3 {
  background: linear-gradient(135deg, #4ecca3, #2d9d6c);
  color: #fff;
}

.rt-name {
  flex: 0 0 60px;
  color: #d8eaff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rt-bar-wrap {
  flex: 1;
  height: 8px;
  background: rgba(0, 100, 200, 0.15);
  border: 1px solid rgba(0, 200, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.rt-bar {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #00d4ff, #4ecca3, #ffd93d);
  border-radius: 3px;
  transition: width 0.5s ease;
  box-shadow: 0 0 8px #00d4ff;
  position: relative;
}
.rt-bar::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 20px;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6));
  animation: barShine 2s linear infinite;
}
@keyframes barShine {
  0% { transform: translateX(-20px); }
  100% { transform: translateX(20px); }
}

.rt-val {
  width: 36px;
  text-align: right;
  color: #00d4ff;
  font-weight: bold;
  font-family: 'Consolas', monospace;
  text-shadow: 0 0 6px #00d4ff;
}

::selection {
  background: rgba(0, 212, 255, 0.4);
  color: #fff;
}
</style>