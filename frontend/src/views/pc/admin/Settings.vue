<template>
  <div class="sys-settings">
    <div class="header">
      <h2>系统设置</h2>
    </div>

    <!-- 报告模板配置 -->
    <a-card title="报告模板配置" style="margin-bottom: 16px">
      <a-form :label-col="{ span: 6 }" :wrapper-col="{ span: 12 }">
        <a-form-item
          v-for="(field, key) in template"
          :key="key"
          :label="fieldLabels[key] || key"
        >
          <a-space>
            <a-switch v-model:checked="field.visible" />
            <span v-if="field.visible" style="color: #666; margin-left: 8px">
              顺序:
              <a-input-number v-model:value="field.order" :min="1" :max="20" size="small" style="width: 70px" />
            </span>
          </a-space>
        </a-form-item>
      </a-form>

      <a-space>
        <a-button type="primary" :loading="saving" @click="save">保存配置</a-button>
        <a-button @click="resetDefaults">恢复默认</a-button>
      </a-space>
    </a-card>

    <!-- MCP 服务配置（火山 Agent Plan） -->
    <a-card title="MCP 服务配置（火山 Agent Plan）" style="margin-bottom: 16px">
      <a-alert
        type="info"
        show-icon
        style="margin-bottom: 16px"
        message="连接火山引擎 datapro.hqd.cn-beijing.volces.com 的 MCP 服务"
        description="配置保存后会自动写入 process.env (变量名: VOLC_MCP_ENABLED / VOLC_MCP_URL / VOLC_MCP_HEADERS / VOLC_MCP_TIMEOUT)，其他业务模块可直接读取。"
      />

      <a-form
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 16 }"
        :model="mcpForm"
      >
        <a-form-item label="启用 MCP">
          <a-switch
            v-model:checked="mcpForm.enabled"
            checked-children="开"
            un-checked-children="关"
          />
          <span class="form-hint">
            {{ mcpForm.enabled ? '已启用 - 其他模块可通过 env 读取' : '未启用' }}
          </span>
        </a-form-item>

        <a-form-item label="MCP URL" required>
          <a-input
            v-model:value="mcpForm.url"
            placeholder="https://datapro.hqd.cn-beijing.volces.com/mcp"
            allow-clear
          />
        </a-form-item>

        <a-form-item label="请求头 (Headers)">
          <div class="headers-editor">
            <div
              v-for="(item, idx) in headerList"
              :key="idx"
              class="header-row"
            >
              <a-input
                v-model:value="item.key"
                placeholder="Header 名称 (如 X-Agent-Plan-Key)"
                style="width: 38%; margin-right: 8px"
                @change="syncHeaders"
              />
              <a-input-password
                v-model:value="item.value"
                placeholder="Header 值"
                style="width: 50%; margin-right: 8px"
                @change="syncHeaders"
              />
              <a-button
                danger
                size="small"
                @click="removeHeader(idx)"
                :disabled="headerList.length <= 1"
              >删除</a-button>
            </div>
            <a-button size="small" @click="addHeader" type="dashed" style="margin-top: 8px">
              + 添加 Header
            </a-button>
          </div>
        </a-form-item>

        <a-form-item label="超时时间 (ms)">
          <a-input-number
            v-model:value="mcpForm.timeoutMs"
            :min="1000"
            :max="60000"
            :step="1000"
            style="width: 200px"
          />
        </a-form-item>

        <a-form-item label="备注">
          <a-textarea
            v-model:value="mcpForm.note"
            placeholder="可选，配置说明"
            :rows="2"
          />
        </a-form-item>

        <a-form-item :wrapper-col="{ offset: 4, span: 16 }">
          <a-space>
            <a-button
              type="primary"
              :loading="savingMcp"
              @click="saveMcp"
            >
              保存配置
            </a-button>
            <a-button
              :loading="testing"
              @click="testMcp"
            >
              <template #icon><ThunderboltOutlined /></template>
              测试连接
            </a-button>
            <a-button @click="resetMcp">恢复默认</a-button>
          </a-space>
        </a-form-item>
      </a-form>

      <!-- 测试结果 -->
      <div v-if="testResult" class="test-result" :class="testResult.ok ? 'ok' : 'fail'">
        <div class="result-head">
          <span class="result-icon">
            <CheckCircleFilled v-if="testResult.ok" />
            <CloseCircleFilled v-else />
          </span>
          <span class="result-msg">{{ testResult.message }}</span>
        </div>
        <div v-if="testResult.status" class="result-detail">
          HTTP {{ testResult.status }} {{ testResult.statusText }} · 延迟 {{ testResult.latencyMs }}ms
        </div>
        <div v-if="testResult.sample" class="result-sample">
          <pre>{{ testResult.sample }}</pre>
        </div>
      </div>

      <!-- 估算出的环境变量 -->
      <div v-if="testResult?.envSnapshot" class="env-snapshot">
        <h4>📦 运行时变量（process.env）</h4>
        <a-descriptions :column="1" size="small" bordered>
          <a-descriptions-item label="VOLC_MCP_ENABLED">
            <a-tag :color="testResult.envSnapshot.VOLC_MCP_ENABLED === 'true' ? 'green' : 'default'">
              {{ testResult.envSnapshot.VOLC_MCP_ENABLED || '(空)' }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="VOLC_MCP_URL">
            <code>{{ testResult.envSnapshot.VOLC_MCP_URL || '(空)' }}</code>
          </a-descriptions-item>
          <a-descriptions-item label="VOLC_MCP_HEADERS (JSON)">
            <code class="headers-code">{{ testResult.envSnapshot.VOLC_MCP_HEADERS || '(空)' }}</code>
          </a-descriptions-item>
          <a-descriptions-item label="VOLC_MCP_TIMEOUT">
            <code>{{ testResult.envSnapshot.VOLC_MCP_TIMEOUT || '(空)' }}ms</code>
          </a-descriptions-item>
        </a-descriptions>
        <a-typography-paragraph type="secondary" style="margin-top: 12px; font-size: 12px">
          💡 在后端代码中可通过 <code>ConfigService</code> 或 <code>process.env</code> 直接读取上述变量。
          <br />
          示例：<code>this.configService.get('VOLC_MCP_URL')</code>
        </a-typography-paragraph>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import {
  ThunderboltOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
} from '@ant-design/icons-vue';
import {
  getReportTemplate,
  updateReportTemplate,
  getMcpConfig,
  updateMcpConfig,
  testMcpConnection,
  type McpConfig,
  type McpTestResult,
} from '@/api/modules/settings';

const fieldLabels: Record<string, string> = {
  companyInfo: '企业基本信息',
  tycValidation: '天眼查核名结果',
  shareholding: '股东结构',
  financials: '财务数据',
  industryAnalysis: '行业分析',
  investmentRecommendation: '投资建议',
};

const DEFAULTS: Record<string, { visible: boolean; order: number }> = {
  companyInfo: { visible: true, order: 1 },
  tycValidation: { visible: true, order: 2 },
  shareholding: { visible: true, order: 3 },
  financials: { visible: false, order: 4 },
  industryAnalysis: { visible: true, order: 5 },
  investmentRecommendation: { visible: true, order: 6 },
};

const template = reactive<Record<string, { visible: boolean; order: number }>>({ ...DEFAULTS });
const saving = ref(false);

const DEFAULT_MCP: McpConfig = {
  enabled: false,
  url: 'https://datapro.hqd.cn-beijing.volces.com/mcp',
  headers: { 'X-Agent-Plan-Key': '' },
  timeoutMs: 30000,
  note: '',
};

const mcpForm = reactive<McpConfig>({ ...DEFAULT_MCP, headers: { ...DEFAULT_MCP.headers } });
const headerList = ref<{ key: string; value: string }[]>([{ key: 'X-Agent-Plan-Key', value: '' }]);
const savingMcp = ref(false);
const testing = ref(false);
const testResult = ref<McpTestResult | null>(null);

function headersToList(headers: Record<string, string>) {
  return Object.entries(headers).map(([key, value]) => ({ key, value }));
}

function listToHeaders(list: { key: string; value: string }[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const item of list) {
    if (item.key?.trim()) {
      result[item.key.trim()] = item.value ?? '';
    }
  }
  return result;
}

function syncHeaders() {
  mcpForm.headers = listToHeaders(headerList.value);
}

function addHeader() {
  headerList.value.push({ key: '', value: '' });
}

function removeHeader(idx: number) {
  headerList.value.splice(idx, 1);
  syncHeaders();
}

async function loadReport() {
  try {
    const data = await getReportTemplate();
    if (data) Object.assign(template, data);
  } catch (e: any) {
    message.error(e?.message || '加载报告模板失败');
  }
}

async function loadMcp() {
  try {
    const data = await getMcpConfig();
    mcpForm.enabled = data.enabled;
    mcpForm.url = data.url;
    mcpForm.headers = data.headers || {};
    mcpForm.timeoutMs = data.timeoutMs;
    mcpForm.note = data.note || '';
    headerList.value = headersToList(mcpForm.headers);
    if (headerList.value.length === 0) {
      headerList.value = [{ key: 'X-Agent-Plan-Key', value: '' }];
    }
  } catch (e: any) {
    message.error(e?.message || '加载 MCP 配置失败');
  }
}

async function save() {
  saving.value = true;
  try {
    await updateReportTemplate({ ...template });
    message.success('报告模板保存成功');
  } catch (e: any) {
    message.error(e?.message || '保存失败');
  } finally {
    saving.value = false;
  }
}

function resetDefaults() {
  Object.assign(template, DEFAULTS);
  message.info('已恢复默认，点击保存生效');
}

async function saveMcp() {
  // 强制从 DOM 同步 headers 值
  const headerRows = document.querySelectorAll('.header-row');
  headerRows.forEach((row, idx) => {
    const inputs = row.querySelectorAll('input');
    if (inputs.length >= 2 && headerList.value[idx]) {
      headerList.value[idx].key = (inputs[0] as HTMLInputElement).value;
      headerList.value[idx].value = (inputs[1] as HTMLInputElement).value;
    }
  });
  syncHeaders();
  if (!mcpForm.url) {
    message.error('MCP URL 不能为空');
    return;
  }
  savingMcp.value = true;
  try {
    const result = await updateMcpConfig({ ...mcpForm });
    Object.assign(mcpForm, result);
    headerList.value = headersToList(result.headers || {});
    message.success('MCP 配置已保存，并写入 process.env');
  } catch (e: any) {
    message.error(e?.message || '保存失败');
  } finally {
    savingMcp.value = false;
  }
}

async function testMcp() {
  syncHeaders();
  // 强制从 DOM 同步 headers 值 (防止 password input 的 v-model 异步问题)
  const inputs = document.querySelectorAll('input');
  const headerRows = document.querySelectorAll('.header-row');
  headerRows.forEach((row, idx) => {
    const inputs = row.querySelectorAll('input');
    if (inputs.length >= 2 && headerList.value[idx]) {
      headerList.value[idx].key = (inputs[0] as HTMLInputElement).value;
      headerList.value[idx].value = (inputs[1] as HTMLInputElement).value;
    }
  });
  syncHeaders();

  testing.value = true;
  try {
    const result = await testMcpConnection({ ...mcpForm });
    testResult.value = result;
    if (result.ok) {
      message.success(result.message);
    } else {
      message.warning(result.message);
    }
  } catch (e: any) {
    message.error(e?.message || '测试失败');
    testResult.value = {
      ok: false,
      latencyMs: 0,
      message: e?.message || '测试失败',
    };
  } finally {
    testing.value = false;
  }
}

function resetMcp() {
  Object.assign(mcpForm, DEFAULT_MCP, { headers: { ...DEFAULT_MCP.headers } });
  headerList.value = headersToList(DEFAULT_MCP.headers);
  testResult.value = null;
  message.info('已恢复默认，点击保存生效');
}

onMounted(() => {
  loadReport();
  loadMcp();
});
</script>

<style scoped>
.sys-settings .header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.form-hint {
  color: #999;
  margin-left: 12px;
  font-size: 12px;
}
.headers-editor {
  width: 100%;
}
.header-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
.test-result {
  margin: 16px 24px;
  padding: 16px;
  border-radius: 6px;
  border: 1px solid;
}
.test-result.ok {
  background: #f6ffed;
  border-color: #b7eb8f;
  color: #389e0d;
}
.test-result.fail {
  background: #fff2f0;
  border-color: #ffccc7;
  color: #cf1322;
}
.result-head {
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 15px;
}
.result-icon {
  margin-right: 8px;
  font-size: 18px;
}
.result-detail {
  margin-top: 6px;
  font-size: 12px;
  opacity: 0.85;
}
.result-sample {
  margin-top: 8px;
  font-size: 11px;
  background: rgba(0, 0, 0, 0.04);
  padding: 8px;
  border-radius: 4px;
  max-height: 120px;
  overflow: auto;
}
.result-sample pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  font-family: 'Consolas', monospace;
}
.env-snapshot {
  margin: 16px 24px;
  padding: 16px;
  background: #f0f5ff;
  border-radius: 6px;
  border: 1px solid #adc6ff;
}
.env-snapshot h4 {
  margin: 0 0 12px 0;
  color: #1677ff;
  font-size: 14px;
}
.headers-code {
  word-break: break-all;
  white-space: pre-wrap;
  font-size: 11px;
}
</style>
