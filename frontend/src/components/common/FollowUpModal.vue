<template>
  <a-modal
    v-model:open="visible"
    title="记录跟进"
    :confirm-loading="submitting"
    @ok="handleSubmit"
    @cancel="handleCancel"
    :width="600"
  >
    <a-form :model="form" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
      <a-form-item label="跟进方式" required>
        <a-select v-model:value="form.method" :options="methodOptions" />
      </a-form-item>
      <a-form-item label="跟进日期" required>
        <a-date-picker
          v-model:value="form.followDate"
          show-time
          format="YYYY-MM-DD HH:mm"
          style="width: 100%"
        />
      </a-form-item>
      <a-form-item label="跟进结果">
        <a-select v-model:value="form.result" :options="resultOptions" />
      </a-form-item>
      <a-form-item label="跟进内容" required>
        <a-textarea v-model:value="form.content" :rows="4" placeholder="请填写跟进详情" />
      </a-form-item>
      <a-form-item label="下一步计划">
        <a-textarea v-model:value="form.nextStep" :rows="2" placeholder="可选" />
      </a-form-item>
      <a-form-item label="照片">
        <a-upload
          :file-list="photoFileList"
          list-type="picture-card"
          :custom-request="handleUpload"
          @remove="handleRemove"
          :max-count="9"
          accept="image/*"
        >
          <template v-if="photoFileList.length < 9">
            <div>
              <PlusOutlined />
              <div style="margin-top: 8px">上传</div>
            </div>
          </template>
        </a-upload>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { message } from 'ant-design-vue';
import { PlusOutlined } from '@ant-design/icons-vue';
import dayjs from 'dayjs';
import { createFollowUp, type FollowUpMethod, type FollowUpResult } from '@/api/modules/follow-ups';
import { uploadFile } from '@/api/modules/intakes';

const props = defineProps<{
  open: boolean;
  intakeId: number;
}>();

const emit = defineEmits<{
  (e: 'update:open', val: boolean): void;
  (e: 'success'): void;
}>();

const visible = ref(false);
watch(() => props.open, (v) => (visible.value = v));
watch(visible, (v) => emit('update:open', v));

const submitting = ref(false);
const photoFileList = ref<any[]>([]);
const photoUrls = ref<string[]>([]);

const form = reactive({
  method: 'phone' as FollowUpMethod,
  content: '',
  followDate: dayjs(),
  result: 'undecided' as FollowUpResult,
  nextStep: '',
});

const methodOptions = [
  { value: 'phone', label: '电话' },
  { value: 'wechat', label: '微信' },
  { value: 'email', label: '邮件' },
  { value: 'onsite', label: '上门' },
  { value: 'other', label: '其他' },
];

const resultOptions = [
  { value: 'undecided', label: '未定' },
  { value: 'interested', label: '有意向' },
  { value: 'negotiating', label: '洽谈中' },
  { value: 'pending_decision', label: '待决策' },
  { value: 'not_interested', label: '无意向' },
];

function handleUpload({ file, onSuccess, onError }: any) {
  uploadFile(file as File)
    .then((res: any) => {
      photoUrls.value.push(res.url);
      onSuccess?.({ url: res.url });
    })
    .catch((e) => onError?.(e));
}

function handleRemove(file: any) {
  const idx = photoFileList.value.indexOf(file);
  if (idx > -1) {
    photoFileList.value.splice(idx, 1);
    photoUrls.value.splice(idx, 1);
  }
  return true;
}

async function handleSubmit() {
  if (!form.content.trim()) {
    message.warning('请填写跟进内容');
    return;
  }

  submitting.value = true;
  try {
    await createFollowUp({
      intakeId: props.intakeId,
      method: form.method,
      content: form.content,
      followDate: form.followDate.format('YYYY-MM-DD HH:mm:ss'),
      result: form.result,
      nextStep: form.nextStep,
      photos: photoUrls.value,
    });
    message.success('跟进记录已保存');
    emit('success');
    handleCancel();
  } catch (e: any) {
    message.error(e.message || '保存失败');
  } finally {
    submitting.value = false;
  }
}

function handleCancel() {
  visible.value = false;
  form.method = 'phone';
  form.content = '';
  form.followDate = dayjs();
  form.result = 'undecided';
  form.nextStep = '';
  photoFileList.value = [];
  photoUrls.value = [];
}
</script>
