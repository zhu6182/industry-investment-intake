<template>
  <div class="mobile-home">
    <van-nav-bar title="招商工作台" />

    <van-tabs v-model:active="activeTab" sticky>
      <van-tab title="企业">
        <van-pull-refresh v-model="refreshing" @refresh="loadAll">
          <van-list
            v-model:loading="loading"
            :finished="finished"
            finished-text="没有更多了"
            @load="loadIntakes"
          >
            <van-cell
              v-for="item in intakes"
              :key="item.id"
              :title="item.companyName"
              :label="`${industryText(item.industry)} | ${item.area || 0} ㎡`"
              is-link
              @click="goDetail(item.id)"
            >
              <template #right-icon>
                <van-tag :type="tagTypeMap[item.status]" round>
                  {{ statusTextMap[item.status] }}
                </van-tag>
              </template>
            </van-cell>
          </van-list>
        </van-pull-refresh>
      </van-tab>

      <van-tab title="跟进">
        <van-pull-refresh v-model="refreshing" @refresh="loadMyFollowUps">
          <van-list
            v-model:loading="fuLoading"
            :finished="fuFinished"
            finished-text="没有更多了"
            @load="loadMyFollowUps"
          >
            <van-cell
              v-for="fu in followUps"
              :key="fu.id"
              :title="`${methodTextMap[fu.method]}跟进`"
              :label="fu.content.substring(0, 40) + (fu.content.length > 40 ? '...' : '')"
            >
              <template #right-icon>
                <span class="fu-date">{{ formatDate(fu.followDate) }}</span>
              </template>
            </van-cell>
          </van-list>
        </van-pull-refresh>
      </van-tab>

      <van-tab title="拜访">
        <van-pull-refresh v-model="refreshing" @refresh="loadMyVisits">
          <van-list
            v-model:loading="visitLoading"
            :finished="visitFinished"
            finished-text="没有更多了"
            @load="loadMyVisits"
          >
            <van-cell
              v-for="v in visits"
              :key="v.id"
              :title="v.visitLocation"
              :label="v.visitContent.substring(0, 40) + (v.visitContent.length > 40 ? '...' : '')"
            >
              <template #right-icon>
                <span class="fu-date">{{ formatDate(v.visitDate) }}</span>
              </template>
            </van-cell>
          </van-list>
        </van-pull-refresh>
      </van-tab>
    </van-tabs>

    <van-fab
      v-if="activeTab === 0 && selectedIntakeId"
      type="primary"
      icon="chat-o"
      text="跟进"
      :offset="{ bottom: 80, right: 20 }"
      @click="openFollowUp"
    />
    <van-fab
      v-if="activeTab === 0 && selectedIntakeId"
      type="success"
      icon="location-o"
      text="拜访"
      :offset="{ bottom: 140, right: 20 }"
      @click="openVisit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import dayjs from 'dayjs';
import { showToast } from 'vant';
import { listIntakes, type Intake } from '@/api/modules/intakes';
import { listMyFollowUps, methodMap } from '@/api/modules/follow-ups';
import { listMyVisits } from '@/api/modules/visits';

const router = useRouter();
const activeTab = ref(0);
const loading = ref(false);
const fuLoading = ref(false);
const visitLoading = ref(false);
const finished = ref(false);
const fuFinished = ref(false);
const visitFinished = ref(false);
const refreshing = ref(false);
const page = ref(1);
const fuPage = ref(1);
const visitPage = ref(1);

const intakes = ref<Intake[]>([]);
const followUps = ref<any[]>([]);
const visits = ref<any[]>([]);
const selectedIntakeId = ref(0);

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

const methodTextMap: Record<string, string> = methodMap as any;

function industryText(industry?: string) {
  return industry || '未分类';
}

function formatDate(d?: string) {
  return d ? dayjs(d).format('MM-DD') : '-';
}

function goDetail(id: number) {
  selectedIntakeId.value = id;
  router.push(`/mobile/intakes/${id}`);
}

function openFollowUp() {
  router.push(`/mobile/follow-ups/new?intakeId=${selectedIntakeId.value}`);
}

function openVisit() {
  router.push(`/mobile/visits/new?intakeId=${selectedIntakeId.value}`);
}

async function loadIntakes() {
  loading.value = true;
  try {
    const data = await listIntakes({ page: page.value, pageSize: 20 });
    const [items, total] = Array.isArray(data) ? (data as any) : [[], 0];
    if (page.value === 1) {
      intakes.value = items || [];
    } else {
      intakes.value = [...intakes.value, ...(items || [])];
    }
    if (intakes.value.length >= total) finished.value = true;
    page.value++;
  } catch (e: any) {
    showToast(e.message || '加载失败');
  } finally {
    loading.value = false;
    refreshing.value = false;
  }
}

async function loadMyFollowUps() {
  fuLoading.value = true;
  try {
    const data = await listMyFollowUps({ pageSize: 20 });
    const items = Array.isArray(data) ? data : [];
    followUps.value = items;
    fuFinished.value = true;
  } catch {
    // silent
  } finally {
    fuLoading.value = false;
    refreshing.value = false;
  }
}

async function loadMyVisits() {
  visitLoading.value = true;
  try {
    const data = await listMyVisits({ pageSize: 20 });
    const items = Array.isArray(data) ? data : [];
    visits.value = items;
    visitFinished.value = true;
  } catch {
    // silent
  } finally {
    visitLoading.value = false;
    refreshing.value = false;
  }
}

async function loadAll() {
  page.value = 1;
  fuPage.value = 1;
  visitPage.value = 1;
  finished.value = false;
  fuFinished.value = false;
  visitFinished.value = false;
  intakes.value = [];
  await loadIntakes();
}

onMounted(loadAll);
</script>

<style scoped>
.mobile-home {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 20px;
}
.fu-date {
  color: #969799;
  font-size: 12px;
}
</style>
