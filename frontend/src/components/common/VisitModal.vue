<template>
  <a-modal
    v-model:open="visible"
    title="记录拜访"
    :confirm-loading="submitting"
    @ok="handleSubmit"
    @cancel="handleCancel"
    :width="600"
  >
    <a-form :model="form" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
      <a-form-item label="拜访日期" required>
        <a-date-picker
          v-model:value="form.visitDate"
          show-time
          format="YYYY-MM-DD HH:mm"
          style="width: 100%"
        />
      </a-form-item>
      <a-form-item label="拜访地点" required>
        <a-input v-model:value="form.visitLocation" placeholder="如：XX企业总部" />
      </a-form-item>
      <a-form-item label="申请园区">
        <a-tree-select
          v-model:value="form.applicationRegionId"
          :tree-data="regionOptions"
          placeholder="请选择申请园区"
          allow-clear
          tree-default-expand-all
          :field-names="{ label: 'name', value: 'id' }"
        />
      </a-form-item>
      <a-form-item label="入驻面积(㎡)">
        <a-input-number v-model:value="form.area" :min="0" :precision="2" style="width: 100%" />
      </a-form-item>
      <a-form-item label="拜访内容" required>
        <a-textarea v-model:value="form.visitContent" :rows="4" placeholder="请填写拜访详情" />
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
import { ref, reactive, watch, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { PlusOutlined } from '@ant-design/icons-vue';
import dayjs from 'dayjs';
import { createVisit } from '@/api/modules/visits';
import { uploadFile } from '@/api/modules/intakes';

interface RegionNode {
  id: number;
  name: string;
  level: number;
  parentId?: number;
  children?: RegionNode[];
}

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
const regionOptions = ref<RegionNode[]>([]);

const form = reactive({
  visitDate: dayjs(),
  visitLocation: '',
  visitContent: '',
  applicationRegionId: undefined as number | undefined,
  area: undefined as number | undefined,
});

async function loadRegions() {
  try {
    const res = await fetch('/api/regions').then((r) => r.json()).catch(() => null);
    if (Array.isArray(res)) {
      regionOptions.value = buildRegionTree(res);
    } else {
      regionOptions.value = [
        { id: 1, name: '示例园区A', level: 2 },
        { id: 2, name: '示例园区B', level: 2 },
      ];
    }
  } catch {
    regionOptions.value = [
      { id: 1, name: '示例园区A', level: 2 },
      { id: 2, name: '示例园区B', level: 2 },
    ];
  }
}

function buildRegionTree(list: RegionNode[]): RegionNode[] {
  const map = new Map<number, RegionNode>();
  const roots: RegionNode[] = [];
  for (const item of list) map.set(item.id, { ...item, children: [] });
  for (const item of list) {
    const node = map.get(item.id)!;
    if (item.parentId && map.has(item.parentId)) {
      map.get(item.parentId)!.children!.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

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
  if (!form.visitLocation.trim()) {
    message.warning('请填写拜访地点');
    return;
  }
  if (!form.visitContent.trim()) {
    message.warning('请填写拜访内容');
    return;
  }

  submitting.value = true;
  try {
    await createVisit({
      intakeId: props.intakeId,
      visitDate: form.visitDate.format('YYYY-MM-DD HH:mm:ss'),
      visitLocation: form.visitLocation,
      visitContent: form.visitContent,
      applicationRegionId: form.applicationRegionId,
      area: form.area,
      photos: photoUrls.value,
    });
    message.success('拜访记录已保存');
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
  form.visitDate = dayjs();
  form.visitLocation = '';
  form.visitContent = '';
  form.applicationRegionId = undefined;
  form.area = undefined;
  photoFileList.value = [];
  photoUrls.value = [];
}

onMounted(loadRegions);
</script>
