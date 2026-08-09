<template>
  <div class="fu-form">
    <van-nav-bar title="记录跟进" left-arrow @click-left="goBack" />

    <van-form @submit="onSubmit">
      <van-cell-group inset>
        <van-field
          v-model="form.method"
          name="method"
          label="跟进方式"
          is-link
          readonly
          placeholder="请选择"
          @click="showMethodPicker = true"
        />
        <van-field
          v-model="followDateText"
          is-link
          readonly
          label="跟进日期"
          placeholder="选择日期"
          @click="showDatePicker = true"
        />
        <van-field
          v-model="form.result"
          name="result"
          label="跟进结果"
          is-link
          readonly
          placeholder="请选择"
          @click="showResultPicker = true"
        />
        <van-field
          v-model="form.content"
          name="content"
          type="textarea"
          label="跟进内容"
          rows="3"
          autosize
          placeholder="请填写跟进详情"
          required
        />
        <van-field
          v-model="form.nextStep"
          name="nextStep"
          type="textarea"
          label="下一步计划"
          rows="2"
          autosize
          placeholder="可选"
        />
      </van-cell-group>

      <van-cell-group inset title="照片">
        <van-uploader
          v-model="photoFiles"
          :after-read="afterRead"
          :max-count="9"
          :deletable="true"
        />
      </van-cell-group>

      <div style="padding: 32px 16px">
        <van-button round block type="primary" native-type="submit" :loading="submitting">
          提交
        </van-button>
      </div>
    </van-form>

    <van-popup v-model:show="showMethodPicker" position="bottom">
      <van-picker
        :columns="methodColumns"
        @confirm="onMethodConfirm"
        @cancel="showMethodPicker = false"
      />
    </van-popup>

    <van-popup v-model:show="showDatePicker" position="bottom">
      <van-date-picker
        v-model="selectedDate"
        title="选择日期"
        @confirm="onDateConfirm"
        @cancel="showDatePicker = false"
      />
    </van-popup>

    <van-popup v-model:show="showResultPicker" position="bottom">
      <van-picker
        :columns="resultColumns"
        @confirm="onResultConfirm"
        @cancel="showResultPicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import dayjs from 'dayjs';
import { showToast, showLoadingToast, closeToast } from 'vant';
import { createFollowUp } from '@/api/modules/follow-ups';
import { uploadFile } from '@/api/modules/intakes';

const route = useRoute();
const router = useRouter();
const intakeId = Number(route.query.intakeId) || 0;

const form = reactive({
  method: 'phone',
  content: '',
  followDate: dayjs().toDate(),
  result: 'undecided',
  nextStep: '',
});

const followDateText = ref(dayjs().format('YYYY-MM-DD'));
const selectedDate = ref(['2026', '08', '08']);

const photoFiles = ref<any[]>([]);
const photoUrls = ref<string[]>([]);
const submitting = ref(false);

const showMethodPicker = ref(false);
const showDatePicker = ref(false);
const showResultPicker = ref(false);

const methodColumns = [
  { text: '电话', value: 'phone' },
  { text: '微信', value: 'wechat' },
  { text: '邮件', value: 'email' },
  { text: '上门', value: 'onsite' },
  { text: '其他', value: 'other' },
];

const resultColumns = [
  { text: '未定', value: 'undecided' },
  { text: '有意向', value: 'interested' },
  { text: '洽谈中', value: 'negotiating' },
  { text: '待决策', value: 'pending_decision' },
  { text: '无意向', value: 'not_interested' },
];

function onMethodConfirm({ selectedOptionValues }: any) {
  form.method = selectedOptionValues[0];
  showMethodPicker.value = false;
}

function onDateConfirm({ selectedValues }: any) {
  const [y, m, d] = selectedValues;
  followDateText.value = `${y}-${m}-${d}`;
  form.followDate = dayjs(`${y}-${m}-${d}`).toDate();
  showDatePicker.value = false;
}

function onResultConfirm({ selectedOptionValues }: any) {
  form.result = selectedOptionValues[0];
  showResultPicker.value = false;
}

async function afterRead(file: any) {
  showLoadingToast({ message: '上传中...', forbidClick: true });
  try {
    const res: any = await uploadFile(file.file);
    photoUrls.value.push(res.url);
    file.url = res.url;
  } catch {
    showToast('上传失败');
  } finally {
    closeToast();
  }
}

async function onSubmit() {
  if (!form.content.trim()) {
    showToast('请填写跟进内容');
    return;
  }

  submitting.value = true;
  try {
    await createFollowUp({
      intakeId,
      method: form.method as any,
      content: form.content,
      followDate: dayjs(form.followDate).format('YYYY-MM-DD HH:mm:ss'),
      result: form.result as any,
      nextStep: form.nextStep,
      photos: photoUrls.value,
    });
    showToast({ message: '提交成功', type: 'success' });
    setTimeout(goBack, 800);
  } catch (e: any) {
    showToast(e.message || '提交失败');
  } finally {
    submitting.value = false;
  }
}

function goBack() {
  router.back();
}

onMounted(() => {
  if (!intakeId) {
    showToast('缺少企业ID');
    setTimeout(goBack, 1000);
  }
});
</script>

<style scoped>
.fu-form {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 20px;
}
</style>
