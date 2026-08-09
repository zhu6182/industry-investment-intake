<template>
  <div class="mobile-intake-detail">
    <van-nav-bar title="进件详情" left-arrow @click-left="goBack" />

    <van-loading v-if="loading" class="loading" type="spinner" />

    <template v-else-if="detail">
      <van-tabs v-model:active="activeTab" sticky>
        <van-tab title="信息">
          <van-cell-group inset title="企业信息">
            <van-cell title="企业名称" :value="detail.companyName" />
            <van-cell title="状态">
              <template #value>
                <van-tag :type="tagTypeMap[detail.status]" round>{{ statusTextMap[detail.status] }}</van-tag>
              </template>
            </van-cell>
            <van-cell title="信用代码" :value="detail.creditCode || '-'" />
            <van-cell title="法人" :value="detail.legalPerson || '-'" />
            <van-cell title="成立日期" :value="detail.establishDate || '-'" />
            <van-cell title="行业" :value="detail.industry || '-'" />
            <van-cell title="面积(㎡)" :value="detail.area ? String(detail.area) : '-'" />
            <van-cell title="申请人" :value="detail.applicant?.name || '-'" />
            <van-cell title="创建时间" :value="formatDate(detail.createdAt)" />
          </van-cell-group>

          <van-cell-group inset title="天眼查核名">
            <van-cell v-if="detail.tycValidation">
              <template #title>
                <van-tag :type="detail.tycValidation.isValid ? 'success' : 'danger'" round>
                  {{ detail.tycValidation.isValid ? '核名通过' : '核名未通过' }}
                </van-tag>
              </template>
              <template #value>
                {{ detail.tycValidation.reasons?.join('；') || '' }}
              </template>
            </van-cell>
            <van-empty v-else description="未执行核名" />
          </van-cell-group>

          <van-cell-group v-if="parsedShareholders.length > 0" inset title="股东结构">
            <van-cell
              v-for="(sh, idx) in parsedShareholders"
              :key="idx"
              :title="sh.name"
              :label="`持股比例: ${sh.ratio || '-'} | ${sh.subscribeAmount || ''}`"
            />
          </van-cell-group>

          <van-cell-group v-if="detail.files && detail.files.length > 0" inset title="文件">
            <van-cell
              v-for="f in detail.files"
              :key="f.id"
              :title="f.originalName"
              :label="`${(f.size / 1024).toFixed(1)} KB | ${fileTypeMap[f.type]}`"
              is-link
              @click="openFile(f.url)"
            />
          </van-cell-group>
        </van-tab>

        <van-tab title="时间线">
          <van-loading v-if="timelineLoading" class="loading" type="spinner" />
          <van-steps v-else direction="vertical" class="tl-steps">
            <van-step
              v-for="(event, idx) in timelineEvents"
              :key="idx"
              :active="true"
            >
              <div class="tl-item">
                <van-tag :type="vanTagType[event.type]" plain size="medium">
                  {{ eventTypeLabel[event.type] }}
                </van-tag>
                <div class="tl-title">{{ event.title }}</div>
                <div v-if="event.description" class="tl-desc">{{ event.description }}</div>
                <div class="tl-meta">
                  {{ formatDate(event.time) }} · {{ event.actor }}
                </div>
              </div>
            </van-step>
          </van-steps>
          <van-empty v-if="!timelineLoading && timelineEvents.length === 0" description="暂无记录" />
        </van-tab>

        <van-tab title="跟进">
          <van-loading v-if="followupLoading" class="loading" type="spinner" />
          <van-cell-group v-else-if="followUps.length > 0" inset>
            <van-cell v-for="fu in followUps" :key="fu.id">
              <template #title>
                {{ methodMap[fu.method] }} · {{ resultTextMap[fu.result] }}
              </template>
              <template #label>
                <div class="fu-card">
                  <p>{{ fu.content }}</p>
                  <p v-if="fu.nextStep" class="fu-next">下一步：{{ fu.nextStep }}</p>
                  <p class="fu-meta">{{ formatDate(fu.followDate) }} · {{ fu.operator?.name }}</p>
                </div>
              </template>
            </van-cell>
          </van-cell-group>
          <van-empty v-else description="暂无跟进记录" />

          <div class="action-bar">
            <van-button type="primary" block @click="goFollowUpForm">记录跟进</van-button>
          </div>
        </van-tab>

        <van-tab title="拜访">
          <van-loading v-if="visitLoading" class="loading" type="spinner" />
          <van-cell-group v-else-if="visits.length > 0" inset>
            <van-cell v-for="v in visits" :key="v.id">
              <template #title>
                {{ v.visitLocation }}
                <span v-if="v.area" class="area-tag">{{ v.area }} ㎡</span>
              </template>
              <template #label>
                <div class="fu-card">
                  <p>{{ v.visitContent }}</p>
                  <p class="fu-meta">
                    {{ formatDate(v.visitDate) }} · {{ v.operator?.name }}
                    <span v-if="v.region"> · {{ v.region.name }}</span>
                  </p>
                </div>
              </template>
            </van-cell>
          </van-cell-group>
          <van-empty v-else description="暂无拜访记录" />

          <div class="action-bar">
            <van-button type="success" block @click="goVisitForm">记录拜访</van-button>
          </div>
        </van-tab>
      </van-tabs>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { showToast } from 'vant';
