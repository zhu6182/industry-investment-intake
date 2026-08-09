<template>
  <div class="role-manage">
    <div class="header">
      <h2>角色权限管理</h2>
    </div>

    <a-row :gutter="16">
      <a-col :span="8">
        <a-card title="角色列表">
          <a-list
            :data-source="roles"
            :loading="loadingRoles"
            item-layout="horizontal"
          >
            <template #renderItem="{ item }">
              <a-list-item
                :class="{ active: selectedRole?.id === item.id }"
                @click="selectedRole = item"
                style="cursor: pointer"
              >
                <a-list-item-meta :title="item.name">
                  <template #description>
                    {{ item.code }}
                    <span v-if="item.description" style="margin-left: 8px; color: #999">
                      · {{ item.description }}
                    </span>
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>

      <a-col :span="16">
        <a-card v-if="selectedRole" :title="`权限配置 - ${selectedRole.name}`">
          <div style="margin-bottom: 12px">
            <a-space>
              <a-button size="small" @click="checkAll">全选</a-button>
              <a-button size="small" @click="uncheckAll">全不选</a-button>
              <a-button size="small" type="primary" @click="savePermissions" :loading="saving">保存权限</a-button>
            </a-space>
          </div>

          <a-collapse v-model:activeKey="activeKeys" accordion>
            <a-collapse-panel
              v-for="(items, module) in groupedPermissions"
              :key="module"
              :header="`${module} (${items.length})`"
            >
              <a-checkbox-group v-model:value="checkedIds">
                <a-row :gutter="[16, 8]">
                  <a-col v-for="p in items" :key="p.id" :span="12">
                    <a-checkbox :value="p.id">{{ p.name }} <span style="color: #999; font-size: 12px">({{ p.code }})</span></a-checkbox>
                  </a-col>
                </a-row>
              </a-checkbox-group>
            </a-collapse-panel>
          </a-collapse>
        </a-card>
        <a-empty v-else description="请选择一个角色" />
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { message } from 'ant-design-vue';
import { listRoles, listPermissions, updateRolePermissions, type RoleItem, type PermissionItem } from '@/api/modules/roles';

const roles = ref<RoleItem[]>([]);
const permissions = ref<PermissionItem[]>([]);
const loadingRoles = ref(false);
const saving = ref(false);
const selectedRole = ref<RoleItem | null>(null);
const checkedIds = ref<number[]>([]);
const activeKeys = ref<string[]>([]);

const groupedPermissions = computed(() => {
  const groups: Record<string, PermissionItem[]> = {};
  for (const p of permissions.value) {
    if (!groups[p.module]) groups[p.module] = [];
    groups[p.module].push(p);
  }
  return groups;
});

watch(selectedRole, (role) => {
  if (role) {
    checkedIds.value = role.permissions.map((p) => p.id);
  } else {
    checkedIds.value = [];
  }
});

function checkAll() {
  checkedIds.value = permissions.value.map((p) => p.id);
}

function uncheckAll() {
  checkedIds.value = [];
}

async function savePermissions() {
  if (!selectedRole.value) return;
  saving.value = true;
  try {
    const updated = await updateRolePermissions(selectedRole.value.id, checkedIds.value);
    message.success('权限已保存');
    selectedRole.value = updated;
    const idx = roles.value.findIndex((r) => r.id === updated.id);
    if (idx !== -1) roles.value[idx] = updated;
  } catch (e: any) {
    message.error(e?.message || '保存失败');
  } finally {
    saving.value = false;
  }
}

async function loadData() {
  loadingRoles.value = true;
  try {
    const [rs, ps] = await Promise.all([listRoles(), listPermissions()]);
    roles.value = rs;
    permissions.value = ps;
    activeKeys.value = Object.keys(groupedPermissions.value);
  } catch (e: any) {
    message.error(e?.message || '加载失败');
  } finally {
    loadingRoles.value = false;
  }
}

onMounted(loadData);
</script>

<style scoped>
.role-manage .header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.role-manage .ant-list-item.active {
  background: #e6f4ff;
  border-radius: 4px;
}
</style>
