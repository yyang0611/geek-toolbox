# 五个新工具设计文档

日期：2026-05-11

## 概述

为 geek-toolbox 新增 5 个开发者工具，全部归入 `developer` 分类：

1. UUID 生成器
2. Hash 生成器
3. 密码生成器
4. 命名格式转换
5. QR 码生成

## 技术约束

- 遵循现有组件模式（`.tool-container`, `.tool-title`, `.btn-row` 等 CSS 类）
- 使用 `useClipboard` composable
- i18n 双语（zh-CN / en）
- QR 码引入 `qrcode` npm 包（~30KB gzip），其余零外部依赖
- 所有处理在浏览器本地完成

## 工具详细设计

### 1. UUID 生成器 (`UuidTool.vue`)

**ID**: `uuid`  
**Icon**: `🔑`  
**Category**: `developer`

**功能**:
- 生成 UUID v4（`crypto.randomUUID()`）
- 批量生成：1-100 个，数字输入框控制
- 大写/小写切换
- 去连字符选项（`xxxxxxxx-xxxx-...` → `xxxxxxxxxxxxxxxx...`）
- 单条复制 / 全部复制

**UI 布局**:
```
[标题]
[选项行: 数量输入 | 大写开关 | 去连字符开关]
[生成按钮] [全部复制按钮]
[UUID 列表，每条带复制按钮]
```

### 2. Hash 生成器 (`HashTool.vue`)

**ID**: `hash`  
**Icon**: `#️⃣`  
**Category**: `developer`

**功能**:
- 算法选择：SHA-1 / SHA-256 / SHA-512（Web Crypto API）
- 不含 MD5（Web Crypto 不支持，避免手写不安全算法）
- 两种输入模式：文本输入 / 文件拖入
- 文本模式：输入即实时计算
- 文件模式：拖入或选择文件，显示文件名+大小+哈希
- 输出格式：十六进制小写，可切换大写

**UI 布局**:
```
[标题]
[模式切换: 文本 | 文件]
[算法选择: SHA-1 / SHA-256 / SHA-512]
--- 文本模式 ---
[文本输入框]
--- 文件模式 ---
[拖拽区域]
[结果显示 + 复制按钮]
```

### 3. 密码生成器 (`PasswordTool.vue`)

**ID**: `password`  
**Icon**: `🔐`  
**Category**: `developer`

**功能**:
- 长度：8-128，滑块 + 数字输入联动
- 字符集复选框：大写字母 / 小写字母 / 数字 / 符号
- 排除易混淆字符选项（0, O, I, l, 1）
- 批量生成：1-20 个
- 密码强度指示条（弱/中/强/极强）
- 使用 `crypto.getRandomValues` 保证密码学安全

**UI 布局**:
```
[标题]
[长度滑块 + 数字显示]
[字符集复选框行]
[排除混淆字符开关] [数量输入]
[生成按钮]
[强度指示条]
[密码列表，每条带复制按钮]
```

**强度算法**:
- 基于字符集大小和长度计算熵值（bits）
- < 40 bits: 弱
- 40-60 bits: 中
- 60-80 bits: 强
- > 80 bits: 极强

### 4. 命名格式转换 (`CaseConvertTool.vue`)

**ID**: `caseconvert`  
**Icon**: `🔤`  
**Category**: `developer`

**功能**:
- 支持格式：camelCase / PascalCase / snake_case / kebab-case / CONSTANT_CASE
- 自动检测输入格式
- 多行输入逐行转换
- 实时转换（输入即转换）

**UI 布局**:
```
[标题]
[输入框（多行）]
[目标格式选择按钮组]
[输出框（多行，只读）+ 复制按钮]
```

**转换逻辑**:
1. 将输入拆分为单词数组（按大小写边界、下划线、连字符分割）
2. 根据目标格式重新组合

### 5. QR 码生成 (`QrcodeTool.vue`)

**ID**: `qrcode`  
**Icon**: `📱`  
**Category**: `developer`

**功能**:
- 输入文本/URL 生成 QR 码
- 可调参数：尺寸（128-512px）、纠错级别（L/M/Q/H）
- 实时预览（输入变化后自动重新生成）
- 下载 PNG 按钮

**UI 布局**:
```
[标题]
[文本输入框]
[设置行: 尺寸滑块 | 纠错级别选择]
[QR 码 Canvas 预览]
[下载 PNG 按钮]
```

**依赖**: `qrcode` (npm)，使用 `QRCode.toCanvas()` API

## 注册变更

在 `registry.ts` 的 `TOOLS` 数组中追加 5 个条目。

## i18n 变更

在 `zh-CN.json` 和 `en.json` 中分别添加：
- `tabs.*` 标签名
- `toolCards.*` 卡片描述
- 各工具自身的 namespace（`uuid.*`, `hash.*`, `password.*`, `caseconvert.*`, `qrcode.*`）

## 文件清单

新增文件：
- `src/components/tools/UuidTool.vue`
- `src/components/tools/HashTool.vue`
- `src/components/tools/PasswordTool.vue`
- `src/components/tools/CaseConvertTool.vue`
- `src/components/tools/QrcodeTool.vue`

修改文件：
- `src/registry.ts` — 追加 5 个工具条目
- `src/locales/zh-CN.json` — 添加中文翻译
- `src/locales/en.json` — 添加英文翻译
- `package.json` — 添加 `qrcode` 依赖