import dayjs from 'dayjs';
import {
  getIntake,
  type Intake,
} from '@/api/modules/intakes';
import {
  getFollowUpsByIntake,
  methodMap,
  type FollowUp,
} from '@/api/modules/follow-ups';
import { getVisitsByIntake, type Visit } from '@/api/modules/visits';
import { getTimeline, type TimelineEvent } from '@/api/modules/timeline';

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

const activeTab = ref(0);

const fileTypeMap: Record<string, string> = {
  application: '申请表',
  ppt: 'PPT',
  data_sheet: '资料表',
  photo: '照片',
};

const statusTextMap: Record<string, string> = {
  pending: '待审核',
  approved: '已通过',
  assigned: '已分配',
  following: '跟进中',
  landed: '已落地',
  lost: '已流失',
  rejected: '已驳回',
};

const tagTypeMap: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'default'> = {
  pending: 'warning',
  approved: 'success',
  assigned: 'primary',
  following: 'primary',
  landed: 'success',
  lost: 'default',
  rejected: 'danger',
};

const resultTextMap: Record<string, string> = {
  undecided: '未定',
  interested: '有意向',
  negotiating: '洽谈中',
  pending_decision: '待决策',
  not_interested: '无意向',
};

const eventTypeLabel: Record<string, string> = {
  intake_created: '进件',
  tyc_verified: '核名',
  review: '审核',
  report_generated: '报告',
  follow_up: '跟进',
  visit: '拜访',
};

const vanTagType: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'default'> = {
  intake_created: 'primary',
  tyc_verified: 'warning',
  review: 'success',
  report_generated: 'primary',
  follow_up: 'success',
  visit: 'primary',
};

const parsedShareholders = computed(() => {
  if (!detail.value?.shareholders) return [];
  try {
    return JSON.parse(detail.value.shareholders);
  } catch {
    return [];
  }
});

function formatDate(d?: string) {
  return d ? dayjs(d).format('YYYY-MM-DD HH:mm') : '-';
}

function openFile(url: string) {
  const fullUrl = url.startsWith('http') ? url : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}${url}`;
  window.open(fullUrl, '_blank');
}

function goFollowUpForm() {
  router.push(`/mobile/follow-ups/new?intakeId=${intakeId}`);
}

function goVisitForm() {
  router.push(`/mobile/visits/new?intakeId=${intakeId}`);
}

async function loadData() {
  loading.value = true;
  try {
    detail.value = await getIntake(intakeId);
  } catch (e: any) {
    showToast(e.message || '加载失败');
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
  if (tab === 1 && timelineEvents.value.length === 0) loadTimeline();
  if (tab === 2 && followUps.value.length === 0) loadFollowUps();
  if (tab === 3 && visits.value.length === 0) loadVisits();
});

function goBack() {
  router.back();
}

onMounted(loadData);
</script>

<style scoped>
.mobile-intake-detail {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 80px;
}
.loading {
  display: flex;
  justify-content: center;
  padding: 80px 0;
}
.tl-steps {
  padding: 16px;
}
.tl-item {
  padding-bottom: 16px;
}
.tl-title {
  font-weight: 500;
  margin-top: 6px;
}
.tl-desc {
  font-size: 13px;
  color: #595959;
  margin: 4px 0;
}
.tl-meta {
  font-size: 12px;
  color: #969799;
}
.fu-card p {
  margin: 4px 0;
  white-space: pre-wrap;
}
.fu-next {
  color: #1677ff;
}
.fu-meta {
  color: #969799;
  font-size: 12px;
}
.area-tag {
  margin-left: 8px;
  color: #1677ff;
  font-size: 12px;
}
.action-bar {
  padding: 16px;
}
</style>
