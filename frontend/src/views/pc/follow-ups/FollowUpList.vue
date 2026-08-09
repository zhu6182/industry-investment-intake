<template>
  <div class="followup-list">
    <div class="header">
      <h2>跟进记录</h2>
      <a-button type="primary" @click="goNew">
        <template #icon><PlusOutlined /></template>
        新建跟进
      </a-button>
    </div>

    <a-card class="filter-card">
      <a-form layout="inline" :model="filters" @finish="loadData">
        <a-form-item label="关键词">
          <a-input
            v-model:value="filters.keyword"
            placeholder="企业名称/跟进内容"
            allow-clear
            style="width: 240px"
          />
        </a-form-item>
        <a-form-item label="跟进方式">
          <a-select
            v-model:value="filters.method"
            placeholder="全部"
            allow-clear
            style="width: 140px"
          >
            <a-select-option
              v-for="(v, k) in methodMap"
              :key="k"
              :value="k"
            >
              {{ v }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="结果">
          <a-select
            v-model:value="filters.result"
            placeholder="全部"
            allow-clear
            style="width: 140px"
          >
            <a-select-option
              v-for="(v, k) in resultMap"
              :key="k"
              :value="k"
            >
              {{ v.text }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="跟进日期">
          <a-range-picker
            v-model:value="filters.dateRange"
            format="YYYY-MM-DD"
          />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit">查询</a-button>
          <a-button style="margin-left: 8px" @click="resetFilters">重置</a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <a-card class="table-card">
      <a-table
        :columns="columns"
        :data-source="dataSource"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        :scroll="{ x: 1400 }"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'companyName'">
            <a @click="goIntakeDetail((record as FollowUpRow).intakeId)">
              {{ (record as FollowUpRow).companyName || '-' }}
            </a>
          </template>
          <template v-else-if="column.key === 'method'">
            <a-tag>{{ methodMap[(record as FollowUpRow).method] }}</a-tag>
          </template>
          <template v-else-if="column.key === 'result'">
            <a-tag :color="resultMap[(record as FollowUpRow).result]?.color">
              {{ resultMap[(record as FollowUpRow).result]?.text }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'content'">
            <a-tooltip :title="(record as FollowUpRow).content">
              <span class="content-cell">{{ (record as FollowUpRow).content }}</span>
            </a-tooltip>
          </template>
          <template v-else-if="column.key === 'nextStep'">
            <span>{{ (record as FollowUpRow).nextStep || '-' }}</span>
          </template>
          <template v-else-if="column.key === 'operator'">
            <span>{{ (record as FollowUpRow).operator?.name || '-' }}</span>
          </template>
          <template v-else-if="column.key === 'action'">
            <a @click="goDetail((record as FollowUpRow).id)">查看</a>
            <a-divider type="vertical" />
            <a @click="goNew((record as FollowUpRow).intakeId)">新增跟进</a>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { PlusOutlined } from '@ant-design/icons-vue';
import dayjs from 'dayjs';
import {
  listFollowUps,
  methodMap,
  resultMap,
  type FollowUp,
  type FollowUpMethod,
  type FollowUpResult,
} from '@/api/modules/follow-ups';

interface FollowUpRow extends FollowUp {
  companyName?: string;
}

const router = useRouter();
const loading = ref(false);
const dataSource = ref<FollowUpRow[]>([]);
const total = ref(0);

const filters = reactive({
  keyword: '',
  method: undefined as FollowUpMethod | undefined,
  result: undefined as FollowUpResult | undefined,
  dateRange: [] as any[],
  page: 1,
  pageSize: 20,
});

const pagination = computed(() => ({
  current: filters.page,
  pageSize: filters.pageSize,
  total: total.value,
  showSizeChanger: true,
  showTotal: (t: number) => `共 ${t} 条`,
}));

const columns = [
  { title: 'ID', dataIndex: 'id', width: 60 },
  { title: '企业名称', key: 'companyName', width: 220 },
  { title: '跟进方式', key: 'method', width: 100 },
  { title: '跟进内容', key: 'content', width: 280 },
  { title: '跟进日期', dataIndex: 'followDate', width: 130 },
  { title: '结果', key: 'result', width: 110 },
  { title: '下次计划', key: 'nextStep', width: 180 },
  { title: '跟进人', key: 'operator', width: 100 },
  { title: '创建时间', dataIndex: 'createdAt', width: 180 },
  { title: '操作', key: 'action', width: 160, fixed: 'right' },
];

async function loadData() {
  loading.value = true;
  try {
    const params: Record<string, any> = {
      page: filters.page,
      pageSize: filters.pageSize,
    };
    if (filters.keyword) params.keyword = filters.keyword;
    if (filters.method) params.method = filters.method;
    if (filters.result) params.result = filters.result;
    if (filters.dateRange && filters.dateRange.length === 2) {
      params.startDate = dayjs(filters.dateRange[0]).format('YYYY-MM-DD');
      params.endDate = dayjs(filters.dateRange[1]).format('YYYY-MM-DD');
    }
    const res = await listFollowUps(params);
    if (Array.isArray(res) && res.length === 2 && Array.isArray(res[0])) {
      dataSource.value = res[0] as FollowUpRow[];
      total.value = res[1] as number;
    } else {
      dataSource.value = (res as FollowUpRow[]) || [];
      total.value = dataSource.value.length;
    }
  } catch (e: any) {
    message.error(e.message || '加载失败');
  } finally {
    loading.value = false;
  }
}

function resetFilters() {
  filters.keyword = '';
  filters.method = undefined;
  filters.result = undefined;
  filters.dateRange = [];
  filters.page = 1;
  loadData();
}

function handleTableChange(pag: any) {
  filters.page = pag.current;
  filters.pageSize = pag.pageSize;
  loadData();
}

function goNew(intakeId?: number) {
  if (intakeId) {
    router.push(`/pc/follow-ups/new?intakeId=${intakeId}`);
  } else {
    router.push('/pc/follow-ups/new');
  }
}

function goDetail(id: number) {
  router.push(`/pc/follow-ups/${id}`);
}

function goIntakeDetail(intakeId: number) {
  router.push(`/pc/intakes/${intakeId}`);
}

onMounted(() => {
  filters.page = 1;
  filters.pageSize = 20;
  loadData();
});
</script>

<style scoped>
.followup-list {
  padding: 24px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.header h2 {
  margin: 0;
}
.filter-card {
  margin-bottom: 16px;
}
.table-card {
  background: #fff;
}
.content-cell {
  display: inline-block;
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
