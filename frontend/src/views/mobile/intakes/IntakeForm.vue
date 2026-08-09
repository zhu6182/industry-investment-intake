<template>
  <div class="mobile-intake-form">
    <van-nav-bar title="新建进件" left-arrow @click-left="goBack" />

    <van-steps :active="activeStep" class="steps">
      <van-step>查询</van-step>
      <van-step>填写</van-step>
      <van-step>上传</van-step>
      <van-step>提交</van-step>
    </van-steps>

    <!-- Step 1 -->
    <div v-if="activeStep === 0" class="step-body">
      <van-cell-group inset>
        <van-field
          v-model="form.companyName"
          label="企业名称"
          placeholder="请输入完整企业名称"
          maxlength="100"
        />
      </van-cell-group>
      <van-notice-bar v-if="checkResult !== null" class="notice">
        <span v-if="checkResult.exists" style="color: #ef4444">该企业已有在途跟进</span>
        <span v-else style="color: #22c55e">无重复，可以继续</span>
      </van-notice-bar>
      <div class="btn-area">
        <van-button
          round
          type="primary"
          block
          :loading="checking"
          :disabled="!form.companyName.trim()"
          @click="doCheck"
        >
          查询查重
        </van-button>
      </div>
    </div>

    <!-- Step 2 -->
    <div v-else-if="activeStep === 1" class="step-body">
      <van-cell-group inset title="基本信息">
        <van-field v-model="form.companyName" label="企业名称" disabled />
        <van-field v-model="form.creditCode" label="信用代码" placeholder="自动填充" />
        <van-field v-model="form.legalPerson" label="法人" placeholder="法人姓名" />
        <van-field
          v-model="form.establishDate"
          is-link
          readonly
          label="成立日期"
          placeholder="选择日期"
          @click="showDatePicker = true"
        />
        <van-field v-model="form.industry" label="行业" placeholder="行业分类" />
        <van-field v-model="form.applicationRegionId" label="园区ID" type="digit" />
        <van-field v-model="form.area" label="面积(㎡)" type="number" />
      </van-cell-group>

      <van-cell-group inset title="股东">
        <van-field
          v-for="(sh, idx) in shareholders"
          :key="idx"
          v-model="sh.name"
          :label="`股东${idx + 1}`"
          placeholder="股东姓名/公司"
        />
        <van-button round block type="primary" plain size="small" style="margin: 12px" @click="shareholders.push({ name: '' })">
          添加股东
        </van-button>
      </van-cell-group>

      <van-date-picker
        v-model:show="showDatePicker"
        title="选择成立日期"
        :columns="dateColumns"
        @confirm="onDateConfirm"
      />
    </div>

    <!-- Step 3 -->
    <div v-else-if="activeStep === 2" class="step-body">
      <van-cell-group inset title="文件上传">
        <van-uploader
          :after-read="(f) => handleUpload(f, 'application')"
          :max-count="1"
          :file-list="applicationFile"
        >
          <van-button round plain type="primary" size="small">申请表 (PDF/Word)</van-button>
        </van-uploader>

        <van-uploader
          :after-read="(f) => handleUpload(f, 'ppt')"
          :max-count="1"
          :file-list="pptFile"
        >
          <van-button round plain type="primary" size="small">PPT 文件</van-button>
        </van-uploader>

        <van-uploader
          :after-read="(f) => handleUpload(f, 'data_sheet')"
          :max-count="1"
          :file-list="sheetFile"
        >
          <van-button round plain type="primary" size="small">资料表 (Excel)</van-button>
        </van-uploader>

        <van-uploader
          :after-read="(f) => handleUpload(f, 'photo')"
          multiple
          :max-count="9"
          :file-list="photoFiles"
          :deletable="true"
        >
          <van-button round plain type="primary" size="small">拍照/选择照片</van-button>
        </van-uploader>
      </van-cell-group>
    </div>

    <!-- Step 4 -->
    <div v-else-if="activeStep === 3" class="step-body">
      <van-loading v-if="submitting" class="submitting" type="spinner">核名中...</van-loading>
      <template v-else-if="submitResult">
        <van-result
          :type="submitResult.tycValidation?.isValid ? 'success' : 'error'"
          :title="submitResult.tycValidation?.isValid ? '核名通过' : '核名未通过'"
          :description="submitResult.tycValidation?.reasons?.join('；')"
        />
        <div class="btn-area">
          <van-button round type="primary" block @click="goDetail(submitResult.id)">查看详情</van-button>
        </div>
      </template>
    </div>

    <div v-if="activeStep < 3 && activeStep > 0" class="step-footer">
      <van-button plain block @click="activeStep--">上一步</van-button>
      <van-button type="primary" block :disabled="activeStep === 0 && !canNext" @click="activeStep++">下一步</van-button>
    </div>
    <div v-else-if="activeStep === 0" class="step-footer">
      <van-button type="primary" block :disabled="!canNext" @click="activeStep++">下一步</van-button>
    </div>
    <div v-else-if="activeStep === 2" class="step-footer">
      <van-button plain block @click="activeStep--">上一步</van-button>
      <van-button type="primary" block :loading="submitting" @click="doSubmit">提交进件</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import dayjs from 'dayjs';
