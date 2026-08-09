<template>
  <a-modal
    :open="open"
    :title="title"
    width="900px"
    :footer="null"
    :onCancel="handleClose"
    destroy-on-close
  >
    <div class="report-viewer">
      <div v-if="loading" class="viewer-loading">
        <a-spin tip="报告加载中..." />
      </div>

      <div v-else-if="!report" class="viewer-empty">
        <a-empty description="暂无企业分析报告">
          <p class="tip">审核通过后系统会自动生成报告</p>
        </a-empty>
      </div>

      <template v-else>
        <div class="viewer-toolbar">
          <span class="report-meta">
            生成于 {{ formatDate(report.createdAt) }}
          </span>
          <a-button type="primary" @click="download">
            <template #icon><DownloadOutlined /></template>
            下载 PDF
          </a-button>
        </div>
        <div class="viewer-frame">
          <iframe
            :src="pdfUrl"
            width="100%"
            height="600"
            frameborder="0"
          />
        </div>
      </template>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { message } from 'ant-design-vue';
import { DownloadOutlined } from '@ant-design/icons-vue';
import dayjs from 'dayjs';
import { getReport, getReportPdfUrl, getReportDownloadUrl, type Report } from '@/api/modules/reports';

const props = defineProps<{
  open: boolean;
  intakeId: number;
  title?: string;
}>();

const emit = defineEmits<{
  close: [];
}>();

const loading = ref(false);
const report = ref<Report | null>(null);

const pdfUrl = computed(() => {
  if (!report.value) return '';
  return getReportPdfUrl(report.value.pdfUrl);
});

const title = computed(() => props.title || '企业分析报告');

async function load() {
  if (!props.intakeId) return;
  loading.value = true;
  try {
    report.value = await getReport(props.intakeId);
  } catch (e: any) {
    report.value = null;
    if (e.message && !e.message.includes('尚未生成')) {
      message.error(e.message || '加载报告失败');
    }
  } finally {
    loading.value = false;
  }
}

function handleClose() {
  emit('close');
}

function download() {
  const url = getReportDownloadUrl(props.intakeId);
  window.open(url, '_blank');
}

function formatDate(d?: string): string {
  return d ? dayjs(d).format('YYYY-MM-DD HH:mm') : '-';
}

watch(
  () => props.open,
  (v) => {
    if (v) load();
  },
  { immediate: true },
);

watch(
  () => props.intakeId,
  () => {
    if (props.open) load();
  },
);
</script>

<style scoped>
.report-viewer {
  min-height: 300px;
}
.viewer-loading,
.viewer-empty {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}
.tip {
  color: #999;
  margin-top: 8px;
}
.viewer-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.report-meta {
  color: #666;
  font-size: 13px;
}
.viewer-frame {
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}
</style>
