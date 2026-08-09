<template>
  <div class="intake-list">
    <div class="header">
      <h2>进件管理</h2>
      <a-button type="primary" @click="goNew">
        <template #icon><PlusOutlined /></template>
        新建进件
      </a-button>
    </div>

    <a-card class="filter-card">
      <a-form layout="inline" :model="filters" @finish="loadData">
        <a-form-item label="关键词">
          <a-input
            v-model:value="filters.keyword"
            placeholder="企业名称/信用代码/法人"
            allow-clear
            style="width: 240px"
          />
        </a-form-item>
        <a-form-item label="状态">
          <a-select
            v-model:value="filters.status"
            placeholder="全部"
            allow-clear
            style="width: 140px"
          >
            <a-select-option
              v-for="(v, k) in statusMap"
              :key="k"
              :value="k"
            >
              {{ v.text }}
            </a-select-option>
          </a-select>
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
          <template v-if="column.key === 'status'">
            <a-tag :color="statusMap[(record as Intake).status]?.color">
              {{ statusMap[(record as Intake).status]?.text }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'tycValid'">
            <a-tag v-if="record.tycValidation?.isValid" color="green">通过</a-tag>
            <a-tag v-else-if="record.tycValidation" color="red">未通过</a-tag>
            <span v-else>-</span>
          </template>
          <template v-else-if="column.key === 'action'">
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
import {
  listIntakes,
  statusMap,
  type Intake,
  type IntakeStatus,
} from '@/api/modules/intakes';

const router = useRouter();
const loading = ref(false);
const dataSource = ref<Intake[]>([]);
const total = ref(0);

const filters = reactive({
  keyword: '',
  status: undefined as IntakeStatus | undefined,
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
  { title: '企业名称', dataIndex: 'companyName', width: 240 },
  { title: '统一社会信用代码', dataIndex: 'creditCode', width: 200 },
  { title: '法人', dataIndex: 'legalPerson', width: 100 },
  { title: '行业', dataIndex: 'industry', width: 140 },
  { title: '状态', key: 'status', width: 100 },
  { title: '核名结果', key: 'tycValid', width: 100 },
  { title: '申请人', dataIndex: ['applicant', 'name'], width: 100 },
  { title: '创建时间', dataIndex: 'createdAt', width: 180 },
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
    if (filters.status) params.status = filters.status;
    if (filters.dateRange && filters.dateRange.length === 2) {
      params.startDate = dayjs(filters.dateRange[0]).format('YYYY-MM-DD');
      params.endDate = dayjs(filters.dateRange[1]).format('YYYY-MM-DD');
    }
    const [list, count] = await listIntakes(params);
    dataSource.value = list;
    total.value = count;
  } catch (e: any) {
    message.error(e.message || '加载失败');
  } finally {
    loading.value = false;
  }
}

function resetFilters() {
  filters.keyword = '';
  filters.status = undefined;
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
  router.push('/pc/intakes/new');
}

function goDetail(id: number) {
  router.push(`/pc/intakes/${id}`);
}

onMounted(() => {
  filters.page = 1;
  filters.pageSize = 20;
  loadData();
});
</script>

<style scoped>
.intake-list {
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
