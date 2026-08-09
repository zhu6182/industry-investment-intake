<template>
  <div class="intake-detail">
    <div class="page-header">
      <a-button @click="goBack">
        <template #icon><ArrowLeftOutlined /></template>
        返回
      </a-button>
      <h2>进件详情 #{{ intakeId }}</h2>
      <a-button type="primary" @click="followUpModalOpen = true">记录跟进</a-button>
      <a-button @click="visitModalOpen = true">记录拜访</a-button>
    </div>

    <a-spin :spinning="loading">
      <template v-if="detail">
        <a-tabs v-model:active-key="activeTab">
          <a-tab-pane key="info" tab="企业信息">
            <a-row :gutter="16">
              <a-col :span="16">
                <a-card title="企业信息" class="info-card">
                  <a-descriptions :column="2" bordered>
                    <a-descriptions-item label="企业名称">{{ detail.companyName }}</a-descriptions-item>
                    <a-descriptions-item label="状态">
                      <a-tag :color="statusMap[detail.status]?.color">
                        {{ statusMap[detail.status]?.text }}
                      </a-tag>
                    </a-descriptions-item>
                    <a-descriptions-item label="统一社会信用代码">{{ detail.creditCode || '-' }}</a-descriptions-item>
                    <a-descriptions-item label="法人">{{ detail.legalPerson || '-' }}</a-descriptions-item>
                    <a-descriptions-item label="成立日期">{{ detail.establishDate || '-' }}</a-descriptions-item>
                    <a-descriptions-item label="行业">{{ detail.industry || '-' }}</a-descriptions-item>
                    <a-descriptions-item label="入驻面积">{{ detail.area ? `${detail.area} ㎡` : '-' }}</a-descriptions-item>
                    <a-descriptions-item label="申请园区ID">{{ detail.applicationRegionId || '-' }}</a-descriptions-item>
                    <a-descriptions-item label="申请人">{{ detail.applicant?.name || '-' }}</a-descriptions-item>
                    <a-descriptions-item label="分配给">{{ detail.assignedTo?.name || '-' }}</a-descriptions-item>
                    <a-descriptions-item label="创建时间">{{ formatDate(detail.createdAt) }}</a-descriptions-item>
                    <a-descriptions-item label="更新时间">{{ formatDate(detail.updatedAt) }}</a-descriptions-item>
                  </a-descriptions>

                  <div v-if="detail.shareholders" class="shareholders-section">
                    <h4>股东结构</h4>
                    <a-table
                      :columns="shColumns"
                      :data-source="parsedShareholders"
                      size="small"
                      :pagination="false"
                      row-key="name"
                    />
                  </div>
                </a-card>

                <a-card title="上传文件" class="files-card">
                  <a-empty v-if="!detail.files || detail.files.length === 0" description="暂无文件" />
                  <a-table v-else :columns="fileColumns" :data-source="detail.files" row-key="id">
                    <template #bodyCell="{ column, record }">
                      <template v-if="column.key === 'type'">
                        {{ fileTypeMap[record.type] }}
                      </template>
                      <template v-else-if="column.key === 'action'">
                        <a :href="fileUrl(record.url)" target="_blank">预览/下载</a>
                      </template>
                    </template>
                  </a-table>
                </a-card>
              </a-col>

              <a-col :span="8">
                <a-card title="天眼查核名结果" class="tyc-card">
                  <a-alert
                    v-if="detail.tycValidation"
                    :type="detail.tycValidation.isValid ? 'success' : 'error'"
                    :message="detail.tycValidation.isValid ? '核名通过' : '核名未通过'"
                    :description="detail.tycValidation.reasons?.join('；')"
                    show-icon
                  />
                  <a-empty v-else description="未执行核名" />

                  <a-divider v-if="detail.tycValidation?.company">企业信息</a-divider>
                  <a-descriptions
                    v-if="detail.tycValidation?.company"
                    :column="1"
                    size="small"
                    bordered
                  >
                    <a-descriptions-item label="企业名">{{ detail.tycValidation.company.name }}</a-descriptions-item>
                    <a-descriptions-item label="信用代码">{{ detail.tycValidation.company.creditCode || '-' }}</a-descriptions-item>
                    <a-descriptions-item label="法人">{{ detail.tycValidation.company.legalPerson || '-' }}</a-descriptions-item>
                    <a-descriptions-item label="成立日期">{{ detail.tycValidation.company.establishDate || '-' }}</a-descriptions-item>
                    <a-descriptions-item label="经营状态">{{ detail.tycValidation.company.status || '-' }}</a-descriptions-item>
                    <a-descriptions-item label="注册资本">{{ detail.tycValidation.company.registeredCapital || '-' }}</a-descriptions-item>
                    <a-descriptions-item label="行业">{{ detail.tycValidation.company.industry || '-' }}</a-descriptions-item>
                  </a-descriptions>
                </a-card>
              </a-col>
            </a-row>
          </a-tab-pane>

          <a-tab-pane key="timeline" tab="完整时间线">
            <a-spin :spinning="timelineLoading">
              <a-timeline class="full-timeline">
                <a-timeline-item
                  v-for="(event, idx) in timelineEvents"
                  :key="idx"
                  :color="eventColorMap[event.type] || 'blue'"
                >
                  <div class="tl-event">
                    <div class="tl-title">
                      <a-tag :color="eventColorMap[event.type] || 'blue'" class="tl-type-tag">
                        {{ eventTypeLabel[event.type] || event.type }}
                      </a-tag>
                      {{ event.title }}
                    </div>
                    <div class="tl-time">{{ formatDate(event.time) }}</div>
                    <div v-if="event.description" class="tl-desc">{{ event.description }}</div>
                    <div class="tl-actor">操作人：{{ event.actor }}</div>
                  </div>
                </a-timeline-item>
              </a-timeline>
            </a-spin>
          </a-tab-pane>

          <a-tab-pane key="followups" tab="跟进记录">
            <a-spin :spinning="followupLoading">
              <a-timeline v-if="followUps.length > 0">
                <a-timeline-item
                  v-for="fu in followUps"
                  :key="fu.id"
                  :color="resultMap[fu.result]?.color"
                >
                  <a-card size="small" class="fu-card">
                    <template #title>
                      {{ methodMap[fu.method] }} · {{ resultMap[fu.result]?.text }}
                    </template>
                    <p class="fu-content">{{ fu.content }}</p>
                    <p v-if="fu.nextStep" class="fu-nextstep">下一步：{{ fu.nextStep }}</p>
                    <p class="fu-meta">
                      {{ formatDate(fu.followDate) }} · {{ fu.operator?.name }}
                    </p>
                    <div v-if="fu.photos && fu.photos.length > 0" class="fu-photos">
                      <a-image
                        v-for="(p, i) in fu.photos"
                        :key="i"
                        :src="fileUrl(p)"
                        :width="80"
                        :height="80"
                        style="object-fit: cover; margin-right: 8px"
                      />
                    </div>
                  </a-card>
                </a-timeline-item>
              </a-timeline>
              <a-empty v-else description="暂无跟进记录" />
            </a-spin>
          </a-tab-pane>

          <a-tab-pane key="visits" tab="拜访记录">
            <a-spin :spinning="visitLoading">
              <a-timeline v-if="visits.length > 0">
                <a-timeline-item v-for="v in visits" :key="v.id" color="geekblue">
                  <a-card size="small" class="fu-card">
                    <template #title>
                      {{ v.visitLocation }}
                      <span v-if="v.area" style="margin-left: 12px; color: #1677ff">
                        {{ v.area }} ㎡
                      </span>
                    </template>
                    <p class="fu-content">{{ v.visitContent }}</p>
                    <p class="fu-meta">
                      {{ formatDate(v.visitDate) }} · {{ v.operator?.name }}
                      <span v-if="v.region"> · {{ v.region.name }}</span>
                    </p>
                    <div v-if="v.photos && v.photos.length > 0" class="fu-photos">
                      <a-image
                        v-for="(p, i) in v.photos"
                        :key="i"
                        :src="fileUrl(p)"
                        :width="80"
                        :height="80"
                        style="object-fit: cover; margin-right: 8px"
                      />
                    </div>
                  </a-card>
                </a-timeline-item>
              </a-timeline>
              <a-empty v-else description="暂无拜访记录" />
            </a-spin>
          </a-tab-pane>
        </a-tabs>
      </template>
    </a-spin>

    <FollowUpModal
      v-model:open="followUpModalOpen"
      :intake-id="intakeId"
      @success="loadFollowUps"
    />
    <VisitModal
      v-model:open="visitModalOpen"
      :intake-id="intakeId"
      @success="loadVisits"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { message } from 'ant-design-vue';
