<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import {
  SearchOutlined,
  ReloadOutlined,
  WarningOutlined,
  AlertOutlined,
  TeamOutlined,
} from '@ant-design/icons-vue';
import {
  queryDuplicateCheckLogs,
  getDuplicateCheckLogSummary,
  type DuplicateCheckLog,
  type QueryLogParams,
  type DuplicateCheckLogSummary,
} from '@/api/modules/duplicate-check-logs';

const router = useRouter();

const logs = ref<DuplicateCheckLog[]>([]);
const total = ref(0);
const loading = ref(false);
const summary = ref<DuplicateCheckLogSummary | null>(null);

const filters = ref<QueryLogParams>({
  companyName: '',
  checkerPhone: '',
  intakeStatus: undefined,
  startDate: undefined,
  endDate: undefined,
  page: 1,
  pageSize: 20,
});

const statusOptions = [
  { value: 'pending', label: '待审核', color: 'orange' },
  { value: 'approved', label: '已批准', color: 'green' },
  { value: 'assigned', label: '已分配', color: 'blue' },
  { value: 'following', label: '跟进中', color: 'cyan' },
  { value: 'landed', label: '已落地', color: 'purple' },
  { value: 'lost', label: '已流失', color: 'red' },
  { value: 'rejected', label: '已驳回', color: 'volcano' },
];

const statusMap = computed(() => {
  const m: Record<string, { label: string; color: string }> = {};
  statusOptions.forEach((s) => (m[s.value] = { label: s.label, color: s.color }));
  return m;
});

const dateRange = ref<[string, string] | null>(null);

async function fetchLogs() {
  loading.value = true;
  try {
    const params: QueryLogParams = {
      companyName: filters.value.companyName || undefined,
      checkerPhone: filters.value.checkerPhone || undefined,
      intakeStatus: filters.value.intakeStatus,
      startDate: dateRange.value?.[0],
      endDate: dateRange.value?.[1],
      page: filters.value.page,
      pageSize: filters.value.pageSize,
    };
    const r = await queryDuplicateCheckLogs(params);
    logs.value = r.items;
    total.value = r.total;
  } catch (e: any) {
    message.error(e.message || '查询失败');
  } finally {
    loading.value = false;
  }
}

async function fetchSummary() {
  try {
    summary.value = await getDuplicateCheckLogSummary();
  } catch (e: any) {
    console.error('summary failed', e);
  }
}

function onSearch() {
  filters.value.page = 1;
  fetchLogs();
}

function onReset() {
  filters.value = {
    companyName: '',
    checkerPhone: '',
    intakeStatus: undefined,
    startDate: undefined,
    endDate: undefined,
    page: 1,
    pageSize: 20,
  };
  dateRange.value = null;
  fetchLogs();
}

function onPageChange(p: number, ps: number) {
  filters.value.page = p;
  filters.value.pageSize = ps;
  fetchLogs();
}

function onRowClick(record: DuplicateCheckLog) {
  router.push(`/pc/intakes/${record.intakeId}`);
}

function fmtDate(s: string) {
  if (!s) return '-';
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleString('zh-CN', { hour12: false });
}

onMounted(async () => {
  await fetchSummary();
  await fetchLogs();
});
</script>

