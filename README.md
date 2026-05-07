# ⚡ 极客工具箱 · Geek Toolbox

> 在线开发工具合集，纯前端运行，数据不上传服务器。

## 在线访问

**[https://geek-toolbox-f4k2.vercel.app/](https://geek-toolbox-f4k2.vercel.app/)**

## 工具列表

| 工具 | 功能 |
|------|------|
| 时间戳转换 | 时间 ↔ 时间戳互转，支持秒/毫秒、日期时间选择器、靠底部自动向上弹出、移动端稳态显示 |
| 图片压缩 / 自定义裁剪 | 上传图片后自由裁剪、压缩质量调节、输出 PNG/JPEG、预览并下载结果 |
| 文件转换 | 支持 XLSX ↔ CSV、DOCX → TXT、PDF → 文本/图片，支持工作表选择、页码范围、ZIP 下载 |
| JSON 格式化 | 格式化 / 校验 / 压缩 JSON |
| 文本对比 | 双栏对比文本差异，高亮显示增删 |
| Base64 编解码 | 编码 / 解码 Base64 |
| 字数统计 | 实时统计中文字符、英文单词、行数、标点等 |
| URL 编解码 | 编码 / 解码 URL 字符串 |

## 技术栈

纯前端：HTML + CSS + JavaScript，零依赖，零后端。

## 部署

Vercel 自动部署，推送到 main 分支即自动更新。

## 支持

如果你觉得有用，欢迎打赏支持！

当前站点支持两类打赏方式：

- 国内：支付宝二维码
- 国际：PayPal / Buy Me a Coffee / Ko-fi

## 打赏方式配置

项目内置了国内与国际两套打赏入口：

- 国内：支付宝二维码 `donate.png`
- 国际：PayPal / Buy Me a Coffee / Ko-fi

### 1）替换国内二维码

直接替换根目录下的：

- `donate.png`

建议使用清晰的 PNG 图片，避免二维码被压缩失真。

### 2）配置国际打赏用户名

在 `app.js` 顶部找到：

```js
const supportConfig = {
  contact: 'yyang0611',
  paypalUsername: '',
  buyMeACoffeeUsername: '',
  koFiUsername: ''
};
```

按需填写：

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
- 未配置的渠道会在页面里自动置灰并禁用
- 已配置的渠道会自动生成真实链接并显示在按钮下方


## 文件转换功能说明

文件转换 tab 当前支持：

- XLSX → CSV
  - 可选择单个工作表
  - 多工作表可打包导出为 ZIP
  - 支持 CSV 分隔符选择（逗号 / 分号 / Tab）
- CSV → XLSX
  - 支持 CSV 分隔符选择（逗号 / 分号 / Tab）
- DOCX → TXT
- PDF → 文本
- PDF → 图片
  - 支持清晰度倍率选择
  - 支持页码范围，例如 `1-3,5,8`

限制说明：
- PDF → 文本主要是提取文字，不保留原始排版
- DOCX → TXT 只输出纯文本，不保留样式
- XLSX → CSV 导出的是文本数据，不保留公式样式与图表


### 使用示例

- **XLSX → CSV（单工作表）**
  1. 选择 `XLSX → CSV`
  2. 上传 Excel 文件
  3. 选择工作表
  4. 选择 CSV 分隔符
  5. 点击“开始转换”并下载结果

- **XLSX → CSV（全部工作表 ZIP）**
  1. 选择 `XLSX → CSV`
  2. 上传含多个工作表的 Excel 文件
  3. 将“CSV 导出模式”切换为 `全部工作表（ZIP）`
  4. 点击“开始转换”并下载 ZIP

- **CSV → XLSX**
  1. 选择 `CSV → XLSX`
  2. 根据源文件情况选择分隔符
  3. 上传 CSV 文件
  4. 点击“开始转换”并下载 XLSX

- **PDF → 图片（指定页码）**
  1. 选择 `PDF → 图片`
  2. 上传 PDF 文件
  3. 选择清晰度倍率
  4. 在页码范围中输入例如 `1-3,5,8`
  5. 点击“开始转换”并下载图片 ZIP
