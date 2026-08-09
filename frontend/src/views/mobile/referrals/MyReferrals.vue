<template>
  <div class="mobile-referrals">
    <van-cell-group inset style="margin: 16px 0">
      <van-cell title="推荐企业" :value="stats.totalCount + ' 家'" />
      <van-cell title="已落地" :value="stats.landedCount + ' 家'" />
      <van-cell title="落地总面积" :value="stats.totalArea + ' ㎡'" />
    </van-cell-group>

    <van-tabs v-model:active="activeTab" sticky>
      <van-tab title="推荐记录" name="list">
        <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
          <van-list
            v-model:loading="loading"
            :finished="finished"
            finished-text="没有更多了"
            @load="loadMore"
          >
            <van-card
              v-for="item in dataSource"
              :key="item.id"
              :title="item.intake?.companyName || '未知企业'"
              :desc="`推荐时间: ${formatDate(item.createdAt)}`"
            >
              <template #tags>
                <van-tag type="primary" style="margin-right: 4px">
                  {{ item.intake?.status || 'pending' }}
                </van-tag>
                <van-tag>{{ item.type }}</van-tag>
                <van-tag v-if="item.intake?.area">{{ item.intake.area }}㎡</van-tag>
              </template>
            </van-card>
          </van-list>
        </van-pull-refresh>
      </van-tab>

      <van-tab title="推荐数排行" name="count">
        <van-cell-group inset>
          <van-cell
              v-for="r in countRankList"
              :key="r.userId"
            :title="`${r.rank}. ${r.userName || '(匿名)'}`"
            :value="`${r.count} 家`"
            :class="{ 'rank-me': r.isMe }"
          >
            <template #label>
              <span style="color: #999">落地 {{ r.totalArea }} ㎡</span>
            </template>
          </van-cell>
        </van-cell-group>
      </van-tab>

      <van-tab title="面积排行" name="area">
        <van-cell-group inset>
          <van-cell
              v-for="r in areaRankList"
              :key="r.userId"
            :title="`${r.rank}. ${r.userName || '(匿名)'}`"
            :value="`${r.totalArea} ㎡`"
            :class="{ 'rank-me': r.isMe }"
          >
            <template #label>
              <span style="color: #999">推荐 {{ r.count }} 家</span>
            </template>
          </van-cell>
        </van-cell-group>
      </van-tab>
    </van-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { getMyReferrals, getMyReferralStats, type ReferralItem, type ReferralStats } from '@/api/modules/referrals';
import { rankByCount, rankByArea, getMyRank } from '@/api/modules/rankings';

const activeTab = ref('list');

const stats = reactive<ReferralStats>({ totalCount: 0, landedCount: 0, totalArea: 0 });

const dataSource = ref<ReferralItem[]>([]);
const loading = ref(false);
const finished = ref(false);
const refreshing = ref(false);
const page = ref(1);

function formatDate(s: string) {
  if (!s) return '';
  return new Date(s).toLocaleString('zh-CN');
}

async function loadStats() {
  try {
    const s = await getMyReferralStats();
    Object.assign(stats, s);
  } catch {}
}

async function loadMore() {
  try {
    const res = await getMyReferrals({ page: page.value, limit: 10 });
    if (page.value === 1) {
      dataSource.value = res.list;
    } else {
      dataSource.value.push(...res.list);
    }
    if (dataSource.value.length >= res.total) {
      finished.value = true;
    }
    page.value++;
  } catch {}
  loading.value = false;
}

async function onRefresh() {
  page.value = 1;
  finished.value = false;
  await loadMore();
  refreshing.value = false;
  await loadStats();
}

const countRankList = ref<any[]>([]);
const areaRankList = ref<any[]>([]);

async function loadRankings() {
  try {
    const [cl, al, my] = await Promise.all([rankByCount(50), rankByArea(50), getMyRank()]);
    countRankList.value = cl.map((r, i) => ({ ...r, rank: i + 1, isMe: r.userId === my.byCount.me.userId }));
    if (!countRankList.value.some((r: any) => r.isMe) && my.byCount.rank) {
      countRankList.value.push({ ...my.byCount.me, rank: my.byCount.rank, isMe: true });
    }
    areaRankList.value = al.map((r, i) => ({ ...r, rank: i + 1, isMe: r.userId === my.byArea.me.userId }));
    if (!areaRankList.value.some((r: any) => r.isMe) && my.byArea.rank) {
      areaRankList.value.push({ ...my.byArea.me, rank: my.byArea.rank, isMe: true });
    }
  } catch {}
}

onMounted(() => {
  loadMore();
  loadStats();
  loadRankings();
});
</script>

<style scoped>
.rank-me {
  background: #e6f4ff !important;
  font-weight: bold;
}
</style>