<template>
  <div class="duplicate-check-logs-page">
    <a-page-header
      title="查重历史"
      sub-title="查看所有触发重复进件拦截的查询记录，作为风险排查依据"
      style="padding: 0 0 16px 0"
    />

    <!-- 顶部统计卡片 -->
    <a-row :gutter="16" style="margin-bottom: 16px">
      <a-col :span="8">
        <a-card>
          <a-statistic
            title="近 30 天查重命中"
            :value="summary?.last30DaysCount ?? 0"
            :value-style="{ color: '#cf1322' }"
          >
            <template #prefix><AlertOutlined /></template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card title="Top 5 重复企业" size="small">
          <a-empty
            v-if="!summary?.topDuplicatedCompanies?.length"
            :image="undefined"
            description="暂无数据"
          />
          <div v-else>
            <div
              v-for="(item, i) in summary.topDuplicatedCompanies"
              :key="i"
              class="rank-item"
            >
              <span class="rank-no">{{ i + 1 }}.</span>
              <span class="rank-name">{{ item.companyName }}</span>
              <a-tag color="red">{{ item.count }} 次</a-tag>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card title="Top 5 查询人" size="small">
          <a-empty
            v-if="!summary?.topCheckers?.length"
            :image="undefined"
            description="暂无数据"
          />
          <div v-else>
            <div
              v-for="(item, i) in summary.topCheckers"
              :key="i"
              class="rank-item"
            >
              <span class="rank-no">{{ i + 1 }}.</span>
              <span class="rank-name">{{ item.checkerName }}</span>
              <span class="rank-phone">({{ item.checkerPhone }})</span>
              <a-tag color="orange">{{ item.count }} 次</a-tag>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 过滤栏 -->
    <a-card style="margin-bottom: 16px">
      <a-form layout="inline">
        <a-form-item label="企业名称">
          <a-input
            v-model:value="filters.companyName"
            placeholder="模糊匹配"
            allow-clear
            style="width: 180px"
            @press-enter="onSearch"
          />
        </a-form-item>
        <a-form-item label="查询人手机">
          <a-input
            v-model:value="filters.checkerPhone"
            placeholder="精确匹配"
            allow-clear
            style="width: 150px"
            @press-enter="onSearch"
          />
        </a-form-item>
        <a-form-item label="命中进件状态">
          <a-select
            v-model:value="filters.intakeStatus"
            placeholder="全部"
            allow-clear
            style="width: 130px"
            :options="statusOptions"
          />
        </a-form-item>
        <a-form-item label="时间范围">
          <a-range-picker
            v-model:value="dateRange"
            show-time
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DDTHH:mm:ss.SSSZ"
            style="width: 360px"
          />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" :icon="SearchOutlined" @click="onSearch">
              查询
            </a-button>
            <a-button :icon="ReloadOutlined" @click="onReset">重置</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 数据表格 -->
    <a-card>
      <a-table
        :data-source="logs"
        :loading="loading"
        :pagination="{
          current: filters.page,
          pageSize: filters.pageSize,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          onChange: onPageChange,
          onShowSizeChange: onPageChange,
        }"
        row-key="id"
        :row-class-name="() => 'clickable-row'"
        size="middle"
        @row-click="onRowClick"
      >
        <a-table-column title="查重时间" data-index="createdAt" width="170">
          <template #default="{ text }">{{ fmtDate(text) }}</template>
        </a-table-column>
        <a-table-column title="查询企业名" data-index="companyName" width="220">
          <template #default="{ text }">
            <span style="color: #cf1322">
              <WarningOutlined /> {{ text }}
            </span>
          </template>
        </a-table-column>
        <a-table-column title="命中进件 ID" data-index="intakeId" width="100">
          <template #default="{ text }">
            <a-tag color="blue">#{{ text }}</a-tag>
          </template>
        </a-table-column>
        <a-table-column title="命中进件状态" data-index="intakeStatus" width="110">
          <template #default="{ text }">
            <a-tag :color="statusMap[text]?.color || 'default'">
              {{ statusMap[text]?.label || text }}
            </a-tag>
          </template>
        </a-table-column>
        <a-table-column title="命中进件创建时间" data-index="intakeCreatedAt" width="170">
          <template #default="{ text }">{{ fmtDate(text) }}</template>
        </a-table-column>
        <a-table-column title="查询人" data-index="checkerName" width="120">
          <template #default="{ text }">
            <TeamOutlined /> {{ text }}
          </template>
        </a-table-column>
        <a-table-column title="查询人手机" data-index="checkerPhone" width="130" />
        <a-table-column title="来源 IP" data-index="sourceIp" width="130">
          <template #default="{ text }">
            <code v-if="text">{{ text }}</code>
            <span v-else>-</span>
          </template>
        </a-table-column>
      </a-table>
    </a-card>
  </div>
</template>

<style scoped>
.rank-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}
.rank-no {
  font-weight: 600;
  color: #999;
  min-width: 24px;
}
.rank-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.rank-phone {
  color: #999;
  font-size: 12px;
}
:deep(.clickable-row) {
  cursor: pointer;
}
:deep(.clickable-row:hover) {
  background: #fafafa;
}
</style>
