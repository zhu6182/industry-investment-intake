<template>
  <div class="my-referrals">
    <div class="header">
      <h2>我的推荐</h2>
    </div>

    <a-row :gutter="16" style="margin-bottom: 16px">
      <a-col :span="8">
        <a-statistic title="推荐企业数" :value="stats.totalCount" suffix="家" />
      </a-col>
      <a-col :span="8">
        <a-statistic title="已落地" :value="stats.landedCount" suffix="家" :value-style="{ color: '#3f8600' }" />
      </a-col>
      <a-col :span="8">
        <a-statistic title="落地总面积" :value="stats.totalArea" suffix="㎡" :value-style="{ color: '#1677ff' }" />
      </a-col>
    </a-row>

    <a-tabs v-model:activeKey="activeTab">
      <a-tab-pane key="list" tab="推荐记录">
        <a-card>
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
                <a-tag :color="statusColors[record.intake?.status || 'pending']">
                  {{ statusText[record.intake?.status || 'pending'] }}
                </a-tag>
              </template>
              <template v-else-if="column.key === 'action'">
                <a-button type="link" size="small" @click="goDetail(record.intakeId)">查看进件</a-button>
              </template>
            </template>
          </a-table>
        </a-card>
      </a-tab-pane>

      <a-tab-pane key="rank-count" tab="排行榜（推荐数）">
        <a-card>
          <a-table :columns="rankColumns" :data-source="countRankList" :loading="countLoading" row-key="userId" :pagination="false">
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'rank'">
                <a-tag v-if="record.rank <= 3" :color="['gold', 'silver', '#cd7f32'][record.rank - 1]">{{ record.rank }}</a-tag>
                <span v-else>{{ record.rank }}</span>
                <span v-if="record.isMe" style="color: #1677ff; margin-left: 8px">(我)</span>
              </template>
            </template>
          </a-table>
        </a-card>
      </a-tab-pane>

      <a-tab-pane key="rank-area" tab="排行榜（面积）">
        <a-card>
          <a-table :columns="rankColumns" :data-source="areaRankList" :loading="areaLoading" row-key="userId" :pagination="false">
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'rank'">
                <a-tag v-if="record.rank <= 3" :color="['gold', 'silver', '#cd7f32'][record.rank - 1]">{{ record.rank }}</a-tag>
                <span v-else>{{ record.rank }}</span>
                <span v-if="record.isMe" style="color: #1677ff; margin-left: 8px">(我)</span>
              </template>
            </template>
          </a-table>
        </a-card>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import {
  getMyReferrals,
  getMyReferralStats,
  type ReferralItem,
  type ReferralStats,
} from '@/api/modules/referrals';
import { rankByCount, rankByArea, getMyRank } from '@/api/modules/rankings';

const router = useRouter();
const activeTab = ref('list');

const stats = reactive<ReferralStats>({ totalCount: 0, landedCount: 0, totalArea: 0 });
const loading = ref(false);
const dataSource = ref<ReferralItem[]>([]);
const pagination = reactive({ current: 1, pageSize: 20, total: 0 });

const columns = [
  { title: 'ID', dataIndex: 'id', width: 70 },
  { title: '企业名称', dataIndex: ['intake', 'companyName'], width: 220 },
  { title: '面积(㎡)', dataIndex: ['intake', 'area'], width: 120 },
  { title: '类型', dataIndex: 'type', width: 100 },
  { title: '状态', key: 'status', width: 120 },
  { title: '推荐时间', dataIndex: 'createdAt', width: 180 },
  { title: '操作', key: 'action', width: 120 },
];

const statusText: Record<string, string> = {
  pending: '待审核',
  approved: '已通过',
  assigned: '已分配',
  following: '跟进中',
  landed: '已落地',
  lost: '已流失',
  rejected: '已驳回',
};
const statusColors: Record<string, string> = {
  pending: 'orange',
  approved: 'blue',
  assigned: 'cyan',
  following: 'purple',
  landed: 'green',
  lost: 'red',
  rejected: 'red',
};

async function loadList() {
  loading.value = true;
  try {
    const res = await getMyReferrals({ page: pagination.current, limit: pagination.pageSize });
    dataSource.value = res.list;
    pagination.total = res.total;
  } catch (e: any) {
    message.error(e?.message || '加载失败');
  } finally {
    loading.value = false;
  }
}

async function loadStats() {
  try {
    const s = await getMyReferralStats();
    Object.assign(stats, s);
  } catch {}
}

function handleTableChange(pag: any) {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  loadList();
}

function goDetail(id: number) {
  router.push(`/pc/intakes/${id}`);
}

const countRankList = ref<any[]>([]);
const areaRankList = ref<any[]>([]);
const countLoading = ref(false);
const areaLoading = ref(false);

const rankColumns = [
  { title: '排名', key: 'rank', width: 100 },
  { title: '姓名', dataIndex: 'userName' as any, width: 200 },
  { title: '推荐数', dataIndex: 'count' as any, width: 120 },
  { title: '落地总面积(㎡)', dataIndex: 'totalArea' as any, width: 160 },
];

async function loadCountRank() {
  countLoading.value = true;
  try {
    const [list, my] = await Promise.all([rankByCount(50), getMyRank()]);
    const enriched = list.map((r, i) => ({ ...r, rank: i + 1, isMe: r.userId === my.byCount.me.userId }));
    const myEntry = { ...my.byCount.me, rank: my.byCount.rank, isMe: true } as any;
    if (!enriched.some((r: any) => r.isMe) && myEntry.rank) {
      enriched.push(myEntry);
    }
    countRankList.value = enriched;
  } catch {}
  countLoading.value = false;
}

async function loadAreaRank() {
  areaLoading.value = true;
  try {
    const [list, my] = await Promise.all([rankByArea(50), getMyRank()]);
    const enriched = list.map((r, i) => ({ ...r, rank: i + 1, isMe: r.userId === my.byArea.me.userId }));
    const myEntry = { ...my.byArea.me, rank: my.byArea.rank, isMe: true } as any;
    if (!enriched.some((r: any) => r.isMe) && myEntry.rank) {
      enriched.push(myEntry);
    }
    areaRankList.value = enriched;
  } catch {}
  areaLoading.value = false;
}

onMounted(() => {
  loadList();
  loadStats();
  loadCountRank();
  loadAreaRank();
});
</script>

<style scoped>
.my-referrals .header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
</style>