import { ArrowLeftOutlined } from '@ant-design/icons-vue';
import dayjs from 'dayjs';
import {
  getIntake,
  statusMap,
  type Intake,
} from '@/api/modules/intakes';
import {
  getFollowUpsByIntake,
  methodMap,
  resultMap,
  type FollowUp,
} from '@/api/modules/follow-ups';
import { getVisitsByIntake, type Visit } from '@/api/modules/visits';
import { getTimeline, type TimelineEvent } from '@/api/modules/timeline';
import FollowUpModal from '@/components/common/FollowUpModal.vue';
import VisitModal from '@/components/common/VisitModal.vue';

const router = useRouter();
const route = useRoute();
const intakeId = Number(route.params.id);
const loading = ref(false);
const timelineLoading = ref(false);
const followupLoading = ref(false);
const visitLoading = ref(false);

const detail = ref<Intake | null>(null);
const timelineEvents = ref<TimelineEvent[]>([]);
const followUps = ref<FollowUp[]>([]);
const visits = ref<Visit[]>([]);

const activeTab = ref('info');
const followUpModalOpen = ref(false);
const visitModalOpen = ref(false);

const fileTypeMap: Record<string, string> = {
  application: '申请表',
  ppt: 'PPT',
  data_sheet: '资料表',
  photo: '照片',
};

