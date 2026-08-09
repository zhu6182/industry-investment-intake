# 产业投资进件系统 - 验证清单

## 基础架构
- [ ] Checkpoint 1: 前端Vue 3 + TypeScript + Ant Design Vue(PC) + Vant(手机)项目成功创建，PC端和手机端预览均正常
- [ ] Checkpoint 2: 后端框架成功创建并可连接MySQL和Redis
- [ ] Checkpoint 3: 对象存储服务配置正确，文件上传接口可正常使用
- [ ] Checkpoint 4: PDF生成库和文件解析库（PPT、Excel）可正常运行

## 用户认证与权限
- [ ] Checkpoint 5: 6种角色账号可正常登录（渠道专员、渠道主管、招商人员、招商主管、中台运营、系统管理员）
- [ ] Checkpoint 6: JWT Token鉴权正确，未登录/过期请求被拦截
- [ ] Checkpoint 7: 路由守卫生效，各角色只能访问对应菜单
- [ ] Checkpoint 8: 数据权限隔离正确（招商人员仅看自己、主管看团队、中台/管理员看全部）
- [ ] Checkpoint 9: PC端和手机端共用同一套鉴权接口，登录状态一致

## 天眼查对接
- [ ] Checkpoint 10: 天眼查API可正常调用并返回企业结构化数据
- [ ] Checkpoint 11: 核名校验正确拦截成立不足2年或状态异常的企业
- [ ] Checkpoint 12: Redis缓存生效，重复查询同企业不重复消耗API配额
- [ ] Checkpoint 13: API超时（10秒）后返回友好错误提示

## 企业进件（PC端 + 手机端）
- [ ] Checkpoint 14: 查询已有人跟进的企业时系统正确提示"已有在途跟进"
- [ ] Checkpoint 15: PC端进件表单填写完整并上传资料后提交成功
- [ ] Checkpoint 16: 手机端进件表单填写完整并上传资料后提交成功
- [ ] Checkpoint 17: 天眼查核名结果在进件详情中正确展示
- [ ] Checkpoint 18: 文件上传支持批量、类型校验、大小限制
- [ ] Checkpoint 19: 手机端进件表单布局合理，按钮易点击，上传体验友好

## 中台审核与制式报告
- [ ] Checkpoint 20: 中台运营能看到待审核进件列表
- [ ] Checkpoint 21: 审核详情页完整展示企业信息、天眼查数据、上传资料
- [ ] Checkpoint 22: 审核通过后，制式PDF报告自动生成，生成时间 < 5秒
- [ ] Checkpoint 23: 报告包含封面、天眼查信息摘要、上传资料摘要、核名结果
- [ ] Checkpoint 24: PPT文件解析正确提取标题页和关键页文字
- [ ] Checkpoint 25: Excel资料表解析正确提取关键字段
- [ ] Checkpoint 26: 报告格式专业美观，信息层次清晰，可下载可在线预览
- [ ] Checkpoint 27: 审核通过后可分配给指定招商人员
- [ ] Checkpoint 28: 审核驳回需填写原因，渠道专员可看到驳回原因
- [ ] Checkpoint 29: 状态流转正确（待审核→审核通过→已分配→跟进中→已落地/已流失）

## 招商跟进与拜访（PC端 + 手机端）
- [ ] Checkpoint 30: 招商人员工作台（PC端）显示已分配的企业列表
- [ ] Checkpoint 31: 招商人员工作台（手机端）显示已分配的企业列表，列表简洁
- [ ] Checkpoint 32: 跟进记录可保存并形成时间线
- [ ] Checkpoint 33: 拜访记录可填写申请园区地区（精确到市）和申请入驻面积
- [ ] Checkpoint 34: 拜访照片支持多张上传
- [ ] Checkpoint 35: 手机端支持快速记录拜访 + 拍照上传
- [ ] Checkpoint 36: 制式报告在PC端可在线预览，手机端可查看/下载PDF
- [ ] Checkpoint 37: 招商主管可查看团队所有成员的跟进/拜访记录（PC端）

## BI中国地图看板（PC端）+ 数据面板（手机端）
- [ ] Checkpoint 38: ECharts中国地图正确渲染，各省份企业数据准确
- [ ] Checkpoint 39: 点击省份可下钻到市级地图
- [ ] Checkpoint 40: 地图热力图/柱状图/饼图/趋势线等图表正确展示
- [ ] Checkpoint 41: PC端大屏视觉高大上（深色主题、科技感、动效）
- [ ] Checkpoint 42: 手机端数据面板简洁清晰，关键指标一目了然
- [ ] Checkpoint 43: 招商人员权限下仅显示所属区域数据
- [ ] Checkpoint 44: 定时刷新机制正常工作

## 后台管理
- [ ] Checkpoint 45: 管理员可添加/编辑省、市、园区三级地区数据
- [ ] Checkpoint 46: 用户可分配角色和所属区域
- [ ] Checkpoint 47: 进件/拜访表单中的园区地区选择器联动后台配置数据
- [ ] Checkpoint 48: 报告模板可配置，修改后新生成报告按新模板输出

## 合伙人/推荐人体系
- [ ] Checkpoint 49: 渠道专员可看到自己推荐的所有企业
- [ ] Checkpoint 50: 推荐企业的申请入驻面积统计正确
- [ ] Checkpoint 51: 排行榜按规则正确排序并展示
- [ ] Checkpoint 52: 手机端和PC端排行榜均正常展示

## 手机端专项验证
- [ ] Checkpoint 53: iPhone (375px) 真机测试所有核心操作流畅
- [ ] Checkpoint 54: Android (390-428px) 真机测试所有核心操作流畅
- [ ] Checkpoint 55: 底部导航栏/大按钮/简化表单均符合移动端设计规范
- [ ] Checkpoint 56: 制式报告PDF在手机端可正常打开查看

## 交付质量
- [ ] Checkpoint 57: 所有单元测试通过，后端Service层覆盖率 > 80%
- [ ] Checkpoint 58: 全流程端到端测试通过（进件→审核→分配→报告生成→跟进→BI展示）
- [ ] Checkpoint 59: 进件提交接口响应 < 2秒，BI首屏 < 3秒，报告生成 < 5秒
- [ ] Checkpoint 60: 无高危安全漏洞（XSS、CSRF、SQL注入）
- [ ] Checkpoint 61: PC端主流浏览器兼容性良好（Chrome、Edge、Safari）
- [ ] Checkpoint 62: **所有功能无已知Bug**（交付硬性要求）
- [ ] Checkpoint 63: 整体UI风格统一，PC端和手机端交互一致
