<template>
  <div class="visit-form">
    <van-nav-bar title="记录拜访" left-arrow @click-left="goBack" />

    <van-form @submit="onSubmit">
      <van-cell-group inset>
        <van-field
          v-model="visitDateText"
          is-link
          readonly
          label="拜访日期"
          placeholder="选择日期"
          @click="showDatePicker = true"
          required
        />
        <van-field
          v-model="form.visitLocation"
          name="visitLocation"
          label="拜访地点"
          placeholder="如：XX企业总部"
          required
        />
        <van-field
          v-model="form.applicationRegionId"
          is-link
          readonly
          label="申请园区"
          placeholder="请选择"
          @click="showRegionPicker = true"
        />
        <van-field
          v-model="form.area"
          type="number"
          label="入驻面积(㎡)"
          placeholder="可选"
        />
        <van-field
          v-model="form.visitContent"
          name="visitContent"
          type="textarea"
          label="拜访内容"
          rows="4"
          autosize
          placeholder="请填写拜访详情"
          required
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

    <van-popup v-model:show="showDatePicker" position="bottom">
      <van-date-picker
        v-model="selectedDate"
        title="选择日期"
        @confirm="onDateConfirm"
        @cancel="showDatePicker = false"
      />
    </van-popup>

    <van-popup v-model:show="showRegionPicker" position="bottom">
      <van-picker
        :columns="regionColumns"
        @confirm="onRegionConfirm"
        @cancel="showRegionPicker = false"
      />
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import dayjs from 'dayjs';
import { showToast, showLoadingToast, closeToast } from 'vant';
import { createVisit } from '@/api/modules/visits';
import { uploadFile } from '@/api/modules/intakes';

const route = useRoute();
const router = useRouter();
const intakeId = Number(route.query.intakeId) || 0;

const form = reactive({
  visitDate: dayjs().toDate(),
  visitLocation: '',
  visitContent: '',
  applicationRegionId: undefined as number | undefined,
  applicationRegionName: '',
  area: '' as string | number,
});

const visitDateText = ref(dayjs().format('YYYY-MM-DD'));
const selectedDate = ref(['2026', '08', '08']);

const photoFiles = ref<any[]>([]);
const photoUrls = ref<string[]>([]);
const submitting = ref(false);

const showDatePicker = ref(false);
const showRegionPicker = ref(false);

const regionColumns = [
  { text: '示例园区A', value: 1 },
  { text: '示例园区B', value: 2 },
  { text: '示例园区C', value: 3 },
];

function onDateConfirm({ selectedValues }: any) {
  const [y, m, d] = selectedValues;
  visitDateText.value = `${y}-${m}-${d}`;
  form.visitDate = dayjs(`${y}-${m}-${d}`).toDate();
  showDatePicker.value = false;
}

function onRegionConfirm({ selectedOptionValues, selectedOptions }: any) {
  form.applicationRegionId = selectedOptionValues[0];
  form.applicationRegionName = selectedOptions[0]?.text || '';
  showRegionPicker.value = false;
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
  if (!form.visitLocation.trim()) {
    showToast('请填写拜访地点');
    return;
  }
  if (!form.visitContent.trim()) {
    showToast('请填写拜访内容');
    return;
  }

  submitting.value = true;
  try {
    const areaNum = typeof form.area === 'string' ? Number(form.area) : form.area;
    await createVisit({
      intakeId,
      visitDate: dayjs(form.visitDate).format('YYYY-MM-DD HH:mm:ss'),
      visitLocation: form.visitLocation,
      visitContent: form.visitContent,
      applicationRegionId: form.applicationRegionId,
      area: areaNum ? Number(areaNum) : undefined,
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
.visit-form {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 20px;
}
</style>
