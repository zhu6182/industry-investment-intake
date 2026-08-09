<template>
  <div class="review-list">
    <div class="page-header">
      <h2>中台审核</h2>
    </div>

    <a-card class="filter-card">
      <a-tabs v-model:activeKey="tabKey" @change="onTabChange">
        <a-tab-pane key="pending" tab="待审核" />
        <a-tab-pane key="reviewed" tab="已审核" />
      </a-tabs>

      <a-form :inline="true" class="filter-form" @finish="loadData">
        <a-form-item label="关键词">
          <a-input
            v-model:value="keyword"
            placeholder="企业名称 / 信用代码 / 法人"
            allow-clear
            style="width: 240px"
          />
        </a-form-item>
        <a-form-item label="日期范围">
          <a-range-picker
            v-model:value="dateRange"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit">查询</a-button>
          <a-button style="margin-left: 8px" @click="resetFilter">重置</a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <a-card class="table-card">
      <a-table
        :columns="columns"
        :data-source="list"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        :row-class-name="statusRowClass"
        @change="onTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="getTagColor(record.status)">
              {{ getTagText(record.status) }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-button type="link" @click="goDetail(record)">审核</a-button>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import dayjs from 'dayjs';
import {
  listIntakes,
  statusMap,
  type Intake,
  type IntakeStatus,
} from '@/api/modules/intakes';

const router = useRouter();

const loading = ref(false);
const list = ref<Intake[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(20);
const keyword = ref('');
const dateRange = ref<[string, string] | null>(null);
const tabKey = ref<'pending' | 'reviewed'>('pending');

const columns = computed(() => [
  { title: 'ID', dataIndex: 'id', width: 70 },
  { title: '企业名称', dataIndex: 'companyName', width: 200, ellipsis: true },
  { title: '信用代码', dataIndex: 'creditCode', width: 180, ellipsis: true },
  { title: '法人', dataIndex: 'legalPerson', width: 100 },
  { title: '行业', dataIndex: 'industry', width: 120, ellipsis: true },
  { title: '申请人', dataIndex: ['applicant', 'name'], width: 100 },
  { title: '状态', key: 'status', width: 100 },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    width: 160,
    customRender: ({ record }: any) => dayjs(record.createdAt).format('YYYY-MM-DD HH:mm'),
  },
  { title: '操作', key: 'action', width: 100, fixed: 'right' },
]);

const pagination = computed(() => ({
  current: page.value,
  pageSize: pageSize.value,
  total: total.value,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (t: number) => `共 ${t} 条`,
}));

async function loadData() {
  loading.value = true;
  try {
    const status: IntakeStatus[] =
      tabKey.value === 'pending'
        ? ['pending']
        : ['rejected', 'approved', 'assigned'];

    const params: any = {
      page: page.value,
      pageSize: pageSize.value,
    };

    if (keyword.value) params.keyword = keyword.value;
    if (dateRange.value) {
      params.startDate = dateRange.value[0];
      params.endDate = dateRange.value[1];
    }

    const results = await Promise.all(
      status.map((s) => listIntakes({ ...params, status: s })),
    );

    if (tabKey.value === 'pending') {
      const [items, t] = results[0];
      list.value = items;
      total.value = t;
    } else {
      const combined: Intake[] = [];
      let t = 0;
      for (const r of results) {
        const [items, total] = r as any;
        combined.push(...items);
        t += total;
      }
      combined.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      list.value = combined;
      total.value = t;
    }
  } catch (e: any) {
    list.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
}

function onTabChange() {
  page.value = 1;
  loadData();
}

function onTableChange(pag: any) {
  page.value = pag.current;
  pageSize.value = pag.pageSize;
  loadData();
}

function resetFilter() {
  keyword.value = '';
  dateRange.value = null;
  page.value = 1;
  loadData();
}

function goDetail(record: Intake) {
  router.push(`/pc/review/${record.id}`);
}

function statusRowClass(record: Intake): string {
  return record.status === 'pending' ? 'pending-row' : '';
}

function getTagColor(status: string): string {
  return statusMap[status as IntakeStatus]?.color || 'default';
}

function getTagText(status: string): string {
  return statusMap[status as IntakeStatus]?.text || status;
}

onMounted(loadData);
</script>

<style scoped>
.review-list {
  padding: 24px;
}
.page-header {
  margin-bottom: 16px;
}
.page-header h2 {
  margin: 0;
}
.filter-card {
  margin-bottom: 16px;
}
.filter-form {
  margin-top: 16px;
}
.table-card {
  margin-bottom: 16px;
}
.pending-row {
  background-color: #fffbe6 !important;
}
</style>