import {
  checkIntakeExists,
  createIntake,
  uploadFile,
  type Intake,
} from '@/api/modules/intakes';

const router = useRouter();
const activeStep = ref(0);
const checking = ref(false);
const checkResult = ref<{ exists: boolean } | null>(null);
const submitting = ref(false);
const submitResult = ref<Intake | null>(null);
const showDatePicker = ref(false);

const form = reactive({
  companyName: '',
  creditCode: '',
  legalPerson: '',
  establishDate: '',
  industry: '',
  applicationRegionId: '' as any,
  area: '' as any,
});

const shareholders = ref<Array<{ name: string }>>([{ name: '' }]);

const applicationFile = ref<any[]>([]);
const pptFile = ref<any[]>([]);
const sheetFile = ref<any[]>([]);
const photoFiles = ref<any[]>([]);

const canNext = computed(() => {
  if (activeStep.value === 0) return checkResult.value?.exists === false;
  return !!form.companyName;
});

const dateColumns = computed(() => {
  const years = [];
  for (let y = dayjs().year(); y >= 1970; y--) years.push({ text: `${y}年`, value: `${y}` });
  const months = [];
  for (let m = 1; m <= 12; m++) months.push({ text: `${m}月`, value: `${String(m).padStart(2, '0')}` });
  const days = [];
  for (let d = 1; d <= 31; d++) days.push({ text: `${d}日`, value: `${String(d).padStart(2, '0')}` });
  return [years, months, days];
});

function onDateConfirm({ selectedValues }: any) {
  form.establishDate = selectedValues.join('-');
  showDatePicker.value = false;
}

async function doCheck() {
  if (!form.companyName.trim()) {
    showToast('请输入企业名称');
    return;
  }
  checking.value = true;
  try {
    checkResult.value = await checkIntakeExists(form.companyName.trim());
  } catch (e: any) {
    showToast(e.message || '查询失败');
  } finally {
    checking.value = false;
  }
}

async function handleUpload(file: any, type: string) {
  try {
    const result = await uploadFile(file.file as File);
    const item = { url: result.url, name: result.originalName };
    if (type === 'application') applicationFile.value = [item];
    else if (type === 'ppt') pptFile.value = [item];
    else if (type === 'data_sheet') sheetFile.value = [item];
    else if (type === 'photo') photoFiles.value.push(item);
    showToast('上传成功');
  } catch (e: any) {
    showToast(e.message || '上传失败');
  }
}

async function doSubmit() {
  submitting.value = true;
  try {
    const payload: any = {
      companyName: form.companyName,
      creditCode: form.creditCode,
      legalPerson: form.legalPerson,
      establishDate: form.establishDate,
      industry: form.industry,
      applicationRegionId: form.applicationRegionId ? Number(form.applicationRegionId) : undefined,
      area: form.area ? Number(form.area) : undefined,
      shareholders: JSON.stringify(shareholders.value.filter((s) => s.name)),
    };
    submitResult.value = await createIntake(payload);
    activeStep.value = 3;
  } catch (e: any) {
    showToast(e.message || '提交失败');
  } finally {
    submitting.value = false;
  }
}

function goDetail(id: number) {
  router.push(`/m/intakes/${id}`);
}

function goBack() {
  router.back();
}
</script>

<style scoped>
.mobile-intake-form {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 100px;
}
.steps {
  background: #fff;
  padding: 12px 0;
}
.step-body {
  padding: 16px 0;
}
.step-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  background: #fff;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  gap: 12px;
}
.step-footer .van-button {
  flex: 1;
}
.notice {
  margin: 12px;
}
.btn-area {
  padding: 24px 16px;
}
.submitting {
  display: flex;
  justify-content: center;
  padding: 80px 0;
}
</style>
