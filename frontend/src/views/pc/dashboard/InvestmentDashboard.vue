<template>
  <div class="pc-dashboard-layout">
    <a-tabs v-model:active-key="activeTab" class="dashboard-tabs">
      <a-tab-pane key="intakes" tab="我的企业">
        <div class="content">
          <a-row :gutter="16" class="stats-row">
            <a-col :xs="24" :sm="12" :md="6">
              <a-card class="stat-card">
                <div class="stat-label">待处理</div>
                <div class="stat-value">{{ stats.pendingCount }}</div>
              </a-card>
            </a-col>
            <a-col :xs="24" :sm="12" :md="6">
              <a-card class="stat-card">
                <div class="stat-label">活跃企业</div>
                <div class="stat-value">{{ stats.myActiveCount }}</div>
              </a-card>
            </a-col>
            <a-col :xs="24" :sm="12" :md="6">
              <a-card class="stat-card">
                <div class="stat-label">本月跟进</div>
                <div class="stat-value">{{ stats.followUpThisMonth }}</div>
              </a-card>
            </a-col>
            <a-col :xs="24" :sm="12" :md="6">
              <a-card class="stat-card">
                <div class="stat-label">本月拜访</div>
                <div class="stat-value">{{ stats.visitThisMonth }}</div>
              </a-card>
            </a-col>
          </a-row>

          <a-card title="快捷操作" class="action-card">
            <a-button type="primary" @click="showFollowUpList = true">
              <template #icon><MessageOutlined /></template>
              查看我的跟进
            </a-button>
            <a-button style="margin-left: 12px" @click="showVisitList = true">
              <template #icon><EnvironmentOutlined /></template>
              查看我的拜访
            </a-button>
          </a-card>

          <a-card
            title="我的企业"
            class="intake-card"
            :extra="
              h('a', { href: '/pc/intakes', style: 'color: #1677ff' }, '查看全部 →')
            "
          >
            <a-table
              :columns="intakeColumns"
              :data-source="intakes"
              :loading="intakeLoading"
              :pagination="{ pageSize: 10 }"
              row-key="id"
              size="middle"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'status'">
                  <a-tag :color="(statusMap as any)[record.status]?.color">
                    {{ (statusMap as any)[record.status]?.text }}
                  </a-tag>
                </template>
                <template v-else-if="column.key === 'followup'">
                  <a-button
                    type="link"
                    size="small"
                    @click="openFollowUpModal(record)"
                  >
                    记录跟进
                  </a-button>
                </template>
                <template v-else-if="column.key === 'visit'">
                  <a-button type="link" size="small" @click="openVisitModal(record)">
                    记录拜访
                  </a-button>
                </template>
                <template v-else-if="column.key === 'detail'">
                  <a
                    :href="`/pc/intakes/${record.id}`"
                    style="color: #1677ff"
                  >
                    详情
                  </a>
                </template>
              </template>
            </a-table>
          </a-card>
        </div>
      </a-tab-pane>

      <a-tab-pane key="followups" tab="跟进记录">
        <div class="content">
          <a-card title="我的跟进记录" class="intake-card">
            <a-timeline>
              <a-timeline-item
                v-for="fu in myFollowUps"
                :key="fu.id"
                :color="(resultMap as any)[fu.result]?.color"
              >
                <div class="fu-item">
                  <div class="fu-title">
                    {{ (methodMap as any)[fu.method] }} - {{ fu.content.substring(0, 50) }}
                    {{ fu.content.length > 50 ? '...' : '' }}
                  </div>
                  <div class="fu-meta">
                    {{ formatDate(fu.followDate) }} · {{ fu.operator?.name }}
                  </div>
                  <a-tag :color="(resultMap as any)[fu.result]?.color">
                    {{ (resultMap as any)[fu.result]?.text }}
                  </a-tag>
                </div>
              </a-timeline-item>
              <a-empty v-if="!myFollowUps.length" description="暂无跟进记录" />
            </a-timeline>
          </a-card>
        </div>
      </a-tab-pane>

      <a-tab-pane key="visits" tab="拜访记录">
        <div class="content">
          <a-card title="我的拜访记录" class="intake-card">
            <a-timeline>
              <a-timeline-item
                v-for="v in myVisits"
                :key="v.id"
                color="geekblue"
              >
                <div class="fu-item">
                  <div class="fu-title">{{ v.visitLocation }}</div>
                  <div class="fu-meta">
                    {{ formatDate(v.visitDate) }} · {{ v.operator?.name }}
                    <span v-if="v.area"> · {{ v.area }} ㎡</span>
                  </div>
                  <div class="fu-desc">{{ v.visitContent.substring(0, 80) }}...</div>
                </div>
              </a-timeline-item>
              <a-empty v-if="!myVisits.length" description="暂无拜访记录" />
            </a-timeline>
          </a-card>
        </div>
      </a-tab-pane>

      <a-tab-pane key="stats" tab="数据统计">
        <div class="content">
          <a-card title="数据统计" class="intake-card">
            <p style="color: #8c8c8c;">更多数据图表请前往 <a href="/pc/bi" style="color: #1677ff">数据大屏</a> 查看。</p>
          </a-card>
        </div>
      </a-tab-pane>
    </a-tabs>

    <FollowUpModal
      v-model:open="followUpModalOpen"
      :intake-id="currentIntakeId"
      @success="loadIntakes"
    />
    <VisitModal
      v-model:open="visitModalOpen"
      :intake-id="currentIntakeId"
      @success="loadIntakes"
    />

    <a-drawer v-model:open="showFollowUpList" title="我的跟进" width="600">
      <a-timeline>
        <a-timeline-item
          v-for="fu in myFollowUps"
          :key="fu.id"
          :color="(resultMap as any)[fu.result]?.color"
        >
          <div class="fu-item">
            <div class="fu-title">
              {{ (methodMap as any)[fu.method] }} - {{ fu.content.substring(0, 50) }}
              {{ fu.content.length > 50 ? '...' : '' }}
            </div>
            <div class="fu-meta">
              {{ formatDate(fu.followDate) }} · {{ fu.operator?.name }}
            </div>
            <a-tag :color="(resultMap as any)[fu.result]?.color">
              {{ (resultMap as any)[fu.result]?.text }}
            </a-tag>
          </div>
        </a-timeline-item>
      </a-timeline>
    </a-drawer>

    <a-drawer v-model:open="showVisitList" title="我的拜访" width="600">
      <a-timeline>
        <a-timeline-item
          v-for="v in myVisits"
          :key="v.id"
          color="geekblue"
        >
          <div class="fu-item">
            <div class="fu-title">{{ v.visitLocation }}</div>
            <div class="fu-meta">
              {{ formatDate(v.visitDate) }} · {{ v.operator?.name }}
              <span v-if="v.area"> · {{ v.area }} ㎡</span>
            </div>
            <div class="fu-desc">{{ v.visitContent.substring(0, 80) }}...</div>
          </div>
        </a-timeline-item>
      </a-timeline>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue';
