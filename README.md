# ⚡ 极客工具箱 · Geek Toolbox

> 在线开发工具合集，纯前端运行，数据不上传服务器。

## 在线访问

**[https://geek-toolbox-f4k2.vercel.app/](https://geek-toolbox-f4k2.vercel.app/)**

## 工具列表

| 工具 | 功能 |
|------|------|
| 时间戳转换 | 时间 ↔ 时间戳互转，支持秒/毫秒、日期时间选择器、靠底部自动向上弹出、移动端稳态显示 |
| 图片压缩 / 自定义裁剪 | 上传图片后自由裁剪、压缩质量调节、输出 PNG/JPEG、预览并下载结果 |
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
