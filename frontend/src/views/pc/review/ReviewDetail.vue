<template>
  <div class="review-detail">
    <div class="page-header">
      <a-button @click="goBack">
        <template #icon><ArrowLeftOutlined /></template>
        返回审核列表
      </a-button>
      <h2>审核详情 #{{ intakeId }}</h2>
    </div>

    <a-spin :spinning="loading">
      <template v-if="detail">
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
                <a-descriptions-item label="申请人">{{ detail.applicant?.name || '-' }}</a-descriptions-item>
                <a-descriptions-item label="创建时间" :span="2">
                  {{ formatDate(detail.createdAt) }}
                </a-descriptions-item>
              </a-descriptions>

              <div v-if="parsedShareholders.length > 0" class="shareholders-section">
                <h4>股东结构（天眼查）</h4>
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

            <a-card title="企业分析报告" class="report-card">
              <div class="report-actions">
                <a-button @click="openReportViewer">
                  <template #icon><FilePdfOutlined /></template>
                  查看报告
                </a-button>
              </div>
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

            <a-card title="审核操作" class="action-card">
              <template v-if="detail.status !== 'pending'">
                <a-alert
                  :type="detail.status === 'rejected' ? 'error' : 'success'"
                  show-icon
                  :message="detail.status === 'rejected' ? '已驳回' : '已通过'"
                  :description="detail.rejectReason || `审核结果：${statusMap[detail.status]?.text}`"
                />
                <a-divider />
                <h4>审核历史</h4>
                <a-timeline>
                  <a-timeline-item v-for="h in history" :key="h.id" :color="h.action === 'approve' ? 'green' : 'red'">
                    {{ h.action === 'approve' ? '通过' : '驳回' }}
                    <template v-if="h.reason"> — {{ h.reason }}</template>
                    <br />
                    <span class="history-meta">
                      {{ h.reviewer?.name }} · {{ formatDate(h.createdAt) }}
                    </span>
                  </a-timeline-item>
                </a-timeline>
              </template>

              <template v-else>
                <a-form layout="vertical">
                  <a-form-item label="审核操作">
                    <a-radio-group v-model:value="action">
                      <a-radio-button value="approve">通过</a-radio-button>
                      <a-radio-button value="reject">驳回</a-radio-button>
                    </a-radio-group>
                  </a-form-item>

                  <a-form-item
                    v-if="action === 'approve'"
                    label="分配招商人员（可选）"
                  >
                    <a-select
                      v-model:value="assignToUserId"
                      placeholder="选择招商人员（留空则不分配）"
                      allow-clear
                      :loading="staffLoading"
                      style="width: 100%"
                    >
                      <a-select-option
                        v-for="s in staffList"
                        :key="s.id"
                        :value="s.id"
                      >
                        {{ s.name }}（{{ s.phone }}）
                      </a-select-option>
                    </a-select>
                  </a-form-item>

                  <a-form-item
                    v-if="action === 'reject'"
                    label="驳回原因"
                    required
                  >
                    <a-textarea
                      v-model:value="reason"
                      placeholder="请填写驳回原因"
                      :rows="3"
                      :maxlength="200"
                      show-count
                    />
                  </a-form-item>

                  <a-space>
                    <a-button
                      v-if="action === 'approve'"
                      type="primary"
                      :loading="submitting"
                      @click="doReview"
                    >
                      确认通过
                    </a-button>
                    <a-button
                      v-else
                      danger
                      type="primary"
                      :loading="submitting"
                      @click="doReview"
                    >
                      确认驳回
                    </a-button>
                  </a-space>
                </a-form>
              </template>
            </a-card>
          </a-col>
        </a-row>
      </template>
    </a-spin>

    <ReportViewer
      :open="reportVisible"
      :intake-id="intakeId"
      @close="reportVisible = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { message } from 'ant-design-vue';
import { ArrowLeftOutlined, FilePdfOutlined } from '@ant-design/icons-vue';
import dayjs from 'dayjs';
import { getIntake, statusMap, type Intake } from '@/api/modules/intakes';
import { reviewIntake, type ReviewRecord } from '@/api/modules/review';
import { listInvestmentStaff, type InvestmentStaff } from '@/api/modules/users';
import ReportViewer from '@/components/common/ReportViewer.vue';

const router = useRouter();
const route = useRoute();
const intakeId = Number(route.params.id);

const loading = ref(false);
const detail = ref<Intake | null>(null);
const history = ref<ReviewRecord[]>([]);
const staffList = ref<InvestmentStaff[]>([]);
const staffLoading = ref(false);
const submitting = ref(false);
const action = ref<'approve' | 'reject'>('approve');
const reason = ref('');
const assignToUserId = ref<number | undefined>(undefined);
const reportVisible = ref(false);

const fileTypeMap: Record<string, string> = {
  application: '申请表',
  ppt: 'PPT',
  data_sheet: '资料表',
  photo: '照片',
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

function goBack() {
  router.back();
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

async function loadStaff() {
  staffLoading.value = true;
  try {
    staffList.value = await listInvestmentStaff();
  } catch {
    staffList.value = [];
  } finally {
    staffLoading.value = false;
  }
}

async function doReview() {
  if (action.value === 'reject' && (!reason.value || reason.value.trim().length === 0)) {
    message.error('请填写驳回原因');
    return;
  }

  submitting.value = true;
  try {
    const data: any = { action: action.value };
    if (action.value === 'reject') {
      data.reason = reason.value;
    }
    if (action.value === 'approve' && assignToUserId.value) {
      data.assignToUserId = assignToUserId.value;
    }

    const res = await reviewIntake(intakeId, data);

    if (res.reportGenerated) {
      message.success(`${action.value === 'approve' ? '通过' : '驳回'}成功，企业分析报告已自动生成`);
    } else if (action.value === 'approve') {
      message.success('审核通过！报告正在后台生成，请稍后点击查看报告');
    } else {
      message.success('审核已驳回');
    }

    action.value = 'approve';
    reason.value = '';
    assignToUserId.value = undefined;
    await loadData();
  } catch (e: any) {
    message.error(e.message || '操作失败');
  } finally {
    submitting.value = false;
  }
}

function openReportViewer() {
  reportVisible.value = true;
}

onMounted(async () => {
  await loadData();
  if (detail.value?.status === 'pending') {
    await loadStaff();
  }
});
</script>

<style scoped>
.review-detail {
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
}
.info-card,
.files-card,
.tyc-card,
.action-card,
.report-card {
  margin-bottom: 16px;
}
.shareholders-section {
  margin-top: 24px;
}
.shareholders-section h4 {
  margin-bottom: 12px;
}
.history-meta {
  color: #999;
  font-size: 12px;
}
.report-actions {
  display: flex;
  gap: 12px;
}
</style>
