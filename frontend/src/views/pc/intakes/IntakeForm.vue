<template>
  <div class="intake-form">
    <div class="page-header">
      <a-button @click="goBack">
        <template #icon><ArrowLeftOutlined /></template>
        返回
      </a-button>
      <h2>新建进件</h2>
    </div>

    <a-card>
      <a-steps :current="currentStep" class="steps">
        <a-step title="查询" description="查询企业名" />
        <a-step title="填写" description="企业信息" />
        <a-step title="上传" description="材料文件" />
        <a-step title="提交" description="核名结果" />
      </a-steps>

      <!-- Step 1: 查询 -->
      <div v-if="currentStep === 0" class="step-content">
        <a-form layout="vertical">
          <a-form-item label="企业名称" required>
            <a-input
              v-model:value="form.companyName"
              placeholder="请输入完整企业名称，如：杭州灵犀智能科技有限公司"
              size="large"
              :maxlength="100"
              @press-enter="doCheck"
            />
          </a-form-item>

          <a-form-item>
            <a-button
              type="primary"
              size="large"
              :loading="checking"
              :disabled="!form.companyName.trim() || (checkResult?.exists === true)"
              @click="doCheck"
              block
            >
              <template #icon><SearchOutlined /></template>
              查询查重 + 自动填充
            </a-button>
            <div class="query-source-hint">统一走火山 Agent Plan MCP 真实企业数据</div>
          </a-form-item>

          <a-alert
            v-if="checkResult && checkResult.exists"
            type="error"
            show-icon
            message="该企业已提交过进件，请勿重复提交"
            description="如需重新发起请联系中台运营。"
            style="margin-bottom: 16px"
          />

          <a-spin :spinning="checking" tip="正在通过火山 MCP 查询企业信息...">
            <div v-if="lookupResult && !checkResult?.exists" class="tyc-card">
              <a-row :gutter="16">
                <a-col :span="9">
                  <div class="tyc-section">
                    <div class="tyc-section-title">
                      <SafetyCertificateOutlined /> 企业信息
                      <a-tag
                        v-if="lookupResult.source"
                        :color="lookupResult.source === 'mcp' ? 'green' : (lookupResult.source === 'error' ? 'red' : 'orange')"
                        size="small"
                        class="tyc-source-tag"
                        :title="sourceTitle(lookupResult.source)"
                      >
                        {{ sourceLabel(lookupResult.source) }}
                      </a-tag>
                      <a-tag
                        v-if="lookupResult.datasetType"
                        color="cyan"
                        size="small"
                        style="margin-left: 4px"
                      >
                        dataset: {{ lookupResult.datasetType }}
                      </a-tag>
                      <a-tag
                        v-if="lookupResult.latencyMs"
                        color="default"
                        size="small"
                        style="margin-left: 4px"
                      >
                        延迟: {{ lookupResult.latencyMs }}ms
                      </a-tag>
                    </div>
                    <a-descriptions :column="1" size="small" bordered class="tyc-descriptions">
                      <a-descriptions-item label="统一社会信用代码">
                        {{ lookupResult.company.creditCode || '-' }}
                      </a-descriptions-item>
                      <a-descriptions-item label="法人">
                        {{ lookupResult.company.legalPerson || '-' }}
                      </a-descriptions-item>
                      <a-descriptions-item label="成立日期">
                        {{ lookupResult.company.establishDate || '-' }}
                      </a-descriptions-item>
                      <a-descriptions-item label="注册资本">
                        {{ lookupResult.company.registeredCapital || '-' }}
                      </a-descriptions-item>
                      <a-descriptions-item label="经营状态">
                        <a-tag :color="lookupResult.company.status === '存续' ? 'green' : 'orange'">
                          {{ lookupResult.company.status || '-' }}
                        </a-tag>
                      </a-descriptions-item>
                      <a-descriptions-item label="行业分类">
                        {{ lookupResult.company.industry || '-' }}
                      </a-descriptions-item>
                    </a-descriptions>
                    <a-button
                      type="dashed"
                      block
                      style="margin-top: 12px"
                      :disabled="!lookupResult.isValid"
                      @click="applyToForm"
                    >
                      <template #icon><ImportOutlined /></template>
                      一键填充到下方表单
                    </a-button>
                  </div>
                </a-col>

                <a-col :span="8">
                  <div class="tyc-section">
                    <div class="tyc-section-title">
                      <TrophyOutlined /> 综合评分
                    </div>
                    <div class="rating-card">
                      <div class="rating-circle" :class="ratingClass">
                        <div class="rating-num">{{ lookupResult.rating ?? 0 }}</div>
                        <div class="rating-unit">/100</div>
                      </div>
                      <div class="rating-tags">
                        <a-tag
                          v-for="(tag, i) in lookupResult.ratingBreakdown?.tags || []"
                          :key="i"
                          color="cyan"
                        >
                          {{ tag }}
                        </a-tag>
                        <a-tag v-if="!lookupResult.ratingBreakdown?.tags?.length" color="default">
                          暂无标签
                        </a-tag>
                      </div>
                      <div class="rating-breakdown">
                        <div class="bd-item">
                          <span class="bd-label">成立年限</span>
                          <a-progress
                            :percent="bdPct(lookupResult.ratingBreakdown?.age, lookupResult.ratingBreakdown?.ageMax)"
                            :show-info="false"
                            size="small"
                            stroke-color="#00d4ff"
                          />
                          <span class="bd-val">
                            {{ lookupResult.ratingBreakdown?.age || 0 }}/{{ lookupResult.ratingBreakdown?.ageMax || 0 }}
                          </span>
                        </div>
                        <div class="bd-item">
                          <span class="bd-label">注册资本</span>
                          <a-progress
                            :percent="bdPct(lookupResult.ratingBreakdown?.registeredCapital, lookupResult.ratingBreakdown?.registeredCapitalMax)"
                            :show-info="false"
                            size="small"
                            stroke-color="#4ecca3"
                          />
                          <span class="bd-val">
                            {{ lookupResult.ratingBreakdown?.registeredCapital || 0 }}/{{ lookupResult.ratingBreakdown?.registeredCapitalMax || 0 }}
                          </span>
                        </div>
                        <div class="bd-item">
                          <span class="bd-label">经营状态</span>
                          <a-progress
                            :percent="bdPct(lookupResult.ratingBreakdown?.status, lookupResult.ratingBreakdown?.statusMax)"
                            :show-info="false"
                            size="small"
                            stroke-color="#ffd93d"
                          />
                          <span class="bd-val">
                            {{ lookupResult.ratingBreakdown?.status || 0 }}/{{ lookupResult.ratingBreakdown?.statusMax || 0 }}
                          </span>
                        </div>
                        <div class="bd-item">
                          <span class="bd-label">风险评估</span>
                          <a-progress
                            :percent="bdPct(lookupResult.ratingBreakdown?.risk, lookupResult.ratingBreakdown?.riskMax)"
                            :show-info="false"
                            size="small"
                            :stroke-color="riskColor"
                          />
                          <span class="bd-val">
                            {{ lookupResult.ratingBreakdown?.risk || 0 }}/{{ lookupResult.ratingBreakdown?.riskMax || 0 }}
                          </span>
                        </div>
                        <div class="bd-item">
                          <span class="bd-label">行业加分</span>
                          <a-progress
                            :percent="bdPct(lookupResult.ratingBreakdown?.industry, lookupResult.ratingBreakdown?.industryMax)"
                            :show-info="false"
                            size="small"
                            stroke-color="#ff6b9d"
                          />
                          <span class="bd-val">
                            {{ lookupResult.ratingBreakdown?.industry || 0 }}/{{ lookupResult.ratingBreakdown?.industryMax || 0 }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </a-col>

                <a-col :span="7">
                  <div class="tyc-section">
                    <div class="tyc-section-title">
                      <AlertOutlined /> 风险检查
                    </div>
                    <div class="risk-card" :class="`risk-${lookupResult.risk?.riskLevel || 'low'}`">
                      <div class="risk-level">
                        <span class="risk-label">风险等级</span>
                        <a-tag :color="riskColor" style="font-size: 14px; padding: 2px 12px">
                          {{ riskText }}
                        </a-tag>
                      </div>
                      <div class="risk-items">
                        <div class="risk-item">
                          <CheckCircleOutlined v-if="!lookupResult.risk?.hasExecution" class="risk-icon ok" />
                          <CloseCircleOutlined v-else class="risk-icon bad" />
                          <span>无在途执行案件</span>
                        </div>
                        <div class="risk-item">
                          <CheckCircleOutlined v-if="!lookupResult.risk?.hasDishonesty" class="risk-icon ok" />
                          <CloseCircleOutlined v-else class="risk-icon bad" />
                          <span>非失信被执行人</span>
                        </div>
                        <div class="risk-item">
                          <CheckCircleOutlined v-if="!lookupResult.risk?.hasLawsuit" class="risk-icon ok" />
                          <InfoCircleOutlined v-else class="risk-icon warn" />
                          <span>无司法诉讼记录</span>
                        </div>
                        <div class="risk-item">
                          <CheckCircleOutlined v-if="!lookupResult.risk?.isRevoked" class="risk-icon ok" />
                          <CloseCircleOutlined v-else class="risk-icon bad" />
                          <span>未注销 / 未吊销</span>
                        </div>
                        <div class="risk-item">
                          <CheckCircleOutlined v-if="meetsAgeRequirement" class="risk-icon ok" />
                          <CloseCircleOutlined v-else class="risk-icon bad" />
                          <span>注册时间 ≥ 2 年</span>
                        </div>
                      </div>
                    </div>

                    <a-alert
                      v-if="lookupResult.reasons.length"
                      type="warning"
                      show-icon
                      style="margin-top: 12px"
                      message="未通过项"
                    >
                      <template #description>
                        <ul style="margin: 0; padding-left: 20px">
                          <li v-for="r in lookupResult.reasons" :key="r">{{ r }}</li>
                        </ul>
                      </template>
                    </a-alert>
                    <a-alert
                      v-else
                      type="success"
                      show-icon
                      style="margin-top: 12px"
                      message="所有核名项均通过"
                    />
                  </div>
                </a-col>
              </a-row>
            </div>
          </a-spin>
        </a-form>
      </div>

      <!-- Step 2: 填写 -->
      <div v-else-if="currentStep === 1" class="step-content">
        <a-form :model="form" :label-col="{ span: 4 }" :wrapper-col="{ span: 16 }">
          <a-divider>基本信息</a-divider>
          <a-form-item label="企业名称" required>
            <a-input v-model:value="form.companyName" disabled />
          </a-form-item>
          <a-form-item label="统一社会信用代码">
            <a-input v-model:value="form.creditCode" placeholder="天眼查自动填充" />
          </a-form-item>
          <a-form-item label="法人">
            <a-input v-model:value="form.legalPerson" />
          </a-form-item>
          <a-form-item label="成立日期">
            <a-date-picker
              v-model:value="form.establishDateDayjs"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </a-form-item>
          <a-form-item label="行业分类">
            <a-input v-model:value="form.industry" />
          </a-form-item>
          <a-form-item label="申请园区地区">
            <a-input-number
              v-model:value="form.applicationRegionId"
              placeholder="地区ID"
              style="width: 100%"
            />
          </a-form-item>
          <a-form-item label="入驻面积(㎡)">
            <a-input-number
              v-model:value="form.area"
              :min="0"
              :precision="2"
              style="width: 100%"
            />
          </a-form-item>

          <a-divider>股东结构</a-divider>
          <a-form-item label="股东结构">
            <div class="shareholder-editor">
              <div v-for="(sh, idx) in shareholders" :key="idx" class="sh-row">
                <a-input
                  v-model:value="sh.name"
                  placeholder="股东姓名/公司名"
                  style="width: 240px"
                />
                <a-input-number
                  v-model:value="sh.ratio"
                  placeholder="持股比例%"
                  :min="0"
                  :max="100"
                  :precision="2"
                  style="width: 160px; margin-left: 8px"
                />
                <a-button type="link" danger style="margin-left: 8px" @click="removeShareholder(idx)">
                  删除
                </a-button>
              </div>
              <a-button type="dashed" block @click="addShareholder">
                <template #icon><PlusOutlined /></template>
                添加股东
              </a-button>
            </div>
          </a-form-item>
        </a-form>
      </div>

      <!-- Step 3: 上传 -->
      <div v-else-if="currentStep === 2" class="step-content">
        <a-row :gutter="24">
          <a-col :span="12">
            <h4>企业申请表</h4>
            <a-upload
              :before-upload="(f: UploadFileLike) => handleUpload(f, 'application')"
              :show-upload-list="false"
              accept=".pdf,.doc,.docx"
            >
              <a-button>选择文件</a-button>
            </a-upload>
            <p v-if="uploadedFiles.application" class="file-info">
              {{ uploadedFiles.application.originalName }}
              <a-button type="link" danger size="small" @click="removeUploaded('application')">删除</a-button>
            </p>
          </a-col>
          <a-col :span="12">
            <h4>企业PPT</h4>
            <a-upload
              :before-upload="(f: UploadFileLike) => handleUpload(f, 'ppt')"
              :show-upload-list="false"
              accept=".ppt,.pptx,.pdf"
            >
              <a-button>选择文件</a-button>
            </a-upload>
            <p v-if="uploadedFiles.ppt" class="file-info">
              {{ uploadedFiles.ppt.originalName }}
              <a-button type="link" danger size="small" @click="removeUploaded('ppt')">删除</a-button>
            </p>
          </a-col>
          <a-col :span="12" style="margin-top: 24px">
            <h4>资料表</h4>
            <a-upload
              :before-upload="(f: UploadFileLike) => handleUpload(f, 'data_sheet')"
              :show-upload-list="false"
              accept=".xls,.xlsx"
            >
              <a-button>选择文件</a-button>
            </a-upload>
            <p v-if="uploadedFiles.data_sheet" class="file-info">
              {{ uploadedFiles.data_sheet.originalName }}
              <a-button type="link" danger size="small" @click="removeUploaded('data_sheet')">删除</a-button>
            </p>
          </a-col>
          <a-col :span="12" style="margin-top: 24px">
            <h4>现场照片（可多张）</h4>
            <a-upload
              list-type="picture"
              multiple
              :before-upload="(f: UploadFileLike) => handleUpload(f, 'photo')"
              :show-upload-list="false"
              accept="image/*"
            >
              <a-button>添加照片</a-button>
            </a-upload>
            <div v-if="uploadedFiles.photos.length > 0" class="photo-list">
              <a-image
                v-for="(p, i) in uploadedFiles.photos"
                :key="i"
                :src="p.url"
                :width="100"
                :height="100"
                style="object-fit: cover; margin-right: 8px"
              />
            </div>
          </a-col>
        </a-row>
      </div>

      <!-- Step 4: 提交 -->
      <div v-else-if="currentStep === 3" class="step-content">
        <div v-if="submitting" class="loading">
          <a-spin size="large" tip="正在提交并核名..." />
        </div>
        <div v-else-if="submitResult">
          <a-result
            :status="submitResult.tycValidation?.isValid ? 'success' : 'error'"
            :title="submitResult.tycValidation?.isValid ? '核名通过' : '核名未通过'"
            :sub-title="submitResult.tycValidation?.reasons?.join('；') || ''"
          >
            <template #extra>
              <a-button type="primary" @click="goDetail(submitResult.id)">查看详情</a-button>
            </template>
          </a-result>
        </div>
      </div>

      <div class="step-footer">
        <a-button
          v-if="currentStep > 0 && currentStep < 3"
          @click="currentStep--"
        >
          上一步
        </a-button>
        <a-button
          v-if="currentStep < 2"
          type="primary"
          :disabled="currentStep === 0 && !canGoNextFromStep0"
          @click="currentStep++"
        >
          下一步
        </a-button>
        <a-button
          v-if="currentStep === 2"
          type="primary"
          :loading="submitting"
          @click="doSubmit"
        >
          提交进件
        </a-button>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import {
  ArrowLeftOutlined,
  PlusOutlined,
  SearchOutlined,
  SafetyCertificateOutlined,
  TrophyOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  ImportOutlined,
} from '@ant-design/icons-vue';
import {
  createIntake,
  uploadFile,
  checkIntakeExists,
  type Intake,
  type CompanyLookupResult,
  type IntakeCheckResult,
} from '@/api/modules/intakes';
import { searchMcpCompany, type McpCompanySearchResult } from '@/api/modules/mcp';
import { useUserStore } from '@/stores/user';

type UploadFileLike = {
  originFileObj?: File;
  file?: File;
};

const router = useRouter();
const userStore = useUserStore();
const currentStep = ref(0);
const checking = ref(false);
const checkResult = ref<{ exists: boolean } | null>(null);
const duplicateCheckInfo = ref<IntakeCheckResult | null>(null);
const lookupResult = ref<CompanyLookupResult | null>(null);
const submitting = ref(false);
const submitResult = ref<Intake | null>(null);

const sourceLabel = (s?: string) => {
  if (s === 'mcp') return '火山 MCP 真实数据';
  if (s === 'error') return '调用失败';
  if (s === 'unconfigured') return 'MCP 未配置';
  return 'MCP 查询';
};
const sourceTitle = (s?: string) => {
  if (s === 'mcp') return '数据来自火山引擎 datapro.hqd.cn-beijing.volces.com MCP 真实企业数据库';
  if (s === 'error') return '查询失败';
  return '通过火山 Agent Plan MCP 查询';
};
const mcpToLookupResult = (mcp: McpCompanySearchResult): any => {
  const it = mcp.items[0];
  if (!it) {
    return {
      isValid: false,
      reasons: [mcp.message || '未查询到企业'],
      rating: 0,
      company: { name: '', shareholders: [] },
      source: 'mcp',
      datasetType: mcp.datasetType,
      latencyMs: mcp.latencyMs,
      message: mcp.message,
    };
  }
  const ageYears = it.establishDate
    ? Math.floor(
        (Date.now() - new Date(it.establishDate).getTime()) / (1000 * 60 * 60 * 24 * 365),
      )
    : 0;
  const isActive = !!(it.status && (it.status.includes('存续') || it.status.includes('在营')));
  const hasCap = !!it.registeredCapital && !it.registeredCapital.startsWith('-');
  const baseRating =
    (ageYears >= 5 ? 20 : ageYears >= 2 ? 12 : 5) +
    (isActive ? 25 : 0) +
    (hasCap ? 15 : 5) +
    (it.creditCode ? 20 : 0) +
    20;
  return {
    isValid: !!it.creditCode && isActive,
    reasons: isActive ? [] : ['企业状态非存续'],
    rating: Math.min(100, baseRating),
    company: {
      name: it.name,
      creditCode: it.creditCode,
      legalPerson: it.legalPerson,
      establishDate: it.establishDate,
      status: it.status,
      registeredCapital: it.registeredCapital,
      industry: it.industry,
      registerAddress: it.registerAddress,
      scope: it.scope,
      registryAuthority: it.registryAuthority,
      shareholders: parseShareholdersFromMcp(it.raw),
    },
    source: 'mcp',
    datasetType: mcp.datasetType,
    latencyMs: mcp.latencyMs,
    message: mcp.message,
  };
};

// 仅走 MCP 真实数据

const riskColor = computed(() => {
  const level = lookupResult.value?.risk?.riskLevel;
  if (level === 'high') return '#ff4d4f';
  if (level === 'medium') return '#faad14';
  return '#52c41a';
});

const riskText = computed(() => {
  const level = lookupResult.value?.risk?.riskLevel;
  if (level === 'high') return '高风险';
  if (level === 'medium') return '中等风险';
  return '低风险';
});

const ratingClass = computed(() => {
  const r = lookupResult.value?.rating ?? 0;
  if (r >= 80) return 'rating-excellent';
  if (r >= 60) return 'rating-good';
  if (r >= 40) return 'rating-medium';
  return 'rating-low';
});

const meetsAgeRequirement = computed(() => {
  const dateStr = lookupResult.value?.company?.establishDate;
  if (!dateStr) return false;
  const start = new Date(dateStr);
  if (Number.isNaN(start.getTime())) return false;
  const years = (Date.now() - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  return years >= 2;
});

function bdPct(value: number | undefined, max: number | undefined) {
  if (!value || !max) return 0;
  return Math.round((value / max) * 100);
}

const form = reactive({
  companyName: '',
  creditCode: '',
  legalPerson: '',
  establishDate: '',
  establishDateDayjs: null as any,
  industry: '',
  shareholders: '',
  applicationRegionId: undefined as number | undefined,
  area: undefined as number | undefined,
});

const shareholders = ref<Array<{ name: string; ratio?: number }>>([]);

const uploadedFiles = reactive<{
  application: any;
  ppt: any;
  data_sheet: any;
  photos: any[];
}>({
  application: null,
  ppt: null,
  data_sheet: null,
  photos: [],
});

watch(
  () => form.companyName,
  () => {
    checkResult.value = null;
    duplicateCheckInfo.value = null;
  },
);

const canGoNextFromStep0 = computed(() => lookupResult.value?.isValid === true && lookupResult.value?.canProceed === true);

async function doCheck() {
  if (!form.companyName.trim()) {
    message.warning('请输入企业名称');
    return;
  }
  checking.value = true;
  checkResult.value = null;
  lookupResult.value = null;
  duplicateCheckInfo.value = null;
  try {
    const name = form.companyName.trim();
    const dup = await checkIntakeExists(name);
    if (dup.exists) {
      const u = userStore.userInfo;
      console.warn(`[查重命中] "${name}" 已有进件 #${dup.intakeId} (${dup.status}) - 查询人: ${u?.name} (id=${u?.id}) at ${new Date().toISOString()}`);
      duplicateCheckInfo.value = dup;
      checkResult.value = { exists: true };
      message.error('该企业已提交过进件，请勿重复提交。如需重新发起请联系中台运营。');
      return;
    }
    const mcp = await searchMcpCompany(name);
    const result: any = mcpToLookupResult(mcp);
    lookupResult.value = result;
    checkResult.value = { exists: false };
    if (!result.isValid) {
      message.warning(result.reasons?.join('；') || '企业核名未通过，请查看未通过项');
    } else {
      message.success(`核名通过，综合评分 ${result.rating ?? 0} 分`);
    }
  } catch (e: any) {
    message.error(e.message || '查询失败');
  } finally {
    checking.value = false;
  }
}

function parseShareholdersFromMcp(raw: any): Array<{ name: string; ratio?: number }> {
  if (!raw) return [];
  const jsonStr =
    raw['股东信息记录(JSON字符串)'] ||
    raw['股东信息记录'] ||
    raw['投资人信息']?.['当前投资人Top5明细，按股权占比倒序'];
  if (!jsonStr) return [];
  let arr: any[] = [];
  try {
    arr = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr;
  } catch {
    return [];
  }
  if (!Array.isArray(arr)) return [];
  return arr
    .map((it) => {
      const name = it.股东名称 || it.investor_name || it.name;
      const ratioStr = it.股权占比 || it.ownership_stake || it.ratio;
      let ratio: number | undefined = undefined;
      if (typeof ratioStr === 'string') {
        const f = parseFloat(ratioStr);
        if (!Number.isNaN(f)) ratio = f < 1 ? +(f * 100).toFixed(2) : +f.toFixed(2);
      } else if (typeof ratioStr === 'number') {
        ratio = ratioStr < 1 ? +(ratioStr * 100).toFixed(2) : +ratioStr.toFixed(2);
      }
      return { name, ratio };
    })
    .filter((s) => s.name);
}

function applyToForm() {
  if (!lookupResult.value?.company) return;
  const c = lookupResult.value.company;
  form.companyName = c.name || form.companyName;
  form.creditCode = c.creditCode || '';
  form.legalPerson = c.legalPerson || '';
  if (c.establishDate) {
    const d = new Date(c.establishDate);
    if (!Number.isNaN(d.getTime())) {
      const iso = d.toISOString().slice(0, 10);
      form.establishDate = iso;
      form.establishDateDayjs = iso;
    }
  }
  form.industry = c.industry || '';
  if (Array.isArray(c.shareholders) && c.shareholders.length) {
    shareholders.value = c.shareholders.map((s) => ({
      name: s.name,
      ratio: typeof s.ratio === 'number' ? s.ratio : undefined,
    }));
  } else {
    shareholders.value = [];
  }
  message.success('企业信息已自动填充，请进入下一步完善');
  currentStep.value = 1;
}

function addShareholder() {
  shareholders.value.push({ name: '', ratio: undefined });
}

function removeShareholder(idx: number) {
  shareholders.value.splice(idx, 1);
}

function removeUploaded(type: keyof typeof uploadedFiles) {
  if (type === 'photos') {
    uploadedFiles.photos = [];
  } else {
    uploadedFiles[type] = null;
  }
}

async function handleUpload(file: UploadFileLike, type: string): Promise<boolean> {
  try {
    const rawFile = (file as any).originFileObj || file;
    const result = await uploadFile(rawFile);
    if (type === 'photo') {
      uploadedFiles.photos.push(result);
    } else {
      (uploadedFiles as any)[type] = result;
    }
    return false;
  } catch (e: any) {
    message.error(e.message || '上传失败');
    return false;
  }
}

async function doSubmit() {
  submitting.value = true;
  try {
    form.shareholders = JSON.stringify(
      shareholders.value.filter((s) => s.name),
    );
    const payload = { ...form };
    delete (payload as any).establishDateDayjs;
    const intake = await createIntake(payload);
    submitResult.value = intake;
    currentStep.value = 3;
  } catch (e: any) {
    message.error(e.message || '提交失败');
  } finally {
    submitting.value = false;
  }
}

function goDetail(id: number) {
  router.push(`/pc/intakes/${id}`);
}

function goBack() {
  router.back();
}
</script>

<style scoped>
.intake-form {
  padding: 24px;
}
.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}
.page-header h2 {
  margin: 0;
}
.steps {
  margin-bottom: 32px;
}
.step-content {
  min-height: 300px;
}
.step-footer {
  margin-top: 32px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
  text-align: center;
}
.shareholder-editor {
  width: 100%;
}
.sh-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
.file-info {
  margin-top: 8px;
  font-size: 12px;
  color: #666;
}
.photo-list {
  margin-top: 8px;
}
.loading {
  text-align: center;
  padding: 60px 0;
}

.tyc-card {
  margin-top: 16px;
  background: linear-gradient(135deg, #fafbff 0%, #f0f5ff 100%);
  border: 1px solid #d6e4ff;
  border-radius: 8px;
  padding: 20px;
}

.tyc-section {
  height: 100%;
}

.tyc-section-title {
  font-size: 14px;
  font-weight: 600;
  color: #1677ff;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e6e8eb;
  display: flex;
  align-items: center;
  gap: 6px;
}

.tyc-descriptions {
  font-size: 13px;
}

.tyc-descriptions :deep(.ant-descriptions-item-label) {
  background: #fafbff !important;
  color: #666;
  width: 100px;
  text-align: right;
  padding-right: 12px !important;
}

.tyc-source-tag {
  margin-left: 8px;
  font-size: 11px;
  padding: 0 6px;
  line-height: 18px;
}

.query-source-hint {
  font-size: 12px;
  color: #888;
  margin-top: 6px;
  margin-bottom: 12px;
  padding-left: 4px;
}
.tyc-descriptions :deep(.ant-descriptions-item-content) {
  padding-left: 12px !important;
  color: #333;
}

.rating-card {
  text-align: center;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid #e6e8eb;
  border-radius: 6px;
  padding: 16px 12px;
}

.rating-circle {
  width: 120px;
  height: 120px;
  margin: 0 auto 12px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  color: #fff;
  font-weight: bold;
}
.rating-circle::before {
  content: '';
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 2px solid currentColor;
  opacity: 0.3;
}
.rating-circle.rating-excellent {
  background: linear-gradient(135deg, #52c41a, #389e0d);
  box-shadow: 0 4px 16px rgba(82, 196, 26, 0.4);
}
.rating-circle.rating-good {
  background: linear-gradient(135deg, #1677ff, #0958d9);
  box-shadow: 0 4px 16px rgba(22, 119, 255, 0.4);
}
.rating-circle.rating-medium {
  background: linear-gradient(135deg, #faad14, #d48806);
  box-shadow: 0 4px 16px rgba(250, 173, 20, 0.4);
}
.rating-circle.rating-low {
  background: linear-gradient(135deg, #ff4d4f, #cf1322);
  box-shadow: 0 4px 16px rgba(255, 77, 79, 0.4);
}

.rating-num {
  font-size: 42px;
  line-height: 1;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}
.rating-unit {
  font-size: 13px;
  opacity: 0.85;
  margin-top: 2px;
}

.rating-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: center;
  margin-bottom: 14px;
}

.rating-breakdown {
  text-align: left;
}
.bd-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 12px;
}
.bd-label {
  width: 60px;
  color: #666;
  flex-shrink: 0;
}
.bd-item :deep(.ant-progress) {
  flex: 1;
  margin: 0 !important;
}
.bd-val {
  width: 60px;
  text-align: right;
  color: #333;
  font-family: 'Consolas', monospace;
  font-size: 11px;
  flex-shrink: 0;
}

.risk-card {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 6px;
  padding: 14px;
  border: 1px solid;
}
.risk-card.risk-low { border-color: #b7eb8f; background: linear-gradient(180deg, #f6ffed 0%, #ffffff 100%); }
.risk-card.risk-medium { border-color: #ffe58f; background: linear-gradient(180deg, #fffbe6 0%, #ffffff 100%); }
.risk-card.risk-high { border-color: #ffa39e; background: linear-gradient(180deg, #fff1f0 0%, #ffffff 100%); }

.risk-level {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px dashed #e6e8eb;
}
.risk-label {
  font-size: 13px;
  color: #666;
  font-weight: 500;
}

.risk-items {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.risk-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #333;
}
.risk-icon { font-size: 16px; }
.risk-icon.ok { color: #52c41a; }
.risk-icon.bad { color: #ff4d4f; }
.risk-icon.warn { color: #faad14; }
</style>
