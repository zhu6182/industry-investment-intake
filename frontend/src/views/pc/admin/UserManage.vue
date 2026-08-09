<template>
  <div class="user-manage">
    <div class="header">
      <h2>用户管理</h2>
      <a-button type="primary" @click="openCreate">
        <template #icon><PlusOutlined /></template>
        新增用户
      </a-button>
    </div>

    <a-card class="filter-card">
      <a-form layout="inline" @finish="loadData">
        <a-form-item label="关键词">
          <a-input
            v-model:value="filters.keyword"
            placeholder="手机号/姓名"
            allow-clear
            style="width: 200px"
          />
        </a-form-item>
        <a-form-item label="角色">
          <a-select v-model:value="filters.roleId" placeholder="全部" allow-clear style="width: 160px">
            <a-select-option v-for="r in roles" :key="r.id" :value="r.id">{{ r.name }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit">查询</a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <a-card class="table-card">
      <a-table
        :columns="columns"
        :data-source="dataSource"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'roles'">
            <a-tag v-for="r in record.roles" :key="r.id" color="blue">{{ r.name }}</a-tag>
            <span v-if="!record.roles?.length" style="color: #999">无</span>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="record.isActive ? 'green' : 'red'">
              {{ record.isActive ? '启用' : '已停用' }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button type="link" size="small" @click="openEdit(record)">编辑</a-button>
              <a-button type="link" size="small" @click="openResetPwd(record)">重置密码</a-button>
              <a-popconfirm :title="record.isActive ? '确定停用？' : '确定启用？'" @confirm="handleToggleActive(record)">
                <a-button type="link" size="small">{{ record.isActive ? '停用' : '启用' }}</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-modal v-model:open="modalOpen" :title="modalTitle" @ok="handleSubmit" :confirm-loading="saving" width="560px">
      <a-form :model="form" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="手机号">
          <a-input v-model:value="form.phone" :disabled="modalMode === 'edit'" />
        </a-form-item>
        <a-form-item label="姓名">
          <a-input v-model:value="form.name" />
        </a-form-item>
        <a-form-item v-if="modalMode === 'create'" label="密码">
          <a-input-password v-model:value="form.password" />
        </a-form-item>
        <a-form-item label="邮箱">
          <a-input v-model:value="form.email" />
        </a-form-item>
        <a-form-item label="角色">
          <a-select v-model:value="form.roleIds" mode="multiple" placeholder="选择角色">
            <a-select-option v-for="r in roles" :key="r.id" :value="r.id">{{ r.name }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="所属区域">
          <a-tree-select
            v-model:value="form.regionId"
            :tree-data="regionTree"
            :field-names="{ title: 'name', value: 'id', key: 'id' }"
            placeholder="选择区域"
            allow-clear
            tree-default-expand-all
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:open="pwdModalOpen" title="重置密码" @ok="handleResetPwd" :confirm-loading="pwdSaving">
      <a-form :model="pwdForm" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="新密码">
          <a-input-password v-model:value="pwdForm.password" placeholder="留空则重置为 123456" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { message } from 'ant-design-vue';
import { PlusOutlined } from '@ant-design/icons-vue';
import { request } from '@/utils/request';
import { listRoles } from '@/api/modules/roles';
import { getRegionTree, type RegionNode } from '@/api/modules/regions';

interface UserRow {
  id: number;
  phone: string;
  name: string;
  email?: string;
  isActive: boolean;
  regionId?: number;
  region?: { name: string };
  roles: Array<{ id: number; code: string; name: string }>;
  createdAt: string;
}

const columns = [
  { title: 'ID', dataIndex: 'id', width: 70 },
  { title: '手机号', dataIndex: 'phone', width: 140 },
  { title: '姓名', dataIndex: 'name', width: 120 },
  { title: '角色', key: 'roles', width: 200 },
  { title: '所属区域', dataIndex: 'region', width: 140 },
  { title: '状态', key: 'status', width: 90 },
  { title: '创建时间', dataIndex: 'createdAt', width: 180 },
  { title: '操作', key: 'action', width: 240, fixed: 'right' as const },
];

const loading = ref(false);
const dataSource = ref<UserRow[]>([]);
const roles = ref<any[]>([]);
const regionTree = ref<RegionNode[]>([]);

const filters = reactive({ keyword: '', roleId: undefined as number | undefined });
const pagination = reactive({ current: 1, pageSize: 20, total: 0 });

async function loadData() {
  loading.value = true;
  try {
    const res = await request<{ list: UserRow[]; total: number }>({
      url: '/api/users',
      method: 'get',
      params: {
        page: pagination.current,
        limit: pagination.pageSize,
        keyword: filters.keyword || undefined,
        roleId: filters.roleId,
      },
    });
    dataSource.value = res.list;
    pagination.total = res.total;
  } catch (e: any) {
    message.error(e?.message || '加载失败');
  } finally {
    loading.value = false;
  }
}

async function loadMeta() {
  try {
    const [rs, tree] = await Promise.all([listRoles(), getRegionTree()]);
    roles.value = rs;
    regionTree.value = tree as any;
  } catch {}
}

function handleTableChange(pag: any) {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  loadData();
}

const modalOpen = ref(false);
const modalMode = ref<'create' | 'edit'>('create');
const saving = ref(false);
const editId = ref<number | null>(null);
const form = reactive({
  phone: '',
  name: '',
  password: '',
  email: '',
  roleIds: [] as number[],
  regionId: undefined as number | undefined,
});

const modalTitle = computed(() => (modalMode.value === 'create' ? '新增用户' : '编辑用户'));

function openCreate() {
  modalMode.value = 'create';
  editId.value = null;
  Object.assign(form, { phone: '', name: '', password: '', email: '', roleIds: [], regionId: undefined });
  modalOpen.value = true;
}

function openEdit(row: UserRow) {
  modalMode.value = 'edit';
  editId.value = row.id;
  Object.assign(form, {
    phone: row.phone,
    name: row.name,
    password: '',
    email: row.email || '',
    roleIds: row.roles.map((r) => r.id),
    regionId: row.regionId,
  });
  modalOpen.value = true;
}

async function handleSubmit() {
  if (!form.phone || !form.name) {
    message.warning('请填写必填项');
    return;
  }
  if (modalMode.value === 'create' && !form.password) {
    message.warning('请设置初始密码');
    return;
  }
  saving.value = true;
  try {
    if (modalMode.value === 'create') {
      await request({ url: '/api/users', method: 'post', data: form });
      message.success('创建成功');
    } else if (editId.value) {
      await request({ url: `/api/users/${editId.value}`, method: 'patch', data: form });
      message.success('更新成功');
    }
    modalOpen.value = false;
    await loadData();
  } catch (e: any) {
    message.error(e?.message || '操作失败');
  } finally {
    saving.value = false;
  }
}

async function handleToggleActive(row: UserRow) {
  try {
    await request({
      url: `/api/users/${row.id}`,
      method: 'patch',
      data: { isActive: !row.isActive },
    });
    message.success('操作成功');
    loadData();
  } catch (e: any) {
    message.error(e?.message || '操作失败');
  }
}

const pwdModalOpen = ref(false);
const pwdSaving = ref(false);
const pwdUserId = ref<number | null>(null);
const pwdForm = reactive({ password: '' });

function openResetPwd(row: UserRow) {
  pwdUserId.value = row.id;
  pwdForm.password = '';
  pwdModalOpen.value = true;
}

async function handleResetPwd() {
  if (!pwdUserId.value) return;
  pwdSaving.value = true;
  try {
    await request({
      url: `/api/users/${pwdUserId.value}/reset-password`,
      method: 'patch',
      data: { password: pwdForm.password || undefined },
    });
    message.success('密码已重置');
    pwdModalOpen.value = false;
  } catch (e: any) {
    message.error(e?.message || '操作失败');
  } finally {
    pwdSaving.value = false;
  }
}

onMounted(() => {
  loadMeta();
  loadData();
});
</script>

<style scoped>
.user-manage .header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
</style>
