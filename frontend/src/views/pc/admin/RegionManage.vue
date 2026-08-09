<template>
  <div class="region-manage">
    <div class="header">
      <h2>园区地区管理</h2>
    </div>

    <a-card>
      <a-row :gutter="16">
        <a-col :span="12">
          <h4>地区树</h4>
          <a-tree
            :tree-data="treeData"
            :expanded-keys="expandedKeys"
            :selected-keys="selectedKeys"
            @select="onSelect"
            @expand="onExpand"
          >
            <template #title="{ title, level }">
              <span>{{ title }}</span>
              <span style="margin-left: 8px; color: #999; font-size: 12px">
                L{{ level }}
              </span>
            </template>
          </a-tree>
        </a-col>

        <a-col :span="12">
          <div v-if="selectedNode">
            <h4>操作: {{ selectedNode.name }}</h4>
            <a-space style="margin-bottom: 16px">
              <a-button type="primary" @click="openCreateChild">新增子级</a-button>
              <a-button @click="openEdit">编辑</a-button>
              <a-popconfirm title="确定删除？" @confirm="handleDelete">
                <a-button danger>删除</a-button>
              </a-popconfirm>
            </a-space>

            <a-descriptions bordered :column="1" size="small">
              <a-descriptions-item label="名称">{{ selectedNode.name }}</a-descriptions-item>
              <a-descriptions-item label="层级">Level {{ selectedNode.level }}</a-descriptions-item>
              <a-descriptions-item label="父级ID">{{ selectedNode.parentId ?? '无' }}</a-descriptions-item>
            </a-descriptions>
          </div>
          <div v-else style="color: #999">
            点击左侧树节点查看详情
          </div>
        </a-col>
      </a-row>
    </a-card>

    <a-modal
      v-model:open="modalOpen"
      :title="modalTitle"
      @ok="handleSubmit"
      :confirm-loading="saving"
    >
      <a-form :model="form" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="名称">
          <a-input v-model:value="form.name" />
        </a-form-item>
        <a-form-item label="层级">
          <a-select v-model:value="form.level">
            <a-select-option :value="1">省/直辖市/自治区</a-select-option>
            <a-select-option :value="2">市/区</a-select-option>
            <a-select-option :value="3">园区/开发区</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="父级">
          <span v-if="form.parentId" style="color: #666">
            {{ parentName || `ID: ${form.parentId}` }}
          </span>
          <span v-else style="color: #999">顶级节点</span>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { message } from 'ant-design-vue';
import {
  getRegionTree,
  createRegion,
  updateRegion,
  deleteRegion,
  type RegionNode,
} from '@/api/modules/regions';

interface TreeNode {
  key: number;
  title: string;
  level: number;
  parentId: number | null;
  children?: TreeNode[];
}

const treeData = ref<TreeNode[]>([]);
const expandedKeys = ref<number[]>([]);
const selectedKeys = ref<number[]>([]);
const allRegions = ref<RegionNode[]>([]);

const selectedNode = computed(() => {
  if (!selectedKeys.value.length) return null;
  return allRegions.value.find((r) => r.id === selectedKeys.value[0]) || null;
});

const modalOpen = ref(false);
const modalMode = ref<'create' | 'edit'>('create');
const saving = ref(false);
const form = ref({ name: '', level: 1, parentId: null as number | null });
const editId = ref<number | null>(null);

const parentName = computed(() => {
  if (!form.value.parentId) return '';
  const p = allRegions.value.find((r) => r.id === form.value.parentId);
  return p?.name || '';
});

async function loadTree() {
  try {
    const tree = await getRegionTree();
    allRegions.value = flattenTree(tree);
    treeData.value = tree.map(toTreeNode);
    expandedKeys.value = treeData.value.map((t) => t.key as number);
  } catch (e) {
    message.error('加载地区数据失败');
  }
}

function flattenTree(tree: RegionNode[]): RegionNode[] {
  const result: RegionNode[] = [];
  const walk = (nodes: RegionNode[]) => {
    for (const n of nodes) {
      result.push(n);
      if (n.children) walk(n.children);
    }
  };
  walk(tree);
  return result;
}

function toTreeNode(n: RegionNode): TreeNode {
  return {
    key: n.id,
    title: n.name,
    level: n.level,
    parentId: n.parentId,
    children: n.children?.map(toTreeNode),
  };
}

function onSelect(keys: (string | number)[]) {
  selectedKeys.value = keys as number[];
}

function onExpand(keys: (string | number)[]) {
  expandedKeys.value = keys as number[];
}

const modalTitle = computed(() =>
  modalMode.value === 'create' ? '新增地区' : '编辑地区',
);

function openCreateChild() {
  if (!selectedNode.value) return;
  modalMode.value = 'create';
  editId.value = null;
  form.value = {
    name: '',
    level: (selectedNode.value.level + 1) as 1 | 2 | 3,
    parentId: selectedNode.value.id,
  };
  modalOpen.value = true;
}

function openEdit() {
  if (!selectedNode.value) return;
  modalMode.value = 'edit';
  editId.value = selectedNode.value.id;
  form.value = {
    name: selectedNode.value.name,
    level: selectedNode.value.level,
    parentId: selectedNode.value.parentId,
  };
  modalOpen.value = true;
}

async function handleSubmit() {
  if (!form.value.name.trim()) {
    message.warning('请填写名称');
    return;
  }
  saving.value = true;
  try {
    if (modalMode.value === 'create') {
      await createRegion({ ...form.value });
      message.success('创建成功');
    } else if (editId.value) {
      await updateRegion(editId.value, {
        name: form.value.name,
        level: form.value.level,
      });
      message.success('更新成功');
    }
    modalOpen.value = false;
    await loadTree();
  } catch (e: any) {
    message.error(e?.message || '操作失败');
  } finally {
    saving.value = false;
  }
}

async function handleDelete() {
  if (!selectedNode.value) return;
  try {
    await deleteRegion(selectedNode.value.id);
    message.success('删除成功');
    selectedKeys.value = [];
    await loadTree();
  } catch (e: any) {
    message.error(e?.message || '删除失败');
  }
}

onMounted(loadTree);
</script>

<style scoped>
.region-manage .header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
</style>
