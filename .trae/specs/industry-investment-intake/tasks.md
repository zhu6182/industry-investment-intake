# 产业投资进件系统 - 实施计划

## [x] Task 1: 项目基础架构搭建
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 前端脚手架初始化（Vue 3 + TypeScript + Vite + Ant Design Vue + Vant）
  - 响应式布局基础配置（CSS变量、断点、PC/手机端路由共存方案）
  - 后端脚手架初始化（待定：NestJS 或 Spring Boot）
  - MySQL数据库初始化，创建用户表、角色表、权限表等基础表结构
  - Redis配置（用于缓存天眼查数据、会话管理）
  - 对象存储服务配置（OSS/COS）
  - 文件解析库集成（PPT解析、Excel解析）
  - PDF生成库集成
  - 项目目录规范与Git初始化
- **Acceptance Criteria Addressed**: NFR-2, NFR-3, NFR-4
- **Test Requirements**:
  - `programmatic` TR-1.1: 前端项目可 `npm run dev` 启动，PC端和手机端预览正常
  - `programmatic` TR-1.2: 后端可启动并连接MySQL和Redis
  - `programmatic` TR-1.3: PDF生成库和文件解析库可正常运行
  - `human-judgement` TR-1.4: 项目目录结构清晰合理，PC端和手机端代码组织规范
- **Notes**: 后端技术栈需尽快确认。前端同时引入Ant Design Vue（PC端）和Vant（手机端），或考虑uni-app一套代码两端运行。

## [x] Task 2: 用户认证与RBAC权限系统
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 实现登录/注册接口（支持手机号+密码登录）
  - JWT Token鉴权，中间件拦截
  - RBAC模型实现：角色（6种：渠道专员、渠道主管、招商人员、招商主管、中台运营、系统管理员）、权限、用户-角色关联
  - 前端路由守卫，按角色控制页面访问
  - 数据权限隔离逻辑（个人/团队/区域/全国）
  - PC端和手机端共用同一套鉴权接口
- **Acceptance Criteria Addressed**: AC-6, AC-8, NFR-2
- **Test Requirements**:
  - `programmatic` TR-2.1: 登录接口返回有效JWT，过期后正确拦截
  - `programmatic` TR-2.2: 6种角色创建成功，各角色拥有对应菜单权限（PC端和手机端分别验证）
  - `programmatic` TR-2.3: 数据权限隔离逻辑正确（招商人员仅看自己，主管看团队等）
  - `human-judgement` TR-2.4: PC端和手机端登录页面各自适配良好
- **Notes**: 数据权限是BI看板权限控制的基础，需在Task 7前完成。

## [x] Task 3: 天眼查API对接服务
- **Priority**: high
- **Depends On**: Task 1
- **Description**: 
  - 封装天眼查企业信息查询API（核名、企业详情、股东结构）
  - 设计缓存层（Redis），相同企业名称7天内不重复调用
  - 设计降级策略（API不可用时的处理方式）
  - 核名校验逻辑：企业状态正常、成立时间≥2年
  - 单元测试覆盖天眼查调用层
- **Acceptance Criteria Addressed**: AC-2
- **Test Requirements**:
  - `programmatic` TR-3.1: 输入企业名称，能正确返回天眼查结构化数据（企业状态、成立时间、行业、基本信息、股东）
  - `programmatic` TR-3.2: 核名校验正确拦截成立不足2年或状态异常的企业
  - `programmatic` TR-3.3: Redis缓存命中时不调用API，直接返回缓存数据
  - `programmatic` TR-3.4: API超时（10秒）后返回友好错误提示
- **Notes**: 需先申请天眼查企业开发者账号，获取AppKey/SecretKey。

## [x] Task 4: 企业进件模块（PC端 + 手机端）
- **Priority**: high
- **Depends On**: Task 2, Task 3
- **Description**: 
  - 进件主数据表设计（企业信息、申请人、申请园区地区、入驻面积、状态）
  - 文件上传接口（支持批量、类型校验、大小限制）
  - 企业名称查询接口（检查是否已有在途跟进）
  - PC端进件表单页面（查询 → 填表 → 上传资料 → 提交）
  - 手机端进件表单页面（简化版，大按钮，友好上传）
  - 提交后自动触发天眼查核名
  - 进件详情页面（PC端和手机端）
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-11, AC-12
- **Test Requirements**:
  - `programmatic` TR-4.1: 查询已有人跟进的企业名称，系统正确提示"已有在途跟进"
  - `programmatic` TR-4.2: 提交进件后，天眼查核名自动执行，结果正确展示
  - `programmatic` TR-4.3: 文件上传支持批量，类型限制为申请的格式，超过大小限制报错
  - `human-judgement` TR-4.4: PC端进件表单交互流畅，上传有进度提示
  - `human-judgement` TR-4.5: 手机端进件表单布局合理，按钮易点击，上传体验友好
