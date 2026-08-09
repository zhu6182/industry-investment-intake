<template>
  <div class="team-dashboard">
    <h2>团队工作台</h2>

    <a-row :gutter="16" class="stats-row">
      <a-col :span="8">
        <a-card class="stat-card">
          <div class="stat-label">总企业数</div>
          <div class="stat-value">{{ teamData.totalIntakes || 0 }}</div>
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card class="stat-card">
          <div class="stat-label">本月跟进</div>
          <div class="stat-value">{{ teamData.followUpThisMonth || 0 }}</div>
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card class="stat-card">
          <div class="stat-label">本月拜访</div>
          <div class="stat-value">{{ teamData.visitThisMonth || 0 }}</div>
        </a-card>
      </a-col>
    </a-row>

    <a-card title="团队企业明细">
      <a-table
        :columns="columns"
        :data-source="memberList"
        :pagination="{ pageSize: 20 }"
        row-key="intakeId"
        size="middle"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="(statusMap as any)[record.status]?.color">
              {{ (statusMap as any)[record.status]?.text }}
            </a-tag>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { statusMap } from '@/api/modules/intakes';
import { getTeamStats } from '@/api/modules/timeline';

const teamData = ref<any>({});
const memberList = computed(() => teamData.value.memberSummary || []);

const columns = [
  { title: '企业名称', dataIndex: 'companyName', key: 'companyName', width: 200 },
  { title: '状态', key: 'status', width: 100 },
  { title: '面积(㎡)', dataIndex: 'area', key: 'area', width: 120 },
  { title: '负责人员ID', dataIndex: 'assignedToId', key: 'assignedToId', width: 120 },
];

onMounted(async () => {
  try {
    teamData.value = await getTeamStats();
  } catch {
    teamData.value = {};
  }
});
</script>

<style scoped>
.team-dashboard {
  padding: 24px;
}
.stats-row {
  margin-bottom: 16px;
}
.stat-card {
  text-align: center;
}
.stat-label {
  color: #8c8c8c;
  font-size: 13px;
}
.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #1677ff;
  margin-top: 8px;
}
</style>