import { message } from 'ant-design-vue';
import {
  MessageOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons-vue';
import dayjs from 'dayjs';
import { listIntakes, statusMap, type Intake } from '@/api/modules/intakes';
import { listMyFollowUps, methodMap, resultMap, type FollowUp } from '@/api/modules/follow-ups';
import { listMyVisits, type Visit } from '@/api/modules/visits';
import { getDashboardStats, type DashboardStats } from '@/api/modules/timeline';
import FollowUpModal from '@/components/common/FollowUpModal.vue';
import VisitModal from '@/components/common/VisitModal.vue';

const activeTab = ref('intakes');
const intakeLoading = ref(false);
const intakes = ref<Intake[]>([]);
const stats = ref<DashboardStats>({
  pendingCount: 0,
  myActiveCount: 0,
  followUpThisMonth: 0,
  visitThisMonth: 0,
});

const followUpModalOpen = ref(false);
const visitModalOpen = ref(false);
const currentIntakeId = ref(0);

const showFollowUpList = ref(false);
const showVisitList = ref(false);
const myFollowUps = ref<FollowUp[]>([]);
const myVisits = ref<Visit[]>([]);

function formatDate(d?: string) {
  return d ? dayjs(d).format('YYYY-MM-DD HH:mm') : '-';
}

const intakeColumns = [
  { title: '企业名称', dataIndex: 'companyName', key: 'companyName', width: 200 },
  { title: '状态', key: 'status', width: 100 },
  { title: '行业', dataIndex: 'industry', key: 'industry', width: 120 },
  { title: '面积(㎡)', dataIndex: 'area', key: 'area', width: 100 },
  { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 160, customRender: ({ record }: any) => formatDate(record.createdAt) },
  { title: '', key: 'followup', width: 120 },
  { title: '', key: 'visit', width: 120 },
  { title: '', key: 'detail', width: 80 },
];

function openFollowUpModal(record: Intake) {
  currentIntakeId.value = record.id;
  followUpModalOpen.value = true;
}

function openVisitModal(record: Intake) {
  currentIntakeId.value = record.id;
  visitModalOpen.value = true;
}

async function loadIntakes() {
  intakeLoading.value = true;
  try {
    const data = await listIntakes({ page: 1, pageSize: 50 });
    const [items] = Array.isArray(data) ? (data as any) : [[]];
    intakes.value = items || [];
  } catch (e: any) {
    message.error(e.message || '加载失败');
  } finally {
    intakeLoading.value = false;
  }
}

async function loadStats() {
  try {
    stats.value = await getDashboardStats();
  } catch (e) {
    // silent
  }
}

async function loadMyFollowUps() {
  try {
    const data = await listMyFollowUps({ pageSize: 10 });
    myFollowUps.value = Array.isArray(data) ? data : [];
  } catch {
    // silent
  }
}

async function loadMyVisits() {
  try {
    const data = await listMyVisits({ pageSize: 10 });
    myVisits.value = Array.isArray(data) ? data : [];
  } catch {
    // silent
  }
}

onMounted(() => {
  loadIntakes();
  loadStats();
  loadMyFollowUps();
  loadMyVisits();
});
</script>

<style scoped>
.pc-dashboard-layout {
  min-height: calc(100vh - 64px);
  width: 100%;
  background: #f5f7fa;
  padding: 0 16px;
}
.dashboard-tabs {
  background: #fff;
  padding: 8px 16px 0;
  border-radius: 6px;
  margin-top: 16px;
}
.content {
  padding: 20px 0;
  width: 100%;
  min-width: 0;
}
.stats-row {
  margin-bottom: 16px;
  width: 100%;
}
.stat-card {
  text-align: center;
  border-radius: 6px;
  transition: all 0.2s;
}
.stat-card :deep(.ant-card-body) {
  padding: 20px 16px;
}
.stat-card:hover {
  box-shadow: 0 4px 16px rgba(22, 119, 255, 0.12);
  transform: translateY(-2px);
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
  font-family: 'Consolas', monospace;
}
.action-card {
  margin-bottom: 16px;
  border-radius: 6px;
}
.intake-card {
  margin-bottom: 16px;
  border-radius: 6px;
}
.fu-item .fu-title {
  font-weight: 500;
}
.fu-item .fu-meta {
  color: #8c8c8c;
  font-size: 12px;
  margin: 4px 0;
}
.fu-item .fu-desc {
  color: #595959;
  font-size: 13px;
}
</style>