- **Notes**: 申请表、PPT、资料表、照片需要不同的文件类型校验规则。手机端表单需要大幅简化。

## [x] Task 5: 中台审核与制式报告生成模块
- **Priority**: high
- **Depends On**: Task 4
- **Description**: 
  - 审核数据表设计（审核记录、驳回原因）
  - 报告表设计（报告内容、PDF文件路径、关联企业）
  - 待审核列表页面（中台运营视角）
  - 审核详情页面（查看企业信息+天眼查数据+上传资料）
  - 审核通过/驳回接口
  - **制式报告自动生成逻辑**：
    - 文件解析：PPT取标题页和关键页文字、Excel资料表提取关键字段
    - 拼装天眼查数据 + 上传资料摘要
    - 调用PDF生成服务，5秒内输出
  - 分配招商人员功能（手动选择或按区域匹配）
  - 状态机实现：待审核→审核通过→已分配→跟进中→已落地/已流失
- **Acceptance Criteria Addressed**: AC-3, AC-4
- **Test Requirements**:
  - `programmatic` TR-5.1: 审核通过后，制式报告自动生成，生成时间 < 5秒
  - `programmatic` TR-5.2: 报告PDF包含封面、天眼查信息摘要、上传资料摘要、核名结果
  - `programmatic` TR-5.3: 审核通过后企业正确分配给指定招商人员
  - `programmatic` TR-5.4: 审核驳回需填写原因，渠道专员可看到驳回原因
  - `programmatic` TR-5.5: 状态流转正确，不允许非法状态跳转
  - `human-judgement` TR-5.6: 报告格式专业美观，信息层次清晰
  - `human-judgement` TR-5.7: 审核详情页面信息展示完整，天眼查数据与上传资料清晰分区
- **Notes**: 文件解析是报告生成的关键，需处理各种格式的PPT和资料表。

## [x] Task 6: 招商跟进与拜访记录模块（PC端 + 手机端）
- **Priority**: high
- **Depends On**: Task 5
- **Description**: 
  - 跟进记录表、拜访记录表设计
  - 招商人员工作台PC端：已分配企业列表、企业详情、制式报告在线预览、跟进时间线
  - 招商人员工作台手机端：简化列表、快速记录表单、拍照上传、制式报告PDF查看
  - 跟进记录页面：跟进方式、内容、时间
  - 拜访记录页面：拜访时间、拜访地点、拜访内容、多张照片上传、申请园区地区（精确到市）、申请入驻面积
  - 招商主管视图（PC端）：团队所有成员的跟进/拜访记录
  - 支持按区域、时间、人员筛选
- **Acceptance Criteria Addressed**: AC-5, AC-6, AC-12
- **Test Requirements**:
  - `programmatic` TR-6.1: 招商人员记录跟进/拜访后，数据保存成功并出现在时间线
  - `programmatic` TR-6.2: 招商主管能看到所有下属的跟进/拜访记录
  - `programmatic` TR-6.3: 申请园区地区选择器精确到市级别
  - `programmatic` TR-6.4: 拜访照片支持多张上传，关联到该拜访记录
  - `human-judgement` TR-6.5: 跟进时间线UI清晰（PC端）
  - `human-judgement` TR-6.6: 手机端快速记录表单简洁易用，拍照上传顺畅
  - `human-judgement` TR-6.7: 制式报告在PC端可在线预览，手机端可查看/下载
- **Notes**: 申请园区地区需要与Task 9的后台配置联动。手机端是招商人员高频使用场景，UI体验要做好。

## [x] Task 7: BI中国地图可视化看板 + 手机端数据面板
- **Priority**: high
- **Depends On**: Task 2, Task 6
- **Description**: 
  - 数据聚合接口（按省/市统计企业数、入驻面积、跟进状态分布）
  - ECharts中国地图组件（支持下钻省→市）
  - 多种图表：地图热力图、柱状图、饼图、趋势线
  - 大屏风格UI设计（深色主题、动效、科技感）
  - **手机端数据面板**：简化的数字卡片 + 小图表（不展示地图大屏）
  - 权限控制：招商人员看区域、主管看团队、中台/管理员/政府看全国
  - 定时刷新机制（可配置刷新间隔）