const eventColorMap: Record<string, string> = {
  intake_created: 'blue',
  tyc_verified: 'orange',
  review: 'purple',
  report_generated: 'cyan',
  follow_up: 'green',
  visit: 'geekblue',
};

const eventTypeLabel: Record<string, string> = {
  intake_created: '进件',
  tyc_verified: '核名',
  review: '审核',
  report_generated: '报告',
  follow_up: '跟进',
  visit: '拜访',
};

const parsedShareholders = computed(() => {
  if (!detail.value?.shareholders) return [];
  try {
    return JSON.parse(detail.value.shareholders);
  } catch {
    return [];
  }
});

const shColumns = [
  { title: '股东', dataIndex: 'name' },
  { title: '持股比例', dataIndex: 'ratio' },
  { title: '认缴金额', dataIndex: 'subscribeAmount' },
];

const fileColumns = [
  { title: '类型', key: 'type', width: 100 },
  { title: '文件名', dataIndex: 'originalName', ellipsis: true },
  { title: '大小', key: 'size', customRender: ({ record }: any) => (record.size / 1024).toFixed(1) + ' KB' },
  { title: '上传时间', key: 'uploadedAt', customRender: ({ record }: any) => formatDate(record.uploadedAt), width: 180 },
  { title: '操作', key: 'action', width: 120 },
];

function fileUrl(url: string): string {
  if (url.startsWith('http')) return url;
  return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}${url}`;
}

function formatDate(d?: string): string {
  return d ? dayjs(d).format('YYYY-MM-DD HH:mm') : '-';
}

async function loadData() {
  loading.value = true;
  try {
    detail.value = await getIntake(intakeId);
  } catch (e: any) {
    message.error(e.message || '加载失败');
  } finally {
    loading.value = false;
  }
}

async function loadTimeline() {
  timelineLoading.value = true;
  try {
    timelineEvents.value = await getTimeline(intakeId);
  } catch {
    timelineEvents.value = [];
  } finally {
    timelineLoading.value = false;
  }
}

async function loadFollowUps() {
  followupLoading.value = true;
  try {
    followUps.value = await getFollowUpsByIntake(intakeId);
  } catch {
    followUps.value = [];
  } finally {
    followupLoading.value = false;
  }
}

async function loadVisits() {
  visitLoading.value = true;
  try {
    visits.value = await getVisitsByIntake(intakeId);
  } catch {
    visits.value = [];
  } finally {
    visitLoading.value = false;
  }
}

watch(activeTab, (tab) => {
  if (tab === 'timeline' && timelineEvents.value.length === 0) loadTimeline();
  if (tab === 'followups' && followUps.value.length === 0) loadFollowUps();
  if (tab === 'visits' && visits.value.length === 0) loadVisits();
});

function goBack() {
  router.back();
}

onMounted(loadData);
</script>

<style scoped>
.intake-detail {
  padding: 24px;
}
.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}
.page-header h2 {
  margin: 0;
  flex: 1;
}
.info-card {
  margin-bottom: 16px;
}
.files-card {
  margin-bottom: 16px;
}
.tyc-card {
  margin-bottom: 16px;
}
.shareholders-section {
  margin-top: 24px;
}
.shareholders-section h4 {
  margin-bottom: 12px;
}
.full-timeline {
  margin-top: 16px;
}
.tl-event .tl-title {
  font-weight: 500;
}
.tl-event .tl-time {
  color: #8c8c8c;
  font-size: 12px;
  margin: 4px 0;
}
.tl-event .tl-desc {
  color: #595959;
  font-size: 13px;
}
.tl-event .tl-actor {
  color: #8c8c8c;
  font-size: 12px;
  margin-top: 4px;
}
.tl-type-tag {
  margin-right: 8px;
}
.fu-card {
  margin-bottom: 8px;
}
.fu-content {
  margin: 0 0 8px 0;
  white-space: pre-wrap;
}
.fu-nextstep {
  margin: 0 0 8px 0;
  color: #1677ff;
}
.fu-meta {
  margin: 0;
  color: #8c8c8c;
  font-size: 12px;
}
.fu-photos {
  margin-top: 8px;
}
</style>
