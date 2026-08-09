<template>
  <div class="mobile-intake-list">
    <van-nav-bar title="进件管理" left-arrow @click-left="goBack">
      <template #right>
        <van-icon name="plus" size="20" @click="goNew" />
      </template>
    </van-nav-bar>

    <van-sticky>
      <div class="filter-bar">
        <van-search
          v-model="filters.keyword"
          placeholder="搜索企业名"
          shape="round"
          @search="onSearch"
        />
        <van-dropdown-menu>
          <van-dropdown-item v-model="filters.status" :options="statusOptions" @change="onSearch" />
        </van-dropdown-menu>
      </div>
    </van-sticky>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <van-cell
          v-for="item in list"
          :key="item.id"
          :title="item.companyName"
          :label="`法人: ${item.legalPerson || '-'}  |  ${formatDate(item.createdAt)}`"
          :value="statusMap[item.status]?.text"
          is-link
          @click="goDetail(item.id)"
        >
          <template #title>
            <div class="item-title">
              {{ item.companyName }}
              <van-tag v-if="item.tycValidation?.isValid" type="success" size="medium" style="margin-left: 8px">核名通过</van-tag>
              <van-tag v-else-if="item.tycValidation" type="danger" size="medium" style="margin-left: 8px">核名未通过</van-tag>
            </div>
          </template>
        </van-cell>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import dayjs from 'dayjs';
import {
  listIntakes,
  statusMap,
  type Intake,
} from '@/api/modules/intakes';

const router = useRouter();
const list = ref<Intake[]>([]);
const loading = ref(false);
const finished = ref(false);
const refreshing = ref(false);
const page = ref(1);
const pageSize = 20;

const filters = reactive({
  keyword: '',
  status: '' as string,
});

const statusOptions = [
  { text: '全部状态', value: '' },
  ...Object.entries(statusMap).map(([k, v]) => ({ text: v.text, value: k })),
];

function formatDate(d?: string) {
  return d ? dayjs(d).format('MM-DD HH:mm') : '';
}

async function loadPage() {
  const params: Record<string, any> = {
    page: page.value,
    pageSize,
  };
  if (filters.keyword) params.keyword = filters.keyword;
  if (filters.status) params.status = filters.status;

  const [items, total] = await listIntakes(params);

  if (page.value === 1) {
    list.value = items;
  } else {
    list.value.push(...items);
  }

  if (list.value.length >= total || items.length < pageSize) {
    finished.value = true;
  } else {
    page.value++;
  }
}

async function onLoad() {
  try {
    await loadPage();
  } catch (e: any) {
    showToast(e.message || '加载失败');
  } finally {
    loading.value = false;
    refreshing.value = false;
  }
}

function onRefresh() {
  page.value = 1;
  finished.value = false;
  onLoad();
}

function onSearch() {
  page.value = 1;
  finished.value = false;
  list.value = [];
  onLoad();
}

function goDetail(id: number) {
  router.push(`/m/intakes/${id}`);
}

function goNew() {
  router.push('/m/intakes/new');
}

function goBack() {
  router.back();
}
</script>

<style scoped>
.mobile-intake-list {
  min-height: 100vh;
  background: #f7f8fa;
}
.filter-bar {
  background: #fff;
  padding: 8px 12px;
}
.item-title {
  display: flex;
  align-items: center;
  font-size: 14px;
}
</style>