- **Acceptance Criteria Addressed**: AC-7, AC-8
- **Test Requirements**:
  - `programmatic` TR-7.1: 中国地图正确渲染，各省份数据准确
  - `programmatic` TR-7.2: 点击省份可下钻到市级地图
  - `programmatic` TR-7.3: 招商人员权限下仅显示所属区域数据
  - `programmatic` TR-7.4: 定时刷新数据正确更新
  - `human-judgement` TR-7.5: PC端大屏视觉高大上，符合政企大屏风格
  - `human-judgement` TR-7.6: 手机端数据面板简洁清晰，关键指标一目了然
- **Notes**: ECharts需要中国地图GeoJSON数据，可从DataV或GitHub echarts地图仓库获取。大屏是给政府和招商主管看的，要足够震撼。

## [x] Task 8: 后台管理与园区地区配置
- **Priority**: medium
- **Depends On**: Task 2
- **Description**: 
  - 园区地区数据表设计（省/市/园区三级结构）
  - 后台管理页面框架（侧边栏菜单）
  - 园区地区管理：增删改查，树形选择器
  - 用户管理：用户列表、角色分配、所属区域设置
  - 角色权限管理
  - **报告模板管理**：管理员可调整制式报告的模板内容（哪些字段显示、排序）
- **Acceptance Criteria Addressed**: AC-9
- **Test Requirements**:
  - `programmatic` TR-8.1: 管理员可添加/编辑省、市、园区
  - `programmatic` TR-8.2: 进件表单和拜访记录中的园区地区选择器正确联动后台数据
  - `programmatic` TR-8.3: 用户可分配角色和所属区域
  - `programmatic` TR-8.4: 报告模板修改后，新生成的报告按新模板输出
  - `human-judgement` TR-8.5: 后台管理页面布局清晰，操作流畅
- **Notes**: 首期可预置全国省市区基础数据。

## [x] Task 9: 合伙人/推荐人体系与排名系统
- **Priority**: medium
- **Depends On**: Task 2, Task 6
- **Description**: 
  - 推荐关系表设计（推荐人、被推荐人、企业关联）
  - 渠道专员/主管推荐的企业查询接口
  - 推荐企业申请入驻面积统计接口
  - 排名接口（按推荐企业数、按入驻面积）
  - PC端和手机端共用的推荐/排名页面
- **Acceptance Criteria Addressed**: AC-10
- **Test Requirements**:
  - `programmatic` TR-9.1: 渠道专员可看到自己推荐的所有企业
  - `programmatic` TR-9.2: 推荐企业的入驻面积统计正确
  - `programmatic` TR-9.3: 排行榜数据按规则正确排序
  - `human-judgement` TR-9.4: 排行榜页面有激励感，展示清晰
- **Notes**: 首期排名仅展示，不涉及结算打款。渠道专员和主管在推荐体系中的权益是否有差异需确认。

## [x] Task 10: 测试保障与全流程联调
- **Priority**: high
- **Depends On**: Task 1-9
- **Description**: 
  - 制定完整的测试计划和测试用例
  - **单元测试**：后端Service层覆盖率 > 80%
  - **集成测试**：API接口端到端测试
  - **端到端测试**：核心业务全流程（进件→审核→分配→报告生成→跟进→BI展示）
  - **手机端专项测试**：真机/模拟器测试所有核心操作
  - **PC端专项测试**：主流浏览器兼容性（Chrome、Edge、Safari）
  - **安全测试**：XSS、CSRF、SQL注入扫描
  - 性能优化（接口响应时间、前端加载速度、报告生成速度）
  - Bug修复闭环
- **Acceptance Criteria Addressed**: AC-13, NFR-1, NFR-2, NFR-3, NFR-5
- **Test Requirements**:
  - `programmatic` TR-10.1: 所有单元测试通过，覆盖率 > 80%
  - `programmatic` TR-10.2: 全流程端到端测试通过，无阻断性Bug
  - `programmatic` TR-10.3: 进件提交接口响应 < 2秒，BI首屏 < 3秒，报告生成 < 5秒
  - `programmatic` TR-10.4: 无高危安全漏洞
  - `human-judgement` TR-10.5: 手机端真机测试所有核心操作流畅
  - `human-judgement` TR-10.6: PC端主流浏览器兼容性良好
- **Notes**: 交付前**必须确保所有功能无已知Bug**，这是硬性要求。测试贯穿始终，非最终任务才测试。
