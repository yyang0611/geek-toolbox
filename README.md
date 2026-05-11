# 极客工具箱 / Geek Toolbox

[English README](./README.en.md)

> 纯前端、本地优先的在线工具箱，支持中文 / English 界面切换，所有处理默认在浏览器本地完成。

## 在线访问

| 地区 | 地址 |
|------|------|
| 🌏 国内 | **[https://geek-toolbox.pages.dev/](https://geek-toolbox.pages.dev/)** (Cloudflare Pages) |
| 🌍 海外 | **[https://geek-toolbox-f4k2.vercel.app/](https://geek-toolbox-f4k2.vercel.app/)** (Vercel) |

## 特色

- **中英文切换**：首次访问自动跟随浏览器语言，也支持手动切换并记住选择。
- **本地优先**：大部分处理在浏览器内完成，默认不上传你的数据。
- **零后端依赖**：Vue 3 + TypeScript 单页应用，纯静态部署。
- **单页工具集合**：打开即用，无需登录、无需安装。

## 工具列表

| 工具 | 功能 |
| --- | --- |
| 时间戳转换 | 时间 ↔ 时间戳，支持秒 / 毫秒、日期时间选择器、快捷日期和实时当前时间 |
| 图片压缩 / 自定义裁剪 | 批量上传、逐张切换、共享或单独裁剪、JPEG/PNG 导出、批量 ZIP 下载 |
| 文件转换 | XLSX → CSV、CSV → XLSX、DOCX → TXT、PDF → 文本、PDF → 图片 |
| JSON 格式化 | JSON 格式化、压缩、校验错误提示 |
| 文本对比 | 双栏对比文本差异 |
| Base64 编解码 | Base64 编码 / 解码 |
| 字数统计 | 统计字符、中文字、英文单词、行数、空格、标点 |
| URL 编解码 | URL 编码 / 解码 |
| 颜色转换器 | HEX / RGB / HSL 互转 + 色板预览 |
| 正则测试器 | 实时正则匹配、分组捕获、替换测试 |
| JWT 解码 | 在线解析 JWT Token |
| YAML ↔ JSON | YAML 与 JSON 互转 |
| 图片标注 | 图片上添加文字/箭头/矩形标注 |
| 文本卡片 | 生成精美的分享卡片图片 |

> 更多工具持续添加中...

## 技术栈

- Vue 3 (Composition API + `<script setup>`)
- TypeScript
- Vite 6
- Vue I18n (国际化)
- 浏览器端库：XLSX、Mammoth、PDF.js

## 部署

项目使用 **Cloudflare Pages**（国内）和 **Vercel**（海外）双线部署，推送到 `main` 后两端自动更新。

### Cloudflare Pages 构建配置

| 配置 | 值 |
|------|-----|
| 构建命令 | `npm ci && npm run build` |
| 输出目录 | `dist` |
| 生产分支 | `main` |

## 打赏 / 支持

当前项目支持国内和国际两类方式：

- 国内：支付宝二维码 `donate.png`
- 国际：PayPal / Buy Me a Coffee / Ko-fi

### 修改国内收款码

直接替换项目根目录中的：

- `donate.png`

建议使用清晰的 PNG 图片，避免二维码失真。

### 配置国际打赏用户名

在旧版 `app.js` 顶部找到：

```js
const supportConfig = {
  contact: 'yyang0611',
  paypalUsername: '',
  buyMeACoffeeUsername: '',
  koFiUsername: ''
};
```

按需替换为你的用户名：

```js
const supportConfig = {
  contact: 'your-contact',
  paypalUsername: 'your-paypalme-name',
  buyMeACoffeeUsername: 'your-bmac-name',
  koFiUsername: 'your-kofi-name'
};
```

说明：

- 这里只填用户名，不要填完整 URL
- 未配置的国际渠道会在界面中显示为未配置状态
- 已配置的渠道会自动生成真实链接

当前实际配置：

```js
const supportConfig = {
  contact: 'yyang0611',
  paypalUsername: 'GeekToolbox',
  buyMeACoffeeUsername: '',
  koFiUsername: ''
};
```
