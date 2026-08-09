<template>
  <div class="visit-list">
    <div class="header">
      <h2>拜访记录</h2>
      <a-button type="primary" @click="goNew">
        <template #icon><PlusOutlined /></template>
        新建拜访
      </a-button>
    </div>

    <a-card class="filter-card">
      <a-form layout="inline" :model="filters" @finish="loadData">
        <a-form-item label="关键词">
          <a-input
            v-model:value="filters.keyword"
            placeholder="企业名称"
            allow-clear
            style="width: 240px"
          />
        </a-form-item>
        <a-form-item label="时间">
          <a-range-picker
            v-model:value="filters.dateRange"
            show-time
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
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <a @click="goDetail(record.id)">查看</a>
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
import { listVisits, type Visit } from '@/api/modules/visits';

const router = useRouter();
const loading = ref(false);
const dataSource = ref<Visit[]>([]);
const total = ref(0);

const filters = reactive({
  keyword: '',
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
  { title: '企业名称', dataIndex: 'companyName', width: 200 },
  { title: '拜访地点', dataIndex: 'visitLocation', width: 160 },
  { title: '拜访内容', dataIndex: 'visitContent', ellipsis: true },
  { title: '拜访日期', dataIndex: 'visitDate', width: 140 },
  { title: '申请园区', dataIndex: ['region', 'name'], width: 140 },
  { title: '面积(㎡)', dataIndex: 'area', width: 100 },
  { title: '跟进人', dataIndex: ['operator', 'name'], width: 100 },
  { title: '时间', dataIndex: 'createdAt', width: 180 },
  { title: '操作', key: 'action', width: 100 },
];

async function loadData() {
  loading.value = true;
  try {
    const params: Record<string, any> = {
      page: filters.page,
      pageSize: filters.pageSize,
    };
    if (filters.keyword) params.keyword = filters.keyword;
    if (filters.dateRange && filters.dateRange.length === 2) {
      params.startDate = dayjs(filters.dateRange[0]).format('YYYY-MM-DD');
      params.endDate = dayjs(filters.dateRange[1]).format('YYYY-MM-DD');
    }
    const result = await listVisits(params);
    if (Array.isArray(result) && result.length === 2 && Array.isArray(result[0])) {
      dataSource.value = result[0];
      total.value = result[1];
    } else if (Array.isArray(result)) {
      dataSource.value = result as Visit[];
      total.value = result.length;
    }
  } catch (e: any) {
    message.error(e.message || '加载失败');
  } finally {
    loading.value = false;
  }
}

function resetFilters() {
  filters.keyword = '';
  filters.dateRange = [];
  filters.page = 1;
  loadData();
}

function handleTableChange(pag: any) {
  filters.page = pag.current;
  filters.pageSize = pag.pageSize;
  loadData();
}

function goNew() {
  router.push('/pc/visits/new');
}

function goDetail(id: number) {
  router.push(`/pc/visits/${id}`);
}

onMounted(() => {
  filters.page = 1;
  filters.pageSize = 20;
  loadData();
});
</script>

<style scoped>
.visit-list {
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
</style>
