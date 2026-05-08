# 极客工具箱 / Geek Toolbox

[English README](./README.en.md)

> 纯前端、本地优先的在线工具箱，支持中文 / English 界面切换，所有处理默认在浏览器本地完成。

## 在线访问

**[https://geek-toolbox-f4k2.vercel.app/](https://geek-toolbox-f4k2.vercel.app/)**

## 特色

- **中英文切换**：首次访问自动跟随浏览器语言，也支持手动切换并记住选择。
- **本地优先**：大部分处理在浏览器内完成，默认不上传你的数据。
- **零后端依赖**：HTML + CSS + JavaScript 静态站点，适合直接部署到 Vercel / Netlify。
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

## 技术栈

- HTML
- CSS
- JavaScript
- 第三方浏览器端库：XLSX、Mammoth、PDF.js

## 双语切换说明

- 首次打开：
  - 浏览器语言是 `zh-*` 时默认显示中文
  - 其他语言默认显示 English
- 手动切换：
  - 页面右上角可在 `中文 / EN` 之间切换
  - 手动选择会保存到 `localStorage`
- 覆盖范围：
  - 页面主文案
  - 运行时提示 / 报错 / 状态文案
  - README 文档

## 文件转换说明

### XLSX → CSV
- 支持选择单个工作表
- 多工作表时可导出为 ZIP
- 支持切换 CSV 分隔符（逗号 / 分号 / Tab）

### CSV → XLSX
- 可将 CSV 内容转换为 Excel 文件

### DOCX → TXT
- 提取纯文本内容，不保留原始格式

### PDF → 文本
- 按页提取文本内容
- 以纯文本形式输出，不保留原始排版

### PDF → 图片
- 支持设置渲染清晰度
- 支持输入页码范围，如 `1-3,5,8`
- 可打包下载图片 ZIP

## 打赏 / 支持

当前项目支持国内和国际两类方式：

- 国内：支付宝二维码 `donate.png`
- 国际：PayPal / Buy Me a Coffee / Ko-fi

### 修改国内收款码

直接替换项目根目录中的：

- `donate.png`

建议使用清晰的 PNG 图片，避免二维码失真。

### 配置国际打赏用户名

在 `app.js` 顶部找到：

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

## 部署

当前项目适合直接部署为静态站点：

- Vercel
- Netlify
- GitHub Pages（如不依赖某些本地资源限制）

仓库当前使用 Vercel 自动部署，推送到 `main` 后即可更新线上版本。
