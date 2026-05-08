/* === Site Config: Support / Donation === */
const supportConfig = {
  // 国内/通用联系方式
  contact: 'yyang0611',
  // 只填用户名，不要填完整 URL，例如 your-paypalme-name
  paypalUsername: 'GeekToolbox',
  // 只填用户名，不要填完整 URL，例如 your-bmac-name
  buyMeACoffeeUsername: '',
  // 只填用户名，不要填完整 URL，例如 your-kofi-name
  koFiUsername: ''
};

/* === Dynamic Script Loader (lazy-load heavy libs) === */
const _scriptCache = {};
function loadScript(url) {
  if (_scriptCache[url]) return _scriptCache[url];
  const p = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = url;
    s.onload = () => { _scriptCache[url] = true; resolve(); };
    s.onerror = () => { delete _scriptCache[url]; reject(new Error('Failed to load ' + url)); };
    document.head.appendChild(s);
  });
  _scriptCache[url] = p;
  return p;
}

const CDN = {
  XLSX: 'https://cdn.jsdelivr.net/npm/xlsx/dist/xlsx.full.min.js',
  MAMMOTH: 'https://cdn.jsdelivr.net/npm/mammoth/mammoth.browser.min.js',
  PDFJS: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js',
  PDFJS_WORKER: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js'
};



const LOCALE_STORAGE_KEY = 'geek-toolbox-language';
const SUPPORTED_LANGUAGES = ['zh-CN', 'en'];
const LANGUAGE_FALLBACKS = {
  'zh-CN': 'en',
  en: 'zh-CN'
};

const translations = {
  'zh-CN': {
    meta: {
      title: '极客工具箱 · Geek Toolbox'
    },
    common: {
      clear: '清空',
      copyResult: '复制结果',
      copyText: '复制文本',
      cancel: '取消',
      confirm: '确定',
      copied: '✅ 已复制',
      resultEmpty: '结果：--',
      notSet: '未设置'
    },
    header: {
      logo: '⚡ 极客工具箱',
      subtitle: '在线开发工具 · 浏览器本地运行，你的数据不上传',
      languageSwitcherLabel: '语言切换',
      languageZh: '中文',
      languageEn: 'EN'
    },
    tabs: {
      timestamp: '时间戳',
      image: '图片压缩',
      convert: '文件转换',
      json: 'JSON 格式化',
      diff: '文本对比',
      base64: 'Base64',
      count: '字数统计',
      url: 'URL 编解码'
    },
    json: {
      title: 'JSON 格式化 / 校验',
      placeholder: '粘贴 JSON 到这里...',
      format: '格式化',
      compress: '压缩',
      invalidError: '❌ JSON 格式错误: {message}'
    },
    diff: {
      title: '文本对比',
      leftLabel: '原文',
      leftPlaceholder: '原始文本...',
      rightLabel: '修改后',
      rightPlaceholder: '修改后的文本...',
      compare: '对比',
      emptyState: '请在两侧输入文本后对比'
    },
    base64: {
      title: 'Base64 编解码',
      placeholder: '输入要编解码的文本...',
      encode: '编码 →',
      decode: '← 解码'
    },
    count: {
      title: '字数统计与分析',
      placeholder: '输入文本，实时统计...',
      stats: {
        chars: '总字符',
        chinese: '中文字',
        english: '英文单词',
        lines: '行数',
        spaces: '空格',
        punct: '标点'
      }
    },
    url: {
      title: 'URL 编解码',
      placeholder: '输入 URL 或字符串...',
      encode: '编码 →',
      decode: '← 解码',
      decodeError: '❌ 无法解码，请检查输入'
    },
    timestamp: {
      title: '时间戳转换',
      unitLabel: '时间戳单位',
      radiogroupLabel: '时间戳单位选择',
      livePanelLabel: '当前时间实时状态',
      currentTimestampLabel: '当前时间戳',
      currentTimeLabel: '当前时间',
      liveLabel: '实时',
      copyCurrentTimestamp: '点击复制当前时间戳',
      copyCurrentTime: '点击复制当前时间',
      dateToTimestampLabel: '时间 → 时间戳',
      timestampToDateLabel: '时间戳 → 时间',
      datetimePlaceholder: '选择日期和时间',
      inputPlaceholderSeconds: '输入时间戳（秒）',
      inputPlaceholderMilliseconds: '输入时间戳（毫秒）',
      selectTime: '选择时间',
      copyResult: '点击复制结果',
      prevMonth: '上一月',
      nextMonth: '下一月',
      quick: {
        now: '此刻',
        today: '今天',
        yesterday: '昨天',
        tomorrow: '明天',
        weekStart: '本周一',
        monthStart: '本月1号'
      },
      weekdays: {
        mon: '一',
        tue: '二',
        wed: '三',
        thu: '四',
        fri: '五',
        sat: '六',
        sun: '日'
      },
      hour: '时',
      minute: '分',
      second: '秒',
      pickerEmpty: '未选择日期时间',
      currentTimestampPlaceholder: '请输入时间戳',
      invalidNumber: '❌ 无效数字',
      invalidTimestamp: '❌ 无效时间戳',
      chooseTime: '请选择时间',
      detectAutoMilliseconds: '已自动识别为毫秒（13 位）',
      detectAutoSeconds: '已自动识别为秒（10 位）',
      detectByCurrentUnit: '按当前选择的“{unit}”解析',
      units: {
        seconds: '秒',
        milliseconds: '毫秒'
      },
      monthTitle: '{year} 年 {month} 月'
    },
    image: {
      title: '图片压缩 / 自定义裁剪',
      uploadLabel: '上传图片',
      selectButton: '选择图片',
      sourceMetaIdle: '请选择图片后开始编辑',
      batchMetaIdle: '支持点击、拖拽、批量上传图片',
      queueEmpty: '暂无图片。上传后可逐张切换，并为单张图片单独调整裁剪。',
      canvasAriaLabel: '图片裁剪编辑区域',
      emptyState: '拖拽图片到这里，或点击上方按钮选择文件。上传后默认按同一裁剪规则处理全部图片。',
      help: '默认所有图片共用同一裁剪规则。你也可以切换到某张图片并勾选“当前图片单独裁剪”。',
      resetCrop: '重置当前裁剪',
      clearAll: '清空全部',
      exportSettings: '导出设置',
      formatLabel: '输出格式',
      qualityLabel: '压缩质量',
      widthLabel: '输出宽度',
      widthPlaceholder: '默认按裁剪区宽度',
      heightLabel: '输出高度',
      heightPlaceholder: '默认按裁剪区高度',
      customCropToggle: '当前图片单独裁剪',
      cropMetaEmpty: '裁剪区：--',
      cropMeta: '裁剪区：{width} × {height} · 起点 {x}, {y}',
      exportSummaryIdle: '裁剪后可压缩导出，并在下方预览结果。',
      exportSummaryBatching: '正在处理 {count} 张图片并打包 ZIP，请稍候...',
      exportSummaryGenerating: '正在生成当前图片预览，请稍候...',
      exportSummaryReady: '导出：{format} · {width} × {height} · {mode}',
      exportModeBatch: '支持批量导出',
      exportModeSingle: '单张导出',
      generateButton: '生成当前预览',
      generatingButton: '生成中...',
      downloadCurrentButton: '下载当前',
      downloadAllButton: '批量导出全部',
      downloadingAllButton: '正在打包 ZIP...',
      resultPreviewAlt: '压缩结果预览',
      resultEmpty: '生成后会在这里显示预览',
      resultMetaCurrent: '结果：{width} × {height} · {size} · {format} · 当前图片',
      sourceMeta: '当前：{name} · {width} × {height} · {size}',
      batchMetaLoaded: '已加载 {count} 张图片 · 默认共用裁剪规则，可切换到单张图片单独处理',
      queueBadgeCustom: '单独',
      queueBadgeShared: '共用',
      removeImageAria: '删除 {name}',
      removeConfirm: '确认删除这张图片吗？\n\n{name}',
      generateFailedNoBlob: '生成失败：浏览器未能产出图片数据，请重试。',
      generateSuccess: '当前图片预览已生成，可直接下载或继续批量导出。',
      generateFailedGeneric: '生成失败：处理当前图片时出现错误。',
      downloadFailedNoResult: '下载失败：当前还没有可下载的结果，请先生成预览。',
      downloadSuccess: '已导出当前图片：{name}',
      zipFailedNoEntries: '打包失败：没有可导出的图片结果。',
      zipSuccess: 'ZIP 打包完成：已导出 {count} 个文件',
      zipFailedGeneric: '打包失败：批量导出过程中出现错误。'
    },
    convert: {
      title: '文件转换',
      typeLabel: '选择转换类型',
      fileLabel: '选择文件',
      selectButton: '选择文件',
      fileMetaIdle: '请选择需要转换的文件',
      defaultHint: '所有转换都在浏览器本地完成，不会上传到服务器。',
      previewLabel: '转换结果预览',
      resultPlaceholder: '转换结果会显示在这里',
      runButton: '开始转换',
      runningButton: '转换中...',
      downloadButton: '下载结果',
      fileMetaCurrent: '当前文件：{name} · {size}',
      resultTextEmpty: '转换完成，但结果为空',
      resultMeta: '结果：{name} · {size}',
      resultMetaImages: '结果：共 {count} 页图片，可打包下载',
      resultFailure: '结果：转换失败',
      converting: '正在转换，请稍候...',
      completedZipPreview: '已生成 {count} 个工作表 CSV，并打包为 ZIP。',
      completedZipMessage: '转换完成：{count} 个工作表已导出为 CSV ZIP。',
      completedSheetMessage: '转换完成：工作表 {sheet} 已成功转换为 CSV。',
      csvToXlsxPreview: 'CSV 已转换为 XLSX，可点击下载结果。',
      csvToXlsxMessage: '转换完成：CSV 已成功转换为 XLSX。',
      docxToTxtMessage: '转换完成：DOCX 已提取为 TXT。',
      pdfImagesMessage: '转换完成：已生成 {count} 页图片预览。',
      failed: '转换失败：{message}',
      unknownError: '未知错误',
      preparingImageZip: '正在准备 {count} 张图片的 ZIP 下载...',
      downloadedImageZip: '下载完成：PDF 页面图片 ZIP 已导出。',
      downloadFailedNoResult: '下载失败：当前没有可下载的转换结果。',
      downloadedFile: '下载完成：{name}',
      imagePageLabel: '第 {page} 页',
      imageAlt: '第 {page} 页预览',
      pdfTextPageHeader: '--- 第 {page} 页 ---',
      invalidPage: '页码超出范围：{page}',
      invalidPageRange: '页码范围超出限制：{range}',
      invalidPageInput: '无法识别的页码范围：{range}',
      types: {
        xlsxToCsv: 'XLSX → CSV',
        csvToXlsx: 'CSV → XLSX',
        docxToTxt: 'DOCX → TXT',
        pdfToText: 'PDF → 文本',
        pdfToImages: 'PDF → 图片'
      },
      typeHints: {
        'xlsx-to-csv': '上传 Excel 文件，转换为 CSV 文本。',
        'csv-to-xlsx': '上传 CSV 文件，转换为 XLSX 表格。',
        'docx-to-txt': '上传 Word 文档，提取为纯文本 TXT。',
        'pdf-to-text': '上传 PDF 文件，提取文本内容。',
        'pdf-to-images': '上传 PDF 文件，将每页渲染为图片。'
      },
      dropzone: '也可以将文件拖拽到这里上传',
      sheetSelectLabel: '选择工作表',
      sheetModeLabel: 'CSV 导出模式',
      sheetMode: {
        single: '当前工作表',
        all: '全部工作表（ZIP）'
      },
      csvDelimiterLabel: 'CSV 分隔符',
      delimiters: {
        comma: '逗号 ,',
        semicolon: '分号 ;',
        tab: '制表符 Tab'
      },
      pdfScaleLabel: 'PDF 图片清晰度',
      pdfScales: {
        standard: '标准（1x）',
        clear: '清晰（1.5x）',
        hd: '高清（2x）',
        ultra: '超清（2.5x）'
      },
      pdfPagesLabel: '导出页码范围',
      pdfPagesPlaceholder: '留空=全部页，例如 1-3,5,8'
    },
    support: {
      footerNotice: '📌 所有处理在浏览器本地完成 · 数据不会上传到服务器 · 纯前端工具',
      footerPrompt: '如果你觉得有用，',
      footerLink: '请我喝杯咖啡 ☕',
      modalTitle: '❤️ 感谢支持！',
      tabsAriaLabel: '打赏方式',
      cnTab: '国内',
      intlTab: '国际',
      cnQrText: '支付宝扫码打赏',
      qrAlt: '打赏二维码',
      contactLabel: '也可以联系作者：',
      copyContact: '复制联系方式',
      copiedContact: '已复制',
      intlHint: '如果对方没有支付宝，建议使用下面的国际打赏方式：',
      intlSetupHint: '把上面三个渠道配置成你自己的用户名后，就能直接对外使用。',
      paypalConfigured: 'PayPal 支持',
      paypalPending: 'PayPal（待配置）',
      paypalMissingText: '未配置 PayPal 用户名',
      bmacPending: 'Buy Me a Coffee（待配置）',
      bmacMissingText: '未配置 Buy Me a Coffee 用户名',
      kofiPending: 'Ko-fi（待配置）',
      kofiMissingText: '未配置 Ko-fi 用户名'
    }
  },
  en: {
    meta: {
      title: 'Geek Toolbox'
    },
    common: {
      clear: 'Clear',
      copyResult: 'Copy Result',
      copyText: 'Copy Text',
      cancel: 'Cancel',
      confirm: 'Confirm',
      copied: '✅ Copied',
      resultEmpty: 'Result: --',
      notSet: 'Not set'
    },
    header: {
      logo: '⚡ Geek Toolbox',
      subtitle: 'Local-first developer tools running in your browser',
      languageSwitcherLabel: 'Language switcher',
      languageZh: '中文',
      languageEn: 'EN'
    },
    tabs: {
      timestamp: 'Timestamp',
      image: 'Image Compress',
      convert: 'File Convert',
      json: 'JSON Format',
      diff: 'Text Diff',
      base64: 'Base64',
      count: 'Text Count',
      url: 'URL Encode/Decode'
    },
    json: {
      title: 'Format / Validate JSON',
      placeholder: 'Paste JSON here...',
      format: 'Format',
      compress: 'Minify',
      invalidError: '❌ Invalid JSON: {message}'
    },
    diff: {
      title: 'Text Diff',
      leftLabel: 'Original',
      leftPlaceholder: 'Original text...',
      rightLabel: 'Updated',
      rightPlaceholder: 'Updated text...',
      compare: 'Compare',
      emptyState: 'Enter text on both sides to compare'
    },
    base64: {
      title: 'Base64 Encode / Decode',
      placeholder: 'Enter text to encode or decode...',
      encode: 'Encode →',
      decode: '← Decode'
    },
    count: {
      title: 'Text Count & Analysis',
      placeholder: 'Enter text for live stats...',
      stats: {
        chars: 'Characters',
        chinese: 'Chinese',
        english: 'English Words',
        lines: 'Lines',
        spaces: 'Spaces',
        punct: 'Punctuation'
      }
    },
    url: {
      title: 'URL Encode / Decode',
      placeholder: 'Enter a URL or string...',
      encode: 'Encode →',
      decode: '← Decode',
      decodeError: '❌ Unable to decode. Please check the input.'
    },
    timestamp: {
      title: 'Timestamp Converter',
      unitLabel: 'Timestamp Unit',
      radiogroupLabel: 'Timestamp unit selector',
      livePanelLabel: 'Live current time status',
      currentTimestampLabel: 'Current Timestamp',
      currentTimeLabel: 'Current Time',
      liveLabel: 'LIVE',
      copyCurrentTimestamp: 'Click to copy the current timestamp',
      copyCurrentTime: 'Click to copy the current time',
      dateToTimestampLabel: 'Time → Timestamp',
      timestampToDateLabel: 'Timestamp → Time',
      datetimePlaceholder: 'Select date and time',
      inputPlaceholderSeconds: 'Enter timestamp (seconds)',
      inputPlaceholderMilliseconds: 'Enter timestamp (milliseconds)',
      selectTime: 'Select time',
      copyResult: 'Click to copy the result',
      prevMonth: 'Previous month',
      nextMonth: 'Next month',
      quick: {
        now: 'Now',
        today: 'Today',
        yesterday: 'Yesterday',
        tomorrow: 'Tomorrow',
        weekStart: 'Week Start',
        monthStart: 'Month Start'
      },
      weekdays: {
        mon: 'Mon',
        tue: 'Tue',
        wed: 'Wed',
        thu: 'Thu',
        fri: 'Fri',
        sat: 'Sat',
        sun: 'Sun'
      },
      hour: 'Hour',
      minute: 'Min',
      second: 'Sec',
      pickerEmpty: 'No date/time selected',
      currentTimestampPlaceholder: 'Please enter a timestamp',
      invalidNumber: '❌ Invalid number',
      invalidTimestamp: '❌ Invalid timestamp',
      chooseTime: 'Please select a time',
      detectAutoMilliseconds: 'Auto-detected milliseconds (13 digits)',
      detectAutoSeconds: 'Auto-detected seconds (10 digits)',
      detectByCurrentUnit: 'Parsed using the current “{unit}” setting',
      units: {
        seconds: 'seconds',
        milliseconds: 'milliseconds'
      },
      monthTitle: '{year}-{month}'
    },
    image: {
      title: 'Image Compress / Custom Crop',
      uploadLabel: 'Upload Images',
      selectButton: 'Select Images',
      sourceMetaIdle: 'Select images to start editing',
      batchMetaIdle: 'Click, drag, or batch upload images',
      queueEmpty: 'No images yet. Upload images to switch between them and crop each one separately if needed.',
      canvasAriaLabel: 'Image crop editor',
      emptyState: 'Drag images here or use the upload button above. By default, one crop rule applies to all uploaded images.',
      help: 'All images share the same crop by default. You can switch to a specific image and enable a custom crop for it only.',
      resetCrop: 'Reset Current Crop',
      clearAll: 'Clear All',
      exportSettings: 'Export Settings',
      formatLabel: 'Output Format',
      qualityLabel: 'Compression Quality',
      widthLabel: 'Output Width',
      widthPlaceholder: 'Default: crop width',
      heightLabel: 'Output Height',
      heightPlaceholder: 'Default: crop height',
      customCropToggle: 'Use a custom crop for this image',
      cropMetaEmpty: 'Crop: --',
      cropMeta: 'Crop: {width} × {height} · Origin {x}, {y}',
      exportSummaryIdle: 'Crop first, then export a compressed result and preview it below.',
      exportSummaryBatching: 'Processing {count} images and building a ZIP archive...',
      exportSummaryGenerating: 'Generating the preview for the current image...',
      exportSummaryReady: 'Export: {format} · {width} × {height} · {mode}',
      exportModeBatch: 'batch export available',
      exportModeSingle: 'single image export',
      generateButton: 'Generate Preview',
      generatingButton: 'Generating...',
      downloadCurrentButton: 'Download Current',
      downloadAllButton: 'Export All',
      downloadingAllButton: 'Building ZIP...',
      resultPreviewAlt: 'Compressed result preview',
      resultEmpty: 'The preview will appear here after generation',
      resultMetaCurrent: 'Result: {width} × {height} · {size} · {format} · Current Image',
      sourceMeta: 'Current: {name} · {width} × {height} · {size}',
      batchMetaLoaded: '{count} images loaded · Shared crop by default, with optional per-image overrides',
      queueBadgeCustom: 'Custom',
      queueBadgeShared: 'Shared',
      removeImageAria: 'Remove {name}',
      removeConfirm: 'Remove this image?\n\n{name}',
      generateFailedNoBlob: 'Generation failed: the browser could not create image data. Please try again.',
      generateSuccess: 'Preview generated. You can download it now or continue with batch export.',
      generateFailedGeneric: 'Generation failed while processing the current image.',
      downloadFailedNoResult: 'Download failed: generate a preview before downloading.',
      downloadSuccess: 'Exported current image: {name}',
      zipFailedNoEntries: 'ZIP export failed: there are no generated images to export.',
      zipSuccess: 'ZIP complete: exported {count} files',
      zipFailedGeneric: 'ZIP export failed during batch processing.'
    },
    convert: {
      title: 'File Conversion',
      typeLabel: 'Conversion Type',
      fileLabel: 'Choose File',
      selectButton: 'Select File',
      fileMetaIdle: 'Select a file to convert',
      defaultHint: 'All conversions run locally in your browser. Nothing is uploaded to a server.',
      previewLabel: 'Result Preview',
      resultPlaceholder: 'The conversion result will appear here',
      runButton: 'Start Conversion',
      runningButton: 'Converting...',
      downloadButton: 'Download Result',
      fileMetaCurrent: 'Current file: {name} · {size}',
      resultTextEmpty: 'Conversion completed, but the result is empty',
      resultMeta: 'Result: {name} · {size}',
      resultMetaImages: 'Result: {count} page images ready for ZIP download',
      resultFailure: 'Result: conversion failed',
      converting: 'Converting, please wait...',
      completedZipPreview: 'Generated {count} worksheet CSV files and packed them into a ZIP archive.',
      completedZipMessage: 'Conversion complete: {count} worksheets exported as a CSV ZIP.',
      completedSheetMessage: 'Conversion complete: worksheet {sheet} was exported to CSV.',
      csvToXlsxPreview: 'CSV converted to XLSX. Click download to save the result.',
      csvToXlsxMessage: 'Conversion complete: CSV was converted to XLSX.',
      docxToTxtMessage: 'Conversion complete: DOCX content was extracted as TXT.',
      pdfImagesMessage: 'Conversion complete: generated previews for {count} pages.',
      failed: 'Conversion failed: {message}',
      unknownError: 'Unknown error',
      preparingImageZip: 'Preparing a ZIP download for {count} images...',
      downloadedImageZip: 'Download complete: PDF page image ZIP exported.',
      downloadFailedNoResult: 'Download failed: there is no conversion result to download.',
      downloadedFile: 'Download complete: {name}',
      imagePageLabel: 'Page {page}',
      imageAlt: 'Preview for page {page}',
      pdfTextPageHeader: '--- Page {page} ---',
      invalidPage: 'Page is out of range: {page}',
      invalidPageRange: 'Page range is out of bounds: {range}',
      invalidPageInput: 'Unrecognized page range: {range}',
      types: {
        xlsxToCsv: 'XLSX → CSV',
        csvToXlsx: 'CSV → XLSX',
        docxToTxt: 'DOCX → TXT',
        pdfToText: 'PDF → Text',
        pdfToImages: 'PDF → Images'
      },
      typeHints: {
        'xlsx-to-csv': 'Upload an Excel file and convert it to CSV text.',
        'csv-to-xlsx': 'Upload a CSV file and convert it to an XLSX workbook.',
        'docx-to-txt': 'Upload a Word document and extract plain text as TXT.',
        'pdf-to-text': 'Upload a PDF file and extract its text content.',
        'pdf-to-images': 'Upload a PDF file and render each page as an image.'
      },
      dropzone: 'You can also drag and drop a file here',
      sheetSelectLabel: 'Worksheet',
      sheetModeLabel: 'CSV Export Mode',
      sheetMode: {
        single: 'Current Worksheet',
        all: 'All Worksheets (ZIP)'
      },
      csvDelimiterLabel: 'CSV Delimiter',
      delimiters: {
        comma: 'Comma ,',
        semicolon: 'Semicolon ;',
        tab: 'Tab'
      },
      pdfScaleLabel: 'PDF Image Quality',
      pdfScales: {
        standard: 'Standard (1x)',
        clear: 'Clear (1.5x)',
        hd: 'HD (2x)',
        ultra: 'Ultra (2.5x)'
      },
      pdfPagesLabel: 'Page Range',
      pdfPagesPlaceholder: 'Leave empty for all pages, e.g. 1-3,5,8'
    },
    support: {
      footerNotice: '📌 Everything runs locally in your browser · Your data is not uploaded · Pure frontend utilities',
      footerPrompt: 'If you find this useful, ',
      footerLink: 'buy me a coffee ☕',
      modalTitle: '❤️ Thanks for your support!',
      tabsAriaLabel: 'Donation methods',
      cnTab: 'Domestic',
      intlTab: 'International',
      cnQrText: 'Scan the Alipay QR code to support',
      qrAlt: 'Donation QR code',
      contactLabel: 'You can also contact the author: ',
      copyContact: 'Copy Contact',
      copiedContact: 'Copied',
      intlHint: 'If Alipay is not available, consider one of these international support options:',
      intlSetupHint: 'Configure the three channels above with your own usernames to make them ready for public use.',
      paypalConfigured: 'Support via PayPal',
      paypalPending: 'PayPal (Not configured)',
      paypalMissingText: 'PayPal username not configured',
      bmacPending: 'Buy Me a Coffee (Not configured)',
      bmacMissingText: 'Buy Me a Coffee username not configured',
      kofiPending: 'Ko-fi (Not configured)',
      kofiMissingText: 'Ko-fi username not configured'
    }
  }
};

function getTranslationValue(locale, key) {
  return key.split('.').reduce((value, part) => (value && value[part] !== undefined ? value[part] : undefined), translations[locale]);
}

function normalizeLanguage(lang) {
  if (!lang) return 'zh-CN';
  const lowered = String(lang).toLowerCase();
  if (lowered.startsWith('zh')) return 'zh-CN';
  if (lowered.startsWith('en')) return 'en';
  return 'en';
}

function detectPreferredLanguage() {
  try {
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (SUPPORTED_LANGUAGES.includes(saved)) return saved;
  } catch {}

  const browserLang = typeof navigator !== 'undefined' ? navigator.language || navigator.userLanguage : '';
  return normalizeLanguage(browserLang);
}

let currentLanguage = detectPreferredLanguage();

function t(key, params = {}) {
  const template = getTranslationValue(currentLanguage, key)
    ?? getTranslationValue(LANGUAGE_FALLBACKS[currentLanguage] || 'en', key)
    ?? key;
  return String(template).replace(//g, '').replace(/\{(\w+)\}/g, (_, name) => (params[name] ?? `{${name}}`));
}

function getCurrentLanguage() {
  return currentLanguage;
}

function formatDateTimeByLanguage(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '--';
  return date.toLocaleString(currentLanguage === 'zh-CN' ? 'zh-CN' : 'en-US');
}

function applyI18n() {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = currentLanguage === 'zh-CN' ? 'zh-CN' : 'en';
  document.title = t('meta.title');

  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });

  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    el.title = t(el.dataset.i18nTitle);
  });

  document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
    el.setAttribute('aria-label', t(el.dataset.i18nAriaLabel));
  });

  document.querySelectorAll('[data-i18n-alt]').forEach(el => {
    el.setAttribute('alt', t(el.dataset.i18nAlt));
  });

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.id === `lang-${currentLanguage}`);
  });
}

function refreshLocalizedUI() {
  applyI18n();
  if (typeof updateTimestampInputPlaceholder === 'function') updateTimestampInputPlaceholder();
  if (typeof updateTimestampPickerPreview === 'function') updateTimestampPickerPreview();
  if (typeof renderTimestampPickerCalendar === 'function') renderTimestampPickerCalendar();
  if (typeof refreshNow === 'function') refreshNow();
  if (typeof renderImageQueue === 'function') renderImageQueue();
  if (typeof syncImageMeta === 'function') syncImageMeta();
  if (typeof updateImageCompressionSummary === 'function') updateImageCompressionSummary();
  if (typeof updateImageActionButtons === 'function') updateImageActionButtons();
  if (typeof restoreConvertHint === 'function') restoreConvertHint(true);
  if (typeof updateConvertButtons === 'function') updateConvertButtons();
  if (typeof applySupportLinks === 'function') applySupportLinks();
}

function setLanguage(lang) {
  const normalized = normalizeLanguage(lang);
  if (!SUPPORTED_LANGUAGES.includes(normalized)) return;
  currentLanguage = normalized;
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, normalized);
  } catch {}
  refreshLocalizedUI();
}


document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tool-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('tool-' + tab.dataset.tool).classList.add('active');
  });
});

/* === JSON 工具 === */
function formatJSON() {
  const input = document.getElementById('json-input').value;
  const errEl = document.getElementById('json-error');
  const outEl = document.getElementById('json-output');
  try {
    const parsed = JSON.parse(input);
    outEl.textContent = JSON.stringify(parsed, null, 2);
    errEl.textContent = '';
  } catch (e) {
    errEl.textContent = t('json.invalidError', { message: e.message });
    outEl.textContent = '';
  }
}
function compressJSON() {
  const input = document.getElementById('json-input').value;
  const errEl = document.getElementById('json-error');
  const outEl = document.getElementById('json-output');
  try {
    outEl.textContent = JSON.stringify(JSON.parse(input));
    errEl.textContent = '';
  } catch (e) {
    errEl.textContent = t('json.invalidError', { message: e.message });
    outEl.textContent = '';
  }
}

/* === 文本对比 (朴素 diff) === */
function runDiff() {
  const left = document.getElementById('diff-left').value;
  const right = document.getElementById('diff-right').value;
  const out = document.getElementById('diff-output');

  const lLines = left.split('\n');
  const rLines = right.split('\n');
  const maxLen = Math.max(lLines.length, rLines.length);
  let html = '';

  for (let i = 0; i < maxLen; i++) {
    const l = lLines[i] || '';
    const r = rLines[i] || '';
    if (l === r) {
      html += `<span> ${escapeHtml(l)}</span>\n`;
    } else {
      if (l) html += `<span class="diff-remove">-${escapeHtml(l)}</span>\n`;
      if (r) html += `<span class="diff-add">+${escapeHtml(r)}</span>\n`;
    }
  }

  if (!left && !right) {
    out.innerHTML = `<span style="color:var(--text-dim)">${escapeHtml(t('diff.emptyState'))}</span>`;
  } else {
    out.innerHTML = html;
  }
}

/* === Base64 === */
function base64Encode() {
  const input = document.getElementById('base64-input').value;
  document.getElementById('base64-output').textContent = btoa(unescape(encodeURIComponent(input)));
}
function base64Decode() {
  const input = document.getElementById('base64-input').value;
  try {
    document.getElementById('base64-output').textContent = decodeURIComponent(escape(atob(input)));
  } catch {
    document.getElementById('base64-output').textContent = atob(input);
  }
}

/* === URL 编解码 === */
function urlEncode() {
  document.getElementById('url-output').textContent = encodeURIComponent(document.getElementById('url-input').value);
}
function urlDecode() {
  try {
    document.getElementById('url-output').textContent = decodeURIComponent(document.getElementById('url-input').value);
  } catch {
    document.getElementById('url-output').textContent = t('url.decodeError');
  }
}

/* === 字数统计 === */
function liveCount() {
  const text = document.getElementById('count-input').value;
  document.getElementById('stat-chars').textContent = text.length;
  document.getElementById('stat-chinese').textContent = (text.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) || []).length;
  const words = text.match(/[a-zA-Z]+/g);
  document.getElementById('stat-english').textContent = words ? words.length : 0;
  document.getElementById('stat-lines').textContent = text ? text.split('\n').length : 0;
  document.getElementById('stat-spaces').textContent = (text.match(/\s/g) || []).length;
  document.getElementById('stat-punct').textContent = (text.match(/[，。、；：？！""''（）【】《》—…·\.\,\;\:\!\?\-\–\(\)\[\]\{\}]/g) || []).length;
}

/* === 时间戳 === */

/* === 图片压缩 / 裁剪 === */

const imageToolState = {
  items: [],
  activeIndex: -1,
  image: null,
  fileName: '',
  originalType: '',
  originalSize: 0,
  naturalWidth: 0,
  naturalHeight: 0,
  renderedWidth: 0,
  renderedHeight: 0,
  offsetX: 0,
  offsetY: 0,
  crop: null,
  sharedCrop: null,
  activePointerId: null,
  dragMode: null,
  dragStartX: 0,
  dragStartY: 0,
  draftCrop: null,
  resultBlob: null,
  resultDataUrl: '',
  resultWidth: 0,
  resultHeight: 0,
  isProcessing: false,
  isBatchProcessing: false,
  lastActionMessage: '',
  lastActionType: ''
};

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  return `${size >= 100 ? size.toFixed(0) : size.toFixed(1)} ${units[unitIndex]}`;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getImageDimensionLimit() {
  return 9999;
}

function normalizeDimensionValue(value, fallback) {
  const limit = getImageDimensionLimit();
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return fallback;
  return clamp(Math.round(numeric), 1, limit);
}

function getImageCanvas() {
  return document.getElementById('img-editor-canvas');
}

function getActiveImageItem() {
  if (imageToolState.activeIndex < 0 || imageToolState.activeIndex >= imageToolState.items.length) return null;
  return imageToolState.items[imageToolState.activeIndex];
}

function buildFullImageCrop(item) {
  return {
    x: 0,
    y: 0,
    width: item.naturalWidth,
    height: item.naturalHeight
  };
}

function adaptCropToItem(crop, item) {
  if (!crop || !item) return buildFullImageCrop(item);
  const widthRatio = item.naturalWidth / Math.max(1, imageToolState.naturalWidth || item.naturalWidth);
  const heightRatio = item.naturalHeight / Math.max(1, imageToolState.naturalHeight || item.naturalHeight);
  return normalizeCropForItem({
    x: crop.x * widthRatio,
    y: crop.y * heightRatio,
    width: crop.width * widthRatio,
    height: crop.height * heightRatio
  }, item);
}

function ensureImageCrop() {
  const item = getActiveImageItem();
  if (!item) {
    imageToolState.crop = null;
    return;
  }

  if (item.useCustomCrop) {
    if (!item.customCrop) {
      item.customCrop = buildFullImageCrop(item);
    }
    imageToolState.crop = { ...item.customCrop };
    return;
  }

  if (!imageToolState.sharedCrop) {
    imageToolState.sharedCrop = buildFullImageCrop(item);
  }
  imageToolState.crop = adaptCropToItem(imageToolState.sharedCrop, item);
}

function syncActiveImageFromItem() {
  const item = getActiveImageItem();
  if (!item) {
    imageToolState.image = null;
    imageToolState.fileName = '';
    imageToolState.originalType = '';
    imageToolState.originalSize = 0;
    imageToolState.naturalWidth = 0;
    imageToolState.naturalHeight = 0;
    imageToolState.crop = null;
    return;
  }

  imageToolState.image = item.image;
  imageToolState.fileName = item.fileName;
  imageToolState.originalType = item.originalType;
  imageToolState.originalSize = item.originalSize;
  imageToolState.naturalWidth = item.naturalWidth;
  imageToolState.naturalHeight = item.naturalHeight;
  ensureImageCrop();
}

function syncImageMeta() {
  const sourceMeta = document.getElementById('img-source-meta');
  const cropMeta = document.getElementById('img-crop-meta');
  const batchMeta = document.getElementById('img-batch-meta');
  const toggle = document.getElementById('img-custom-crop-toggle');
  const activeItem = getActiveImageItem();

  if (sourceMeta) {
    sourceMeta.textContent = activeItem
      ? t('image.sourceMeta', {
          name: activeItem.fileName,
          width: activeItem.naturalWidth,
          height: activeItem.naturalHeight,
          size: formatBytes(activeItem.originalSize)
        })
      : t('image.sourceMetaIdle');
  }

  if (batchMeta) {
    batchMeta.textContent = imageToolState.items.length
      ? t('image.batchMetaLoaded', { count: imageToolState.items.length })
      : t('image.batchMetaIdle');
  }

  if (cropMeta) {
    cropMeta.textContent = imageToolState.crop
      ? t('image.cropMeta', {
          width: Math.round(imageToolState.crop.width),
          height: Math.round(imageToolState.crop.height),
          x: Math.round(imageToolState.crop.x),
          y: Math.round(imageToolState.crop.y)
        })
      : t('image.cropMetaEmpty');
  }

  if (toggle) {
    toggle.checked = Boolean(activeItem && activeItem.useCustomCrop);
    toggle.disabled = !activeItem;
  }
}

function renderImageQueue() {
  const queue = document.getElementById('img-queue');
  if (!queue) return;

  if (!imageToolState.items.length) {
    queue.innerHTML = `<div class="img-queue-empty">${escapeHtml(t('image.queueEmpty'))}</div>`;
    return;
  }

  queue.innerHTML = imageToolState.items.map((item, index) => `
    <div class="img-queue-item ${index === imageToolState.activeIndex ? 'active' : ''}">
      <img class="img-queue-thumb" src="${item.previewUrl}" alt="${escapeHtml(item.fileName)}" />
      <button type="button" class="img-queue-text-btn" onclick="setActiveImageIndex(${index})">
        <span class="img-queue-text">
          <span class="img-queue-name">${escapeHtml(item.fileName)}</span>
          <span class="img-queue-sub">${item.naturalWidth} × ${item.naturalHeight} · ${formatBytes(item.originalSize)}</span>
        </span>
      </button>
      <span class="img-queue-badge">${item.useCustomCrop ? t('image.queueBadgeCustom') : t('image.queueBadgeShared')}</span>
      <button type="button" class="img-queue-remove" onclick="removeImageAtIndex(${index})" aria-label="${escapeHtml(t('image.removeImageAria', { name: item.fileName }))}">×</button>
    </div>
  `).join('');
}

function removeImageAtIndex(index) {
  if (index < 0 || index >= imageToolState.items.length) return;
  const item = imageToolState.items[index];
  const shouldDelete = typeof window === 'undefined' || typeof window.confirm !== 'function'
    ? true
    : window.confirm(t('image.removeConfirm', { name: item ? item.fileName : '' }));
  if (!shouldDelete) return;
  imageToolState.items.splice(index, 1);

  if (!imageToolState.items.length) {
    clearImageTool();
    return;
  }

  if (imageToolState.activeIndex >= imageToolState.items.length) {
    imageToolState.activeIndex = imageToolState.items.length - 1;
  } else if (index < imageToolState.activeIndex) {
    imageToolState.activeIndex -= 1;
  }

  syncActiveImageFromItem();
  renderImageQueue();
  syncImageMeta();
  updateImageCompressionSummary();
  updateImageActionButtons();
  drawImageEditor();
}

function setActiveImageIndex(index) {
  if (index < 0 || index >= imageToolState.items.length) return;
  imageToolState.activeIndex = index;
  syncActiveImageFromItem();
  const widthInput = document.getElementById('img-max-width');
  const heightInput = document.getElementById('img-max-height');
  if (widthInput) widthInput.value = String(Math.round(imageToolState.crop ? imageToolState.crop.width : imageToolState.naturalWidth));
  if (heightInput) heightInput.value = String(Math.round(imageToolState.crop ? imageToolState.crop.height : imageToolState.naturalHeight));
  clearImageResult();
  renderImageQueue();
  syncImageMeta();
  updateImageCompressionSummary();
  drawImageEditor();
}

function normalizeCropForItem(crop, item = getActiveImageItem()) {
  if (!item) return crop;
  const normalized = {
    x: crop.width >= 0 ? crop.x : crop.x + crop.width,
    y: crop.height >= 0 ? crop.y : crop.y + crop.height,
    width: Math.abs(crop.width),
    height: Math.abs(crop.height)
  };

  normalized.width = Math.max(40, normalized.width);
  normalized.height = Math.max(40, normalized.height);
  normalized.x = clamp(normalized.x, 0, item.naturalWidth - normalized.width);
  normalized.y = clamp(normalized.y, 0, item.naturalHeight - normalized.height);
  normalized.width = Math.min(normalized.width, item.naturalWidth - normalized.x);
  normalized.height = Math.min(normalized.height, item.naturalHeight - normalized.y);
  return normalized;
}

function applyCropChange(nextCrop) {
  const item = getActiveImageItem();
  if (!item) return;
  const normalized = normalizeCropForItem(nextCrop, item);
  imageToolState.crop = normalized;

  if (item.useCustomCrop) {
    item.customCrop = { ...normalized };
    return;
  }

  imageToolState.sharedCrop = {
    x: normalized.x,
    y: normalized.y,
    width: normalized.width,
    height: normalized.height
  };

  imageToolState.items.forEach(queueItem => {
    if (!queueItem.useCustomCrop) {
      queueItem.customCrop = null;
    }
  });
}

function toggleActiveImageCustomCrop(checked) {
  const item = getActiveImageItem();
  if (!item) return;
  item.useCustomCrop = checked;
  if (checked) {
    item.customCrop = imageToolState.crop ? { ...imageToolState.crop } : buildFullImageCrop(item);
  } else {
    item.customCrop = null;
  }
  ensureImageCrop();
  renderImageQueue();
  syncImageMeta();
  updateImageCompressionSummary();
  drawImageEditor();
}

function setImageActionMessage(message = '', type = '') {
  imageToolState.lastActionMessage = message;
  imageToolState.lastActionType = type;
}

function clearImageActionMessageLater(delay = 1800) {
  if (!imageToolState.lastActionMessage) return;
  const currentMessage = imageToolState.lastActionMessage;
  setTimeout(() => {
    if (imageToolState.lastActionMessage !== currentMessage) return;
    imageToolState.lastActionMessage = '';
    imageToolState.lastActionType = '';
    updateImageCompressionSummary();
  }, delay);
}

function onImageDimensionInputChange() {
  const widthInput = document.getElementById('img-max-width');
  const heightInput = document.getElementById('img-max-height');
  if (widthInput && widthInput.value) {
    widthInput.value = String(normalizeDimensionValue(widthInput.value, 1));
  }
  if (heightInput && heightInput.value) {
    heightInput.value = String(normalizeDimensionValue(heightInput.value, 1));
  }
  updateImageCompressionSummary();
}

function updateImageCompressionSummary() {
  const summary = document.getElementById('img-export-summary');
  const widthInput = document.getElementById('img-max-width');
  const heightInput = document.getElementById('img-max-height');
  if (!summary) return;
  if (!imageToolState.image || !imageToolState.crop) {
    summary.textContent = t('image.exportSummaryIdle');
    updateImageActionButtons();
    return;
  }
  const format = document.getElementById('img-format').value.toUpperCase();
  const cropWidth = Math.round(imageToolState.crop.width);
  const cropHeight = Math.round(imageToolState.crop.height);

  const exportWidth = normalizeDimensionValue(widthInput && widthInput.value ? widthInput.value : cropWidth, cropWidth);
  const exportHeight = normalizeDimensionValue(heightInput && heightInput.value ? heightInput.value : cropHeight, cropHeight);

  summary.textContent = imageToolState.isBatchProcessing
    ? t('image.exportSummaryBatching', { count: imageToolState.items.length })
    : imageToolState.isProcessing
      ? t('image.exportSummaryGenerating')
      : imageToolState.lastActionMessage
        ? imageToolState.lastActionMessage
        : t('image.exportSummaryReady', {
            format,
            width: exportWidth,
            height: exportHeight,
            mode: imageToolState.items.length > 1 ? t('image.exportModeBatch') : t('image.exportModeSingle')
          });
  updateImageActionButtons();
}

function updateImageActionButtons() {
  const generateBtn = document.getElementById('img-generate-btn');
  const downloadBtn = document.getElementById('img-download-btn');
  const downloadAllBtn = document.getElementById('img-download-all-btn');
  const hasActiveImage = Boolean(getActiveImageItem());
  const hasResult = Boolean(imageToolState.resultBlob);
  const hasItems = imageToolState.items.length > 0;

  if (generateBtn) {
    generateBtn.disabled = !hasActiveImage || imageToolState.isProcessing || imageToolState.isBatchProcessing;
    generateBtn.textContent = imageToolState.isProcessing ? t('image.generatingButton') : t('image.generateButton');
  }
  if (downloadBtn) {
    downloadBtn.disabled = !hasResult || imageToolState.isProcessing || imageToolState.isBatchProcessing;
    downloadBtn.textContent = t('image.downloadCurrentButton');
  }
  if (downloadAllBtn) {
    downloadAllBtn.disabled = !hasItems || imageToolState.isBatchProcessing || imageToolState.isProcessing;
    downloadAllBtn.textContent = imageToolState.isBatchProcessing ? t('image.downloadingAllButton') : t('image.downloadAllButton');
  }
}

function onImageQualityChange() {
  const quality = Number(document.getElementById('img-quality').value || 0.82);
  const qualityValue = document.getElementById('img-quality-value');
  if (qualityValue) {
    qualityValue.textContent = `${Math.round(quality * 100)}%`;
  }
  updateImageCompressionSummary();
}

function clearImageResult() {
  imageToolState.resultBlob = null;
  imageToolState.resultDataUrl = '';
  imageToolState.resultWidth = 0;
  imageToolState.resultHeight = 0;
  imageToolState.lastActionMessage = '';
  imageToolState.lastActionType = '';

  const preview = document.getElementById('img-result-preview');
  const empty = document.getElementById('img-result-empty');
  const meta = document.getElementById('img-result-meta');
  if (preview) {
    preview.src = '';
    preview.classList.add('hidden');
  }
  if (empty) {
    empty.classList.remove('hidden');
  }
  if (meta) {
    meta.textContent = t('common.resultEmpty');
  }
}

function clearImageTool() {
  imageToolState.items = [];
  imageToolState.activeIndex = -1;
  imageToolState.image = null;
  imageToolState.fileName = '';
  imageToolState.originalType = '';
  imageToolState.originalSize = 0;
  imageToolState.naturalWidth = 0;
  imageToolState.naturalHeight = 0;
  imageToolState.renderedWidth = 0;
  imageToolState.renderedHeight = 0;
  imageToolState.offsetX = 0;
  imageToolState.offsetY = 0;
  imageToolState.crop = null;
  imageToolState.sharedCrop = null;
  imageToolState.activePointerId = null;
  imageToolState.dragMode = null;
  imageToolState.draftCrop = null;

  const input = document.getElementById('img-input');
  const widthInput = document.getElementById('img-max-width');
  const heightInput = document.getElementById('img-max-height');
  const emptyState = document.getElementById('img-empty-state');
  const canvas = getImageCanvas();
  const toggle = document.getElementById('img-custom-crop-toggle');
  if (input) input.value = '';
  if (widthInput) widthInput.value = '';
  if (heightInput) heightInput.value = '';
  if (toggle) {
    toggle.checked = false;
    toggle.disabled = true;
  }
  if (emptyState) emptyState.classList.remove('hidden');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.classList.remove('dragging', 'resizing');
  }

  renderImageQueue();
  clearImageResult();
  syncImageMeta();
  updateImageCompressionSummary();
  updateImageActionButtons();
}

function resetImageCrop() {
  const item = getActiveImageItem();
  if (!item) return;
  if (item.useCustomCrop) {
    item.customCrop = buildFullImageCrop(item);
  } else {
    imageToolState.sharedCrop = buildFullImageCrop(item);
  }
  ensureImageCrop();
  const widthInput = document.getElementById('img-max-width');
  const heightInput = document.getElementById('img-max-height');
  if (widthInput) widthInput.value = String(Math.round(imageToolState.crop.width));
  if (heightInput) heightInput.value = String(Math.round(imageToolState.crop.height));
  drawImageEditor();
  syncImageMeta();
  updateImageCompressionSummary();
  clearImageResult();
  renderImageQueue();
}

function getRenderedCropRect() {
  if (!imageToolState.crop) return null;
  const scaleX = imageToolState.renderedWidth / imageToolState.naturalWidth;
  const scaleY = imageToolState.renderedHeight / imageToolState.naturalHeight;
  return {
    x: imageToolState.offsetX + imageToolState.crop.x * scaleX,
    y: imageToolState.offsetY + imageToolState.crop.y * scaleY,
    width: imageToolState.crop.width * scaleX,
    height: imageToolState.crop.height * scaleY
  };
}

function drawImageEditor() {
  const canvas = getImageCanvas();
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const emptyState = document.getElementById('img-empty-state');
  const wrap = document.getElementById('img-canvas-wrap');
  if (!ctx || !wrap) return;

  const wrapWidth = Math.max(320, Math.floor(wrap.clientWidth - 24));
  const wrapHeight = Math.max(260, Math.floor((window.innerHeight || 900) * 0.52));
  canvas.width = wrapWidth;
  canvas.height = wrapHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!imageToolState.image) {
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  const scale = Math.min(canvas.width / imageToolState.naturalWidth, canvas.height / imageToolState.naturalHeight);
  const renderedWidth = Math.max(1, Math.round(imageToolState.naturalWidth * scale));
  const renderedHeight = Math.max(1, Math.round(imageToolState.naturalHeight * scale));
  const offsetX = Math.round((canvas.width - renderedWidth) / 2);
  const offsetY = Math.round((canvas.height - renderedHeight) / 2);

  imageToolState.renderedWidth = renderedWidth;
  imageToolState.renderedHeight = renderedHeight;
  imageToolState.offsetX = offsetX;
  imageToolState.offsetY = offsetY;

  ctx.drawImage(imageToolState.image, offsetX, offsetY, renderedWidth, renderedHeight);

  ensureImageCrop();
  const crop = getRenderedCropRect();
  if (!crop) return;

  ctx.save();
  ctx.fillStyle = 'rgba(10,10,24,0.58)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.clearRect(crop.x, crop.y, crop.width, crop.height);
  ctx.drawImage(imageToolState.image, offsetX, offsetY, renderedWidth, renderedHeight);
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = '#00d4aa';
  ctx.lineWidth = 2;
  ctx.setLineDash([]);
  ctx.strokeRect(crop.x, crop.y, crop.width, crop.height);

  ctx.fillStyle = 'rgba(0, 212, 170, 0.18)';
  ctx.fillRect(crop.x, crop.y, crop.width, crop.height);

  ctx.setLineDash([6, 4]);
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.beginPath();
  ctx.moveTo(crop.x + crop.width / 3, crop.y);
  ctx.lineTo(crop.x + crop.width / 3, crop.y + crop.height);
  ctx.moveTo(crop.x + (crop.width * 2) / 3, crop.y);
  ctx.lineTo(crop.x + (crop.width * 2) / 3, crop.y + crop.height);
  ctx.moveTo(crop.x, crop.y + crop.height / 3);
  ctx.lineTo(crop.x + crop.width, crop.y + crop.height / 3);
  ctx.moveTo(crop.x, crop.y + (crop.height * 2) / 3);
  ctx.lineTo(crop.x + crop.width, crop.y + (crop.height * 2) / 3);
  ctx.stroke();

  ctx.setLineDash([]);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(crop.x + crop.width, crop.y + crop.height, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#6c63ff';
  ctx.stroke();
  ctx.restore();
}

function canvasPointToImagePoint(clientX, clientY) {
  const canvas = getImageCanvas();
  const rect = canvas.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;

  const relativeX = clamp((x - imageToolState.offsetX) / imageToolState.renderedWidth, 0, 1);
  const relativeY = clamp((y - imageToolState.offsetY) / imageToolState.renderedHeight, 0, 1);

  return {
    canvasX: x,
    canvasY: y,
    imageX: relativeX * imageToolState.naturalWidth,
    imageY: relativeY * imageToolState.naturalHeight
  };
}

function hitTestImageCrop(clientX, clientY) {
  const crop = getRenderedCropRect();
  if (!crop) return 'outside';
  const point = canvasPointToImagePoint(clientX, clientY);
  const resizeHandleSize = 16;
  const onResizeHandle =
    point.canvasX >= crop.x + crop.width - resizeHandleSize &&
    point.canvasX <= crop.x + crop.width + resizeHandleSize &&
    point.canvasY >= crop.y + crop.height - resizeHandleSize &&
    point.canvasY <= crop.y + crop.height + resizeHandleSize;

  if (onResizeHandle) return 'resize';
  const inside =
    point.canvasX >= crop.x &&
    point.canvasX <= crop.x + crop.width &&
    point.canvasY >= crop.y &&
    point.canvasY <= crop.y + crop.height;

  return inside ? 'move' : 'new';
}

function normalizeCrop(crop) {
  return normalizeCropForItem(crop, getActiveImageItem());
}

function onImageCanvasPointerDown(event) {
  if (!imageToolState.image) return;
  const canvas = getImageCanvas();
  if (!canvas) return;
  if (typeof event.preventDefault === 'function') event.preventDefault();

  const mode = hitTestImageCrop(event.clientX, event.clientY);
  const point = canvasPointToImagePoint(event.clientX, event.clientY);
  imageToolState.activePointerId = event.pointerId;
  imageToolState.dragStartX = point.imageX;
  imageToolState.dragStartY = point.imageY;
  imageToolState.draftCrop = imageToolState.crop ? { ...imageToolState.crop } : null;
  imageToolState.dragMode = mode;

  canvas.setPointerCapture(event.pointerId);
  canvas.classList.toggle('resizing', mode === 'resize');
  canvas.classList.toggle('dragging', mode === 'move');

  if (mode === 'new') {
    applyCropChange({
      x: point.imageX,
      y: point.imageY,
      width: 1,
      height: 1
    });
    drawImageEditor();
  }
}

function onImageCanvasPointerMove(event) {
  const canvas = getImageCanvas();
  if (!canvas || imageToolState.activePointerId !== event.pointerId || !imageToolState.dragMode) return;
  if (typeof event.preventDefault === 'function') event.preventDefault();
  const point = canvasPointToImagePoint(event.clientX, event.clientY);

  if (imageToolState.dragMode === 'move' && imageToolState.draftCrop) {
    const item = getActiveImageItem();
    if (!item) return;
    const deltaX = point.imageX - imageToolState.dragStartX;
    const deltaY = point.imageY - imageToolState.dragStartY;
    applyCropChange({
      ...imageToolState.draftCrop,
      x: clamp(imageToolState.draftCrop.x + deltaX, 0, item.naturalWidth - imageToolState.draftCrop.width),
      y: clamp(imageToolState.draftCrop.y + deltaY, 0, item.naturalHeight - imageToolState.draftCrop.height)
    });
  } else if (imageToolState.dragMode === 'resize' && imageToolState.draftCrop) {
    applyCropChange({
      x: imageToolState.draftCrop.x,
      y: imageToolState.draftCrop.y,
      width: point.imageX - imageToolState.draftCrop.x,
      height: point.imageY - imageToolState.draftCrop.y
    });
  } else if (imageToolState.dragMode === 'new' && imageToolState.crop) {
    applyCropChange({
      x: imageToolState.dragStartX,
      y: imageToolState.dragStartY,
      width: point.imageX - imageToolState.dragStartX,
      height: point.imageY - imageToolState.dragStartY
    });
  }

  renderImageQueue();
  drawImageEditor();
  syncImageMeta();
  updateImageCompressionSummary();
}

function onImageCanvasPointerUp(event) {
  const canvas = getImageCanvas();
  if (!canvas || imageToolState.activePointerId !== event.pointerId) return;
  if (typeof event.preventDefault === 'function') event.preventDefault();
  canvas.releasePointerCapture(event.pointerId);
  canvas.classList.remove('dragging', 'resizing');
  imageToolState.activePointerId = null;
  imageToolState.dragMode = null;
  imageToolState.draftCrop = null;
  syncImageMeta();
  updateImageCompressionSummary();
}

function getExportSettings(crop = imageToolState.crop) {
  const widthInput = document.getElementById('img-max-width');
  const heightInput = document.getElementById('img-max-height');
  return {
    exportWidth: normalizeDimensionValue(widthInput && widthInput.value ? widthInput.value : Math.round(crop.width), Math.round(crop.width)),
    exportHeight: normalizeDimensionValue(heightInput && heightInput.value ? heightInput.value : Math.round(crop.height), Math.round(crop.height))
  };
}

function createCompressedBlobForItem(item) {
  return new Promise(resolve => {
    const crop = item.useCustomCrop && item.customCrop ? item.customCrop : adaptCropToItem(imageToolState.sharedCrop || buildFullImageCrop(item), item);
    const { exportWidth, exportHeight } = getExportSettings(crop);
    const format = document.getElementById('img-format').value;
    const quality = Number(document.getElementById('img-quality').value || 0.82);
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = exportWidth;
    outputCanvas.height = exportHeight;
    const ctx = outputCanvas.getContext('2d');

    if (format === 'jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, exportWidth, exportHeight);
    }

    ctx.drawImage(item.image, crop.x, crop.y, crop.width, crop.height, 0, 0, exportWidth, exportHeight);
    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
    outputCanvas.toBlob(blob => resolve({ blob, exportWidth, exportHeight, format, crop }), mimeType, format === 'png' ? undefined : quality);
  });
}

function generateCompressedImage() {
  const item = getActiveImageItem();
  if (!item || !imageToolState.crop) return;

  imageToolState.isProcessing = true;
  updateImageCompressionSummary();
  updateImageActionButtons();

  createCompressedBlobForItem(item).then(({ blob, exportWidth, exportHeight, format }) => {
    if (!blob) {
      imageToolState.isProcessing = false;
      setImageActionMessage(t('image.generateFailedNoBlob'), 'error');
      updateImageCompressionSummary();
      updateImageActionButtons();
      clearImageActionMessageLater(2400);
      return;
    }
    imageToolState.resultBlob = blob;
    imageToolState.resultWidth = exportWidth;
    imageToolState.resultHeight = exportHeight;

    const reader = new FileReader();
    reader.onload = () => {
      const preview = document.getElementById('img-result-preview');
      const empty = document.getElementById('img-result-empty');
      const meta = document.getElementById('img-result-meta');

      imageToolState.resultDataUrl = String(reader.result || '');
      if (preview) {
        preview.src = imageToolState.resultDataUrl;
        preview.classList.remove('hidden');
      }
      if (empty) {
        empty.classList.add('hidden');
      }
      if (meta) {
        meta.textContent = t('image.resultMetaCurrent', {
          width: exportWidth,
          height: exportHeight,
          size: formatBytes(blob.size),
          format: format.toUpperCase()
        });
      }
      imageToolState.isProcessing = false;
      setImageActionMessage(t('image.generateSuccess'), 'success');
      updateImageCompressionSummary();
      updateImageActionButtons();
      clearImageActionMessageLater();
    };
    reader.readAsDataURL(blob);
  }).catch(() => {
    imageToolState.isProcessing = false;
    setImageActionMessage(t('image.generateFailedGeneric'), 'error');
    updateImageCompressionSummary();
    updateImageActionButtons();
    clearImageActionMessageLater(2400);
  });
}

function downloadCompressedImage() {
  const item = getActiveImageItem();
  if (!item || !imageToolState.resultBlob) {
    setImageActionMessage(t('image.downloadFailedNoResult'), 'error');
    updateImageCompressionSummary();
    clearImageActionMessageLater(2200);
    return;
  }
  const ext = document.getElementById('img-format').value === 'png' ? 'png' : 'jpg';
  const baseName = item.fileName ? item.fileName.replace(/\.[^.]+$/, '') : 'compressed-image';
  const fileName = `${baseName}-cropped.${ext}`;
  const url = URL.createObjectURL(imageToolState.resultBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  setImageActionMessage(t('image.downloadSuccess', { name: fileName }), 'success');
  updateImageCompressionSummary();
  clearImageActionMessageLater();
}


const zipCrcTable = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(bytes) {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = zipCrcTable[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function writeUint16(view, offset, value) {
  view.setUint16(offset, value, true);
}

function writeUint32(view, offset, value) {
  view.setUint32(offset, value, true);
}

function createZipBlob(entries) {
  const encoder = new TextEncoder();
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  entries.forEach(entry => {
    const nameBytes = encoder.encode(entry.name);
    const dataBytes = entry.bytes;
    const crc = crc32(dataBytes);

    const localHeader = new Uint8Array(30 + nameBytes.length);
    const localView = new DataView(localHeader.buffer);
    writeUint32(localView, 0, 0x04034b50);
    writeUint16(localView, 4, 20);
    writeUint16(localView, 6, 0);
    writeUint16(localView, 8, 0);
    writeUint16(localView, 10, 0);
    writeUint16(localView, 12, 0);
    writeUint32(localView, 14, crc);
    writeUint32(localView, 18, dataBytes.length);
    writeUint32(localView, 22, dataBytes.length);
    writeUint16(localView, 26, nameBytes.length);
    writeUint16(localView, 28, 0);
    localHeader.set(nameBytes, 30);

    localParts.push(localHeader, dataBytes);

    const centralHeader = new Uint8Array(46 + nameBytes.length);
    const centralView = new DataView(centralHeader.buffer);
    writeUint32(centralView, 0, 0x02014b50);
    writeUint16(centralView, 4, 20);
    writeUint16(centralView, 6, 20);
    writeUint16(centralView, 8, 0);
    writeUint16(centralView, 10, 0);
    writeUint16(centralView, 12, 0);
    writeUint16(centralView, 14, 0);
    writeUint32(centralView, 16, crc);
    writeUint32(centralView, 20, dataBytes.length);
    writeUint32(centralView, 24, dataBytes.length);
    writeUint16(centralView, 28, nameBytes.length);
    writeUint16(centralView, 30, 0);
    writeUint16(centralView, 32, 0);
    writeUint16(centralView, 34, 0);
    writeUint16(centralView, 36, 0);
    writeUint32(centralView, 38, 0);
    writeUint32(centralView, 42, offset);
    centralHeader.set(nameBytes, 46);

    centralParts.push(centralHeader);
    offset += localHeader.length + dataBytes.length;
  });

  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const endRecord = new Uint8Array(22);
  const endView = new DataView(endRecord.buffer);
  writeUint32(endView, 0, 0x06054b50);
  writeUint16(endView, 4, 0);
  writeUint16(endView, 6, 0);
  writeUint16(endView, 8, entries.length);
  writeUint16(endView, 10, entries.length);
  writeUint32(endView, 12, centralSize);
  writeUint32(endView, 16, offset);
  writeUint16(endView, 20, 0);

  return new Blob([...localParts, ...centralParts, endRecord], { type: 'application/zip' });
}

function downloadAllCompressedImages() {
  if (!imageToolState.items.length) return;
  imageToolState.isBatchProcessing = true;
  updateImageCompressionSummary();
  updateImageActionButtons();
  Promise.all(imageToolState.items.map((item, index) => createCompressedBlobForItem(item).then(({ blob, format }) => {
    if (!blob) return null;
    const ext = format === 'png' ? 'png' : 'jpg';
    const baseName = item.fileName ? item.fileName.replace(/\.[^.]+$/, '') : `compressed-image-${index + 1}`;
    return blob.arrayBuffer().then(buffer => ({
      name: `${baseName}-cropped.${ext}`,
      bytes: new Uint8Array(buffer)
    }));
  }))).then(results => {
    const entries = results.filter(Boolean);
    if (!entries.length) {
      imageToolState.isBatchProcessing = false;
      setImageActionMessage(t('image.zipFailedNoEntries'), 'error');
      updateImageCompressionSummary();
      updateImageActionButtons();
      clearImageActionMessageLater(2400);
      return;
    }
    const zipBlob = createZipBlob(entries);
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'geek-toolbox-images.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    imageToolState.isBatchProcessing = false;
    setImageActionMessage(t('image.zipSuccess', { count: entries.length }), 'success');
    updateImageCompressionSummary();
    updateImageActionButtons();
    clearImageActionMessageLater();
  }).catch(() => {
    imageToolState.isBatchProcessing = false;
    setImageActionMessage(t('image.zipFailedGeneric'), 'error');
    updateImageCompressionSummary();
    updateImageActionButtons();
    clearImageActionMessageLater(2400);
  });
}

function loadFilesIntoImageTool(files) {
  const imageFiles = Array.from(files || []).filter(file => file.type.startsWith('image/'));
  if (!imageFiles.length) return;

  const loaders = imageFiles.map(file => new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        resolve({
          image,
          fileName: file.name,
          originalType: file.type,
          originalSize: file.size,
          naturalWidth: image.naturalWidth || image.width,
          naturalHeight: image.naturalHeight || image.height,
          previewUrl: String(reader.result || ''),
          useCustomCrop: false,
          customCrop: null
        });
      };
      image.src = String(reader.result || '');
    };
    reader.readAsDataURL(file);
  }));

  Promise.all(loaders).then(items => {
    const hadItems = imageToolState.items.length > 0;
    imageToolState.items = imageToolState.items.concat(items);
    if (!hadItems) {
      imageToolState.sharedCrop = null;
      imageToolState.activeIndex = 0;
    }
    if (imageToolState.activeIndex < 0) {
      imageToolState.activeIndex = 0;
    }
    syncActiveImageFromItem();
    const widthInput = document.getElementById('img-max-width');
    const heightInput = document.getElementById('img-max-height');
    if (widthInput && !widthInput.value) widthInput.value = String(Math.round(imageToolState.crop.width));
    if (heightInput && !heightInput.value) heightInput.value = String(Math.round(imageToolState.crop.height));
    clearImageResult();
    renderImageQueue();
    syncImageMeta();
    updateImageCompressionSummary();
    drawImageEditor();
  });
}

function onImageInputChange(event) {
  const files = event.target.files;
  if (!files || !files.length) {
    return;
  }
  loadFilesIntoImageTool(files);
}

function triggerImageInput() {
  const input = document.getElementById('img-input');
  if (input) input.click();
}

function onImageDrop(event) {
  event.preventDefault();
  const wrap = document.getElementById('img-canvas-wrap');
  if (wrap) wrap.classList.remove('drag-over');
  if (event.dataTransfer && event.dataTransfer.files) {
    loadFilesIntoImageTool(event.dataTransfer.files);
  }
}

function onImageDragOver(event) {
  event.preventDefault();
  const wrap = document.getElementById('img-canvas-wrap');
  if (wrap) wrap.classList.add('drag-over');
}

function onImageDragLeave() {
  const wrap = document.getElementById('img-canvas-wrap');
  if (wrap) wrap.classList.remove('drag-over');
}


const fileConvertState = {
  file: null,
  type: 'xlsx-to-csv',
  workbookSheetNames: [],
  resultBlob: null,
  resultName: '',
  resultText: '',
  resultImages: [],
  resultPreviewKey: '',
  resultPreviewParams: null,
  isProcessing: false,
  lastMessage: ''
};

function updateConvertAdvancedOptions() {
  const advanced = document.getElementById('convert-advanced-options');
  const sheetWrap = document.getElementById('convert-sheet-wrap');
  const sheetModeWrap = document.getElementById('convert-sheet-mode-wrap');
  const csvDelimiterWrap = document.getElementById('convert-csv-delimiter-wrap');
  const pdfScaleWrap = document.getElementById('convert-pdf-scale-wrap');
  const pdfPagesWrap = document.getElementById('convert-pdf-pages-wrap');
  const type = fileConvertState.type;
  const showSheet = type === 'xlsx-to-csv' && fileConvertState.workbookSheetNames.length > 0;
  const showSheetMode = type === 'xlsx-to-csv' && fileConvertState.workbookSheetNames.length > 1;
  const showCsvDelimiter = type === 'xlsx-to-csv' || type === 'csv-to-xlsx';
  const showPdfScale = type === 'pdf-to-images';
  const showPdfPages = type === 'pdf-to-images';

  if (advanced) advanced.classList.toggle('hidden', !showSheet && !showSheetMode && !showCsvDelimiter && !showPdfScale && !showPdfPages);
  if (sheetWrap) sheetWrap.classList.toggle('hidden', !showSheet);
  if (sheetModeWrap) sheetModeWrap.classList.toggle('hidden', !showSheetMode);
  if (csvDelimiterWrap) csvDelimiterWrap.classList.toggle('hidden', !showCsvDelimiter);
  if (pdfScaleWrap) pdfScaleWrap.classList.toggle('hidden', !showPdfScale);
  if (pdfPagesWrap) pdfPagesWrap.classList.toggle('hidden', !showPdfPages);
}

function populateWorkbookSheetOptions(sheetNames = []) {
  fileConvertState.workbookSheetNames = sheetNames;
  const select = document.getElementById('convert-sheet-select');
  if (!select) return;
  select.innerHTML = sheetNames.map(name => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`).join('');
  updateConvertAdvancedOptions();
}

function updateConvertButtons() {
  const runBtn = document.getElementById('convert-run-btn');
  const downloadBtn = document.getElementById('convert-download-btn');
  if (runBtn) {
    runBtn.disabled = !fileConvertState.file || fileConvertState.isProcessing;
    runBtn.textContent = fileConvertState.isProcessing ? t('convert.runningButton') : t('convert.runButton');
  }
  if (downloadBtn) {
    const hasResult = Boolean(fileConvertState.resultBlob || fileConvertState.resultImages.length);
    downloadBtn.disabled = !hasResult || fileConvertState.isProcessing;
  }
}

function setConvertMessage(message) {
  fileConvertState.lastMessage = message;
  const hint = document.getElementById('convert-hint');
  if (hint) hint.textContent = message;
}

function getConvertTypeConfig(type = fileConvertState.type) {
  return {
    'xlsx-to-csv': { accept: '.xlsx,.xls' },
    'csv-to-xlsx': { accept: '.csv' },
    'docx-to-txt': { accept: '.docx' },
    'pdf-to-text': { accept: '.pdf' },
    'pdf-to-images': { accept: '.pdf' }
  }[type];
}

function getConvertDefaultHint(type = fileConvertState.type) {
  return `${t(`convert.typeHints.${type}`)} ${t('convert.defaultHint')}`;
}

function restoreConvertHint(force = false) {
  const hint = document.getElementById('convert-hint');
  if (!hint) return;
  hint.textContent = !force && fileConvertState.lastMessage ? fileConvertState.lastMessage : getConvertDefaultHint();
}

function onConvertTypeChange() {
  const select = document.getElementById('convert-type');
  const input = document.getElementById('convert-input');
  if (!select) return;

  const type = select.value;
  fileConvertState.type = type;
  const config = getConvertTypeConfig(type);

  if (input && config) input.accept = config.accept;
  fileConvertState.lastMessage = '';
  if (type !== 'xlsx-to-csv') {
    populateWorkbookSheetOptions([]);
  } else {
    updateConvertAdvancedOptions();
  }
  clearFileConversionResult();
  restoreConvertHint(true);
  updateConvertButtons();
}

function clearFileConversionResult() {
  fileConvertState.resultBlob = null;
  fileConvertState.resultName = '';
  fileConvertState.resultText = '';
  fileConvertState.resultImages = [];
  fileConvertState.resultPreviewKey = '';
  fileConvertState.resultPreviewParams = null;

  const preview = document.getElementById('convert-result-preview');
  const meta = document.getElementById('convert-result-meta');
  if (preview) preview.innerHTML = escapeHtml(t('convert.resultPlaceholder'));
  if (meta) meta.textContent = t('common.resultEmpty');
}

function clearFileConversion() {
  fileConvertState.file = null;
  fileConvertState.isProcessing = false;
  fileConvertState.lastMessage = '';
  populateWorkbookSheetOptions([]);
  const input = document.getElementById('convert-input');
  const meta = document.getElementById('convert-file-meta');
  if (input) input.value = '';
  if (meta) meta.textContent = t('convert.fileMetaIdle');
  clearFileConversionResult();
  restoreConvertHint(true);
  updateConvertButtons();
}

async function onConvertFileChange(event) {
  const file = event.target.files && event.target.files[0];
  fileConvertState.file = file || null;
  const meta = document.getElementById('convert-file-meta');
  restoreConvertHint(true);
  if (meta) {
    meta.textContent = file
      ? t('convert.fileMetaCurrent', { name: file.name, size: formatBytes(file.size) })
      : t('convert.fileMetaIdle');
  }
  clearFileConversionResult();

  if (file && fileConvertState.type === 'xlsx-to-csv') {
    try {
      await loadScript(CDN.XLSX);
      const workbook = XLSX.read(await readFileAsArrayBuffer(file), { type: 'array', bookSheets: true });
      populateWorkbookSheetOptions(workbook.SheetNames || []);
    } catch {
      populateWorkbookSheetOptions([]);
    }
  } else {
    populateWorkbookSheetOptions([]);
  }

  updateConvertButtons();
}

function triggerConvertInput() {
  const input = document.getElementById('convert-input');
  if (input) input.click();
}

function setConvertResultText(name, text) {
  fileConvertState.resultText = text;
  fileConvertState.resultName = name;
  fileConvertState.resultBlob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  fileConvertState.resultPreviewKey = '';
  fileConvertState.resultPreviewParams = null;
  const preview = document.getElementById('convert-result-preview');
  const meta = document.getElementById('convert-result-meta');
  if (preview) preview.textContent = text || t('convert.resultTextEmpty');
  fileConvertState.resultPreviewKey = '';
  fileConvertState.resultPreviewParams = null;
  if (meta) meta.textContent = t('convert.resultMeta', { name, size: formatBytes(fileConvertState.resultBlob.size) });
}

function setConvertResultBlob(name, blob, previewText) {
  fileConvertState.resultBlob = blob;
  fileConvertState.resultName = name;
  const preview = document.getElementById('convert-result-preview');
  const meta = document.getElementById('convert-result-meta');
  if (preview) preview.textContent = previewText;
  if (meta) meta.textContent = t('convert.resultMeta', { name, size: formatBytes(blob.size) });
}

function setConvertResultImages(images) {
  fileConvertState.resultImages = images;
  fileConvertState.resultName = 'pdf-pages.zip';
  fileConvertState.resultPreviewKey = '';
  fileConvertState.resultPreviewParams = null;
  const preview = document.getElementById('convert-result-preview');
  const meta = document.getElementById('convert-result-meta');
  if (preview) {
    preview.innerHTML = `<div class="convert-image-grid">${images.map((item, index) => `<div class="convert-image-card"><img src="${item.url}" alt="${escapeHtml(t('convert.imageAlt', { page: index + 1 }))}" /><span>${escapeHtml(t('convert.imagePageLabel', { page: index + 1 }))}</span></div>`).join('')}</div>`;
  }
  if (meta) {
    meta.textContent = t('convert.resultMetaImages', { count: images.length });
  }
}

function readFileAsArrayBuffer(file) {
  return file.arrayBuffer();
}

function getCsvDelimiter() {
  const select = document.getElementById('convert-csv-delimiter');
  if (!select) return ',';
  return select.value === 'tab' ? '	' : select.value;
}

function parseDelimitedText(text, delimiter) {
  return text.split(/\r?\n/).filter(line => line.length > 0).map(line => line.split(delimiter));
}

function parsePdfPageSelection(input, totalPages) {
  if (!input || !input.trim()) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set();
  const parts = input.split(',').map(part => part.trim()).filter(Boolean);

  for (const part of parts) {
    if (/^\d+$/.test(part)) {
      const page = Number(part);
      if (page < 1 || page > totalPages) {
        throw new Error(t('convert.invalidPage', { page }));
      }
      pages.add(page);
      continue;
    }

    const rangeMatch = part.match(/^(\d+)\s*-\s*(\d+)$/);
    if (rangeMatch) {
      let start = Number(rangeMatch[1]);
      let end = Number(rangeMatch[2]);
      if (start > end) {
        [start, end] = [end, start];
      }
      if (start < 1 || end > totalPages) {
        throw new Error(t('convert.invalidPageRange', { range: part }));
      }
      for (let page = start; page <= end; page += 1) {
        pages.add(page);
      }
      continue;
    }

    throw new Error(t('convert.invalidPageInput', { range: part }));
  }

  return Array.from(pages).sort((a, b) => a - b);
}

async function runFileConversion() {
  if (!fileConvertState.file || fileConvertState.isProcessing) return;
  fileConvertState.isProcessing = true;
  fileConvertState.lastMessage = '';
  clearFileConversionResult();
  const preview = document.getElementById('convert-result-preview');
  if (preview) preview.textContent = t('convert.converting');
  setConvertMessage(t('convert.converting'));
  updateConvertButtons();

  try {
    const file = fileConvertState.file;
    const type = fileConvertState.type;

    if (type === 'xlsx-to-csv') {
      await loadScript(CDN.XLSX);
      const workbook = XLSX.read(await readFileAsArrayBuffer(file), { type: 'array' });
      const sheetMode = document.getElementById('convert-sheet-mode');
      const mode = sheetMode ? sheetMode.value : 'single';
      if (mode === 'all' && workbook.SheetNames.length > 1) {
        const delimiter = getCsvDelimiter();
        const entries = workbook.SheetNames.map(sheetName => ({
          name: `${file.name.replace(/\.[^.]+$/, '')}-${sheetName}.csv`,
          bytes: new TextEncoder().encode(XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName], { FS: delimiter }))
        }));
        const zipBlob = createZipBlob(entries);
        fileConvertState.resultBlob = zipBlob;
        fileConvertState.resultName = `${file.name.replace(/\.[^.]+$/, '')}-worksheets.zip`;
        fileConvertState.resultPreviewKey = 'convert.completedZipPreview';
        fileConvertState.resultPreviewParams = { count: entries.length };
        const preview = document.getElementById('convert-result-preview');
        const meta = document.getElementById('convert-result-meta');
        if (preview) preview.textContent = t('convert.completedZipPreview', { count: entries.length });
        if (meta) meta.textContent = t('convert.resultMeta', { name: fileConvertState.resultName, size: formatBytes(zipBlob.size) });
        setConvertMessage(t('convert.completedZipMessage', { count: entries.length }));
      } else {
        const sheetSelect = document.getElementById('convert-sheet-select');
        const selectedSheet = sheetSelect && sheetSelect.value ? sheetSelect.value : workbook.SheetNames[0];
        const csv = XLSX.utils.sheet_to_csv(workbook.Sheets[selectedSheet], { FS: getCsvDelimiter() });
        setConvertResultText(`${file.name.replace(/\.[^.]+$/, '')}-${selectedSheet}.csv`, csv);
        setConvertMessage(t('convert.completedSheetMessage', { sheet: selectedSheet }));
      }
    } else if (type === 'csv-to-xlsx') {
      await loadScript(CDN.XLSX);
      const csvText = await file.text();
      const worksheet = XLSX.utils.aoa_to_sheet(csvText.split(/\r?\n/).map(line => line.split(getCsvDelimiter())));
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      const arrayBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([arrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fileConvertState.resultPreviewKey = 'convert.csvToXlsxPreview';
      fileConvertState.resultPreviewParams = null;
      setConvertResultBlob(file.name.replace(/\.[^.]+$/, '') + '.xlsx', blob, t('convert.csvToXlsxPreview'));
      setConvertMessage(t('convert.csvToXlsxMessage'));
    } else if (type === 'docx-to-txt') {
      await loadScript(CDN.MAMMOTH);
      const result = await mammoth.extractRawText({ arrayBuffer: await readFileAsArrayBuffer(file) });
      setConvertResultText(file.name.replace(/\.[^.]+$/, '') + '.txt', result.value.trim());
      setConvertMessage(t('convert.docxToTxtMessage'));
    } else if (type === 'pdf-to-text') {
      await loadScript(CDN.PDFJS);
      if (typeof pdfjsLib !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = CDN.PDFJS_WORKER;
      }
      const pdf = await pdfjsLib.getDocument({ data: await readFileAsArrayBuffer(file) }).promise;
      const texts = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        texts.push(`${t('convert.pdfTextPageHeader', { page: i })}\n` + content.items.map(item => item.str).join(' '));
      }
      setConvertResultText(file.name.replace(/\.[^.]+$/, '') + '.txt', texts.join('\n\n'));
    } else if (type === 'pdf-to-images') {
      await loadScript(CDN.PDFJS);
      if (typeof pdfjsLib !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = CDN.PDFJS_WORKER;
      }
      const pdf = await pdfjsLib.getDocument({ data: await readFileAsArrayBuffer(file) }).promise;
      const pageInput = document.getElementById('convert-pdf-pages');
      const selectedPages = parsePdfPageSelection(pageInput ? pageInput.value : '', pdf.numPages);
      const images = [];
      for (const pageNumber of selectedPages) {
        const page = await pdf.getPage(pageNumber);
        const scaleSelect = document.getElementById('convert-pdf-scale');
        const scale = scaleSelect ? Number(scaleSelect.value || 1.5) : 1.5;
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: ctx, viewport }).promise;
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        const url = URL.createObjectURL(blob);
        images.push({ blob, url, name: `page-${pageNumber}.png` });
      }
      setConvertResultImages(images);
      setConvertMessage(t('convert.pdfImagesMessage', { count: images.length }));
    }
  } catch (error) {
    const preview = document.getElementById('convert-result-preview');
    const meta = document.getElementById('convert-result-meta');
    const message = t('convert.failed', { message: error.message || t('convert.unknownError') });
    if (preview) preview.textContent = message;
    if (meta) meta.textContent = t('convert.resultFailure');
    setConvertMessage(message);
  } finally {
    fileConvertState.isProcessing = false;
    updateConvertButtons();
  }
}

function downloadFileConversionResult() {
  if (fileConvertState.resultImages.length) {
    setConvertMessage(t('convert.preparingImageZip', { count: fileConvertState.resultImages.length }));
    Promise.all(fileConvertState.resultImages.map(item => item.blob.arrayBuffer().then(buffer => ({ name: item.name, bytes: new Uint8Array(buffer) })))).then(entries => {
      const zipBlob = createZipBlob(entries);
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'pdf-pages.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setConvertMessage(t('convert.downloadedImageZip'));
    });
    return;
  }

  if (!fileConvertState.resultBlob) {
    setConvertMessage(t('convert.downloadFailedNoResult'));
    return;
  }
  const url = URL.createObjectURL(fileConvertState.resultBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileConvertState.resultName || 'converted-file';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  setConvertMessage(t('convert.downloadedFile', { name: fileConvertState.resultName || 'converted-file' }));
}

function onConvertDragOver(event) {
  event.preventDefault();
  const dropzone = document.getElementById('convert-dropzone');
  if (dropzone) dropzone.classList.add('drag-over');
}

function onConvertDragLeave() {
  const dropzone = document.getElementById('convert-dropzone');
  if (dropzone) dropzone.classList.remove('drag-over');
}

function onConvertDrop(event) {
  event.preventDefault();
  const dropzone = document.getElementById('convert-dropzone');
  if (dropzone) dropzone.classList.remove('drag-over');
  const file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
  if (!file) return;
  fileConvertState.file = file;
  const input = document.getElementById('convert-input');
  const meta = document.getElementById('convert-file-meta');
  if (input) input.value = '';
  if (meta) meta.textContent = t('convert.fileMetaCurrent', { name: file.name, size: formatBytes(file.size) });
  clearFileConversionResult();
  restoreConvertHint(true);
  if (fileConvertState.type === 'xlsx-to-csv') {
    readFileAsArrayBuffer(file).then(async (buffer) => {
      try {
        await loadScript(CDN.XLSX);
        const workbook = XLSX.read(buffer, { type: 'array', bookSheets: true });
        populateWorkbookSheetOptions(workbook.SheetNames || []);
      } catch {
        populateWorkbookSheetOptions([]);
      }
      updateConvertButtons();
    });
  } else {
    populateWorkbookSheetOptions([]);
    updateConvertButtons();
  }
}

const timestampPickerState = {
  current: null,
  viewingYear: 0,
  viewingMonth: 0,
  selectedDate: null,
  mode: 'datetime'
};

function padTime(value) {
  return String(value).padStart(2, '0');
}

function formatPickerDateTime(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  return [
    date.getFullYear(),
    '-',
    padTime(date.getMonth() + 1),
    '-',
    padTime(date.getDate()),
    ' ',
    padTime(date.getHours()),
    ':',
    padTime(date.getMinutes()),
    ':',
    padTime(date.getSeconds())
  ].join('');
}

function parsePickerInputValue(value) {
  if (!value) return null;
  const normalized = value.replace('T', ' ').trim();
  const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/);
  if (!match) return null;
  const [, year, month, day, hour = '00', minute = '00', second = '00'] = match;
  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second)
  );
  return Number.isNaN(date.getTime()) ? null : date;
}

function syncTimestampPickerInput() {
  if (timestampPickerState.mode === 'timestamp') {
    const input = document.getElementById('ts-timestamp');
    if (!input) return;
    input.value = timestampPickerState.selectedDate ? String(formatTimestampValue(timestampPickerState.selectedDate.getTime())) : '';
    if (input.value) {
      tsToDate();
    } else {
      document.getElementById('ts-to-date').textContent = '--';
      updateTimestampDetectHint('');
    }
    return;
  }

  const input = document.getElementById('ts-datetime');
  if (!input) return;
  input.value = timestampPickerState.selectedDate ? formatPickerDateTime(timestampPickerState.selectedDate) : '';
  if (input.value) {
    dateToTs();
  } else {
    document.getElementById('ts-to-ts').textContent = '--';
  }
}

function updateTimestampPickerPreview() {
  const preview = document.getElementById('ts-picker-preview');
  if (!preview) return;
  if (!timestampPickerState.selectedDate) {
    preview.textContent = t('timestamp.pickerEmpty');
    return;
  }
  const formatted = formatDateTimeByLanguage(timestampPickerState.selectedDate);
  if (timestampPickerState.mode === 'timestamp') {
    preview.textContent = formatted + ' → ' + formatTimestampValue(timestampPickerState.selectedDate.getTime()) + ' ' + formatTimestampUnitLabel();
  } else {
    preview.textContent = formatted;
  }
}

function fillTimestampSelectOptions(id, max) {
  const select = document.getElementById(id);
  if (!select || select.options.length) return;
  let html = '';
  for (let i = 0; i <= max; i++) {
    const value = padTime(i);
    html += `<option value="${value}">${value}</option>`;
  }
  select.innerHTML = html;
}

function initTimestampPickerSelectors() {
  fillTimestampSelectOptions('ts-picker-hour', 23);
  fillTimestampSelectOptions('ts-picker-minute', 59);
  fillTimestampSelectOptions('ts-picker-second', 59);
}

function setTimestampPickerTime(date) {
  document.getElementById('ts-picker-hour').value = padTime(date.getHours());
  document.getElementById('ts-picker-minute').value = padTime(date.getMinutes());
  document.getElementById('ts-picker-second').value = padTime(date.getSeconds());
}

function ensureTimestampPickerSelection() {
  if (!timestampPickerState.selectedDate) {
    timestampPickerState.selectedDate = new Date();
  }
}

function openTimestampPicker(mode = 'datetime') {
  initTimestampPickerSelectors();
  const panel = document.getElementById('ts-picker-panel');
  if (!panel) return;
  timestampPickerState.mode = mode;
  const inputValue = mode === 'timestamp'
    ? (() => {
        const raw = document.getElementById('ts-timestamp').value.trim();
        if (!raw) return '';
        const parsedTs = parseTimestampToMilliseconds(raw);
        if (parsedTs.error) return '';
        return formatPickerDateTime(new Date(parsedTs.milliseconds));
      })()
    : document.getElementById('ts-datetime').value;
  const parsed = parsePickerInputValue(inputValue);
  timestampPickerState.selectedDate = parsed || new Date();
  timestampPickerState.current = new Date(timestampPickerState.selectedDate.getTime());
  timestampPickerState.viewingYear = timestampPickerState.current.getFullYear();
  timestampPickerState.viewingMonth = timestampPickerState.current.getMonth();
  setTimestampPickerTime(timestampPickerState.selectedDate);
  renderTimestampPickerCalendar();
  updateTimestampPickerPreview();
  panel.classList.remove('hidden');
  setTimeout(() => {
    updateTimestampPickerPlacement();
    focusTimestampPickerSelection();
  }, 0);
}

function closeTimestampPicker() {
  const panel = document.getElementById('ts-picker-panel');
  if (!panel) return;
  panel.classList.add('hidden');
  panel.classList.remove('above', 'viewport-fixed');
  panel.style.top = '';
  panel.style.bottom = '';
  panel.style.maxHeight = '';
}

function getTimestampPickerAnchor() {
  if (timestampPickerState.mode === 'timestamp') {
    return document.querySelector('.ts-input-group-suffix');
  }
  return document.querySelector('.ts-picker-wrap');
}

function updateTimestampPickerPlacement() {
  const panel = document.getElementById('ts-picker-panel');
  const anchor = getTimestampPickerAnchor();
  if (!panel || !anchor || panel.classList.contains('hidden')) return;

  panel.classList.remove('above', 'viewport-fixed');
  panel.style.top = '';
  panel.style.bottom = '';
  panel.style.maxHeight = '';

  const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
  const isMobile = viewportWidth <= 700;
  const gap = 8;
  const edgePadding = isMobile ? 12 : 16;
  const anchorRect = anchor.getBoundingClientRect();

  if (isMobile) {
    panel.classList.add('viewport-fixed');

    const fixedTop = Math.max(edgePadding, Math.min(anchorRect.bottom + gap, viewportHeight - edgePadding));
    const availableHeight = Math.max(220, viewportHeight - fixedTop - edgePadding);

    panel.style.top = `${fixedTop}px`;
    panel.style.bottom = 'auto';
    panel.style.maxHeight = `${availableHeight}px`;
    return;
  }

  const panelRect = panel.getBoundingClientRect();
  const spaceBelow = viewportHeight - anchorRect.bottom - gap - edgePadding;
  const spaceAbove = anchorRect.top - gap - edgePadding;

  if (panelRect.height > spaceBelow && spaceAbove > spaceBelow) {
    panel.classList.add('above');
    panel.style.maxHeight = `${Math.max(220, spaceAbove)}px`;
    return;
  }

  panel.style.maxHeight = `${Math.max(220, spaceBelow)}px`;
}

function renderTimestampPickerCalendar() {
  const title = document.getElementById('ts-picker-title');
  const daysEl = document.getElementById('ts-picker-days');
  if (!title || !daysEl) return;

  const year = timestampPickerState.viewingYear;
  const month = timestampPickerState.viewingMonth;
  title.textContent = t('timestamp.monthTitle', { year, month: padTime(month + 1) });

  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  const today = new Date();
  let html = '';

  for (let i = 0; i < 42; i++) {
    let dayNumber;
    let renderMonth = month;
    let renderYear = year;
    let muted = false;

    if (i < startOffset) {
      dayNumber = prevMonthDays - startOffset + i + 1;
      renderMonth = month - 1;
      muted = true;
    } else if (i >= startOffset + daysInMonth) {
      dayNumber = i - startOffset - daysInMonth + 1;
      renderMonth = month + 1;
      muted = true;
    } else {
      dayNumber = i - startOffset + 1;
    }

    if (renderMonth < 0) {
      renderMonth = 11;
      renderYear -= 1;
    } else if (renderMonth > 11) {
      renderMonth = 0;
      renderYear += 1;
    }

    const isToday =
      today.getFullYear() === renderYear &&
      today.getMonth() === renderMonth &&
      today.getDate() === dayNumber;

    const isSelected =
      timestampPickerState.selectedDate &&
      timestampPickerState.selectedDate.getFullYear() === renderYear &&
      timestampPickerState.selectedDate.getMonth() === renderMonth &&
      timestampPickerState.selectedDate.getDate() === dayNumber;

    const classNames = ['ts-picker-day'];
    if (muted) classNames.push('muted');
    if (isToday) classNames.push('today');
    if (isSelected) classNames.push('selected');

    html += `<button type="button" class="${classNames.join(' ')}" onclick="selectTimestampPickerDate(${renderYear}, ${renderMonth}, ${dayNumber})" data-picker-date="${renderYear}-${padTime(renderMonth + 1)}-${padTime(dayNumber)}">${dayNumber}</button>`;
  }

  daysEl.innerHTML = html;
}

function focusTimestampPickerSelection() {
  if (typeof document.querySelector !== 'function') return;
  const selectedDay = document.querySelector('.ts-picker-day.selected');
  if (!selectedDay) return;

  if (typeof selectedDay.scrollIntoView === 'function') {
    selectedDay.scrollIntoView({
      block: 'center',
      inline: 'center',
      behavior: 'smooth'
    });
  }

  if (selectedDay.classList && typeof selectedDay.classList.add === 'function') {
    selectedDay.classList.add('focused-day');
  }

  if (typeof selectedDay.focus === 'function') {
    selectedDay.focus({ preventScroll: true });
  }
}

function changeTimestampPickerMonth(delta) {
  timestampPickerState.viewingMonth += delta;
  if (timestampPickerState.viewingMonth < 0) {
    timestampPickerState.viewingMonth = 11;
    timestampPickerState.viewingYear -= 1;
  } else if (timestampPickerState.viewingMonth > 11) {
    timestampPickerState.viewingMonth = 0;
    timestampPickerState.viewingYear += 1;
  }
  renderTimestampPickerCalendar();
  updateTimestampPickerPlacement();
}

function selectTimestampPickerDate(year, month, day) {
  ensureTimestampPickerSelection();
  timestampPickerState.selectedDate = new Date(
    year,
    month,
    day,
    timestampPickerState.selectedDate.getHours(),
    timestampPickerState.selectedDate.getMinutes(),
    timestampPickerState.selectedDate.getSeconds()
  );
  timestampPickerState.viewingYear = year;
  timestampPickerState.viewingMonth = month;
  syncTimestampPickerInput();
  renderTimestampPickerCalendar();
  updateTimestampPickerPreview();
  updateTimestampPickerPlacement();
}

function onTimestampPickerTimeChange() {
  ensureTimestampPickerSelection();
  timestampPickerState.selectedDate.setHours(Number(document.getElementById('ts-picker-hour').value));
  timestampPickerState.selectedDate.setMinutes(Number(document.getElementById('ts-picker-minute').value));
  timestampPickerState.selectedDate.setSeconds(Number(document.getElementById('ts-picker-second').value));
  syncTimestampPickerInput();
  updateTimestampPickerPreview();
}

function applyTimestampQuickDate(type) {
  const now = new Date();
  const base = timestampPickerState.selectedDate ? new Date(timestampPickerState.selectedDate.getTime()) : new Date();

  switch (type) {
    case 'now':
      timestampPickerState.selectedDate = new Date();
      timestampPickerState.viewingYear = timestampPickerState.selectedDate.getFullYear();
      timestampPickerState.viewingMonth = timestampPickerState.selectedDate.getMonth();
      setTimestampPickerTime(timestampPickerState.selectedDate);
      syncTimestampPickerInput();
      renderTimestampPickerCalendar();
      updateTimestampPickerPreview();
      updateTimestampPickerPlacement();
      return;
    case 'today':
      base.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'yesterday':
      base.setFullYear(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      break;
    case 'tomorrow':
      base.setFullYear(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      break;
    case 'weekStart': {
      const currentDay = now.getDay() || 7;
      base.setFullYear(now.getFullYear(), now.getMonth(), now.getDate() - currentDay + 1);
      break;
    }
    case 'monthStart':
      base.setFullYear(now.getFullYear(), now.getMonth(), 1);
      break;
    default:
      break;
  }

  timestampPickerState.selectedDate = base;
  timestampPickerState.viewingYear = base.getFullYear();
  timestampPickerState.viewingMonth = base.getMonth();
  setTimestampPickerTime(base);
  syncTimestampPickerInput();
  renderTimestampPickerCalendar();
  updateTimestampPickerPreview();
  updateTimestampPickerPlacement();
}

function clearTimestampPicker() {
  timestampPickerState.selectedDate = null;
  syncTimestampPickerInput();
  updateTimestampPickerPreview();
  document.getElementById('ts-picker-hour').value = '00';
  document.getElementById('ts-picker-minute').value = '00';
  document.getElementById('ts-picker-second').value = '00';
  updateTimestampPickerPlacement();
}

function confirmTimestampPicker() {
  ensureTimestampPickerSelection();
  onTimestampPickerTimeChange();
  syncTimestampPickerInput();
  closeTimestampPicker();
}

function getTimestampUnit() {
  const selected = document.querySelector('input[name="ts-unit"]:checked');
  return selected ? selected.value : 'seconds';
}

function isMillisecondUnit() {
  return getTimestampUnit() === 'milliseconds';
}

function updateTimestampInputPlaceholder() {
  const input = document.getElementById('ts-timestamp');
  if (!input) return;
  input.placeholder = isMillisecondUnit() ? t('timestamp.inputPlaceholderMilliseconds') : t('timestamp.inputPlaceholderSeconds');
}

function formatTimestampValue(ms) {
  return isMillisecondUnit() ? ms : Math.floor(ms / 1000);
}

function formatTimestampUnitLabel() {
  return isMillisecondUnit() ? t('timestamp.units.milliseconds') : t('timestamp.units.seconds');
}

function updateTimestampDetectHint(message = '') {
  const hint = document.getElementById('ts-detect-hint');
  if (!hint) return;
  hint.textContent = message;
}

function flashCopiedState(element, originalText) {
  if (!element) return;
  element.classList.add('copied');
  element.dataset.originalText = originalText;
  element.textContent = t('common.copied');
  setTimeout(() => {
    element.classList.remove('copied');
    element.textContent = element.dataset.originalText || originalText;
  }, 1200);
}

function writeTextToClipboard(text) {
  if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    return navigator.clipboard.writeText(text);
  }

  if (typeof document !== 'undefined' && typeof document.createElement === 'function' && document.body) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();

    try {
      if (typeof document.execCommand === 'function') {
        document.execCommand('copy');
      }
    } finally {
      document.body.removeChild(textarea);
    }

    return Promise.resolve();
  }

  return Promise.resolve();
}

function copyTimestampResult(id) {
  const element = document.getElementById(id);
  if (!element) return;
  const text = (element.textContent || '').trim();
  const blocked = ['--', t('timestamp.currentTimestampPlaceholder'), t('timestamp.invalidNumber'), t('timestamp.invalidTimestamp'), t('timestamp.chooseTime')];
  if (!text || blocked.includes(text)) return;

  writeTextToClipboard(text).then(() => {
    flashCopiedState(element, text);
  });
}

function pulseRealtimeStatusRow(id, className) {
  const element = document.getElementById(id);
  if (!element) return;
  const row = element.closest('.ts-now-row');
  if (!row) return;
  row.classList.remove(className);
  void row.offsetWidth;
  row.classList.add(className);
}

function updateLiveIndicatorMode() {
  const liveIndicator = document.querySelector('.ts-now-live');
  if (!liveIndicator) return;
  liveIndicator.classList.toggle('ts-now-live-seconds', !isMillisecondUnit());
  liveIndicator.classList.toggle('ts-now-live-milliseconds', isMillisecondUnit());
}

function pulseLiveIndicator() {
  const liveIndicator = document.querySelector('.ts-now-live');
  if (!liveIndicator || isMillisecondUnit()) return;
  liveIndicator.classList.remove('ts-now-live-tick');
  void liveIndicator.offsetWidth;
  liveIndicator.classList.add('ts-now-live-tick');
}

function animateCurrentTimestampUnitSwitch(nextText) {
  const timestampEl = document.getElementById('ts-now-timestamp');
  if (!timestampEl) return false;
  if (timestampEl.textContent === nextText) return false;
  timestampEl.classList.remove('ts-now-data-roll');
  void timestampEl.offsetWidth;
  timestampEl.textContent = nextText;
  timestampEl.classList.add('ts-now-data-roll');
  return true;
}

function parseTimestampToMilliseconds(rawValue) {
  if (!/^[+-]?\d+$/.test(rawValue)) {
    return { error: 'invalid-number' };
  }

  const normalized = rawValue.replace(/^[+-]/, '');
  const numericValue = Number(rawValue);

  if (Number.isNaN(numericValue)) {
    return { error: 'invalid-number' };
  }

  if (normalized.length === 13) {
    return { milliseconds: numericValue, detectedUnit: 'milliseconds', detectedBy: 'length' };
  }

  if (normalized.length === 10) {
    return { milliseconds: numericValue * 1000, detectedUnit: 'seconds', detectedBy: 'length' };
  }

  return {
    milliseconds: isMillisecondUnit() ? numericValue : numericValue * 1000,
    detectedUnit: isMillisecondUnit() ? 'milliseconds' : 'seconds',
    detectedBy: 'toggle'
  };
}

function refreshNow() {
  const nowMs = Date.now();
  const nowValue = formatTimestampValue(nowMs);
  const timestampEl = document.getElementById('ts-now-timestamp');
  const displayEl = document.getElementById('ts-now-display');
  if (timestampEl) {
    timestampEl.textContent = nowValue + ' ' + formatTimestampUnitLabel();
  }
  if (displayEl) {
    displayEl.textContent = formatDateTimeByLanguage(new Date(nowMs));
  }
  pulseRealtimeStatusRow('ts-now-display', 'ts-now-row-live-tick');
  if (!isMillisecondUnit()) {
    pulseRealtimeStatusRow('ts-now-timestamp', 'ts-now-row-seconds-flash');
  }
  pulseLiveIndicator();
}

function onTimestampUnitChange() {
  const nowText = formatTimestampValue(Date.now()) + ' ' + formatTimestampUnitLabel();
  animateCurrentTimestampUnitSwitch(nowText);
  updateLiveIndicatorMode();
  updateTimestampInputPlaceholder();
  refreshNow();

  const dateTimeVal = document.getElementById('ts-datetime').value;
  if (dateTimeVal) {
    dateToTs();
  } else {
    document.getElementById('ts-to-ts').textContent = '--';
  }

  const timestampVal = document.getElementById('ts-timestamp').value.trim();
  if (timestampVal) {
    tsToDate();
  } else {
    document.getElementById('ts-to-date').textContent = '--';
    updateTimestampDetectHint('');
  }
}

refreshNow();
updateLiveIndicatorMode();
updateTimestampInputPlaceholder();
updateTimestampDetectHint('');
setInterval(refreshNow, 1000);

function dateToTs() {
  const val = document.getElementById('ts-datetime').value;
  if (!val) { document.getElementById('ts-to-ts').textContent = t('timestamp.chooseTime'); return; }
  const parsedDate = parsePickerInputValue(val);
  if (!parsedDate) { document.getElementById('ts-to-ts').textContent = t('timestamp.chooseTime'); return; }
  const ms = parsedDate.getTime();
  document.getElementById('ts-to-ts').textContent = formatTimestampValue(ms) + ' ' + formatTimestampUnitLabel();
}
function tsToDate() {
  const val = document.getElementById('ts-timestamp').value.trim();
  if (!val) {
    document.getElementById('ts-to-date').textContent = t('timestamp.currentTimestampPlaceholder');
    updateTimestampDetectHint('');
    return;
  }
  const parsed = parseTimestampToMilliseconds(val);
  if (parsed.error) {
    document.getElementById('ts-to-date').textContent = t('timestamp.invalidNumber');
    updateTimestampDetectHint('');
    return;
  }
  const d = new Date(parsed.milliseconds);
  if (Number.isNaN(d.getTime())) {
    document.getElementById('ts-to-date').textContent = t('timestamp.invalidTimestamp');
    updateTimestampDetectHint('');
    return;
  }
  if (parsed.detectedBy === 'length') {
    updateTimestampDetectHint(parsed.detectedUnit === 'milliseconds' ? t('timestamp.detectAutoMilliseconds') : t('timestamp.detectAutoSeconds'));
  } else {
    updateTimestampDetectHint(t('timestamp.detectByCurrentUnit', { unit: formatTimestampUnitLabel() }));
  }
  document.getElementById('ts-to-date').textContent = formatDateTimeByLanguage(d);
}

/* === 通用工具函数 === */
function clearInput(id) {
  document.getElementById(id).value = '';
  if (id === 'count-input') liveCount();
}

function copyOutput(id) {
  const el = document.getElementById(id);
  let text = '';
  if (el.tagName === 'PRE' || el.tagName === 'DIV') {
    text = el.textContent || el.innerText;
  } else if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
    text = el.value;
  } else {
    text = el.textContent || el.innerText;
  }
  if (!text || text === '--') return;
  writeTextToClipboard(text).then(() => {
    const btn = event.target;
    const orig = btn.textContent;
    btn.textContent = t('common.copied');
    setTimeout(() => btn.textContent = orig, 1200);
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* === 打赏弹窗 === */
function getPayPalSupportUrl() {
  return supportConfig.paypalUsername
    ? `https://www.paypal.com/paypalme/${supportConfig.paypalUsername}`
    : 'https://www.paypal.com/paypalme/';
}

function getBuyMeACoffeeUrl() {
  return supportConfig.buyMeACoffeeUsername
    ? `https://buymeacoffee.com/${supportConfig.buyMeACoffeeUsername}`
    : 'https://buymeacoffee.com/';
}

function getKoFiUrl() {
  return supportConfig.koFiUsername
    ? `https://ko-fi.com/${supportConfig.koFiUsername}`
    : 'https://ko-fi.com/';
}

function applySupportLinks() {
  const contactText = document.getElementById('support-contact-text');
  const paypalLink = document.getElementById('paypal-support-link');
  const paypalText = document.getElementById('paypal-support-text');
  const bmacLink = document.getElementById('bmac-support-link');
  const bmacText = document.getElementById('bmac-support-text');
  const kofiLink = document.getElementById('kofi-support-link');
  const kofiText = document.getElementById('kofi-support-text');

  const hasPayPal = Boolean(supportConfig.paypalUsername);
  const hasBmac = Boolean(supportConfig.buyMeACoffeeUsername);
  const hasKoFi = Boolean(supportConfig.koFiUsername);
  const paypalUrl = getPayPalSupportUrl();
  const bmacUrl = getBuyMeACoffeeUrl();
  const kofiUrl = getKoFiUrl();

  if (contactText) {
    contactText.textContent = supportConfig.contact || t('common.notSet');
  }

  if (paypalLink) {
    paypalLink.href = hasPayPal ? paypalUrl : '#';
    paypalLink.textContent = hasPayPal ? t('support.paypalConfigured') : t('support.paypalPending');
    paypalLink.classList.toggle('is-disabled', !hasPayPal);
    paypalLink.setAttribute('aria-disabled', hasPayPal ? 'false' : 'true');
    paypalLink.tabIndex = hasPayPal ? 0 : -1;
  }
  if (paypalText) {
    paypalText.textContent = hasPayPal ? paypalUrl : t('support.paypalMissingText');
  }

  if (bmacLink) {
    bmacLink.href = hasBmac ? bmacUrl : '#';
    bmacLink.textContent = hasBmac ? 'Buy Me a Coffee' : t('support.bmacPending');
    bmacLink.classList.toggle('is-disabled', !hasBmac);
    bmacLink.setAttribute('aria-disabled', hasBmac ? 'false' : 'true');
    bmacLink.tabIndex = hasBmac ? 0 : -1;
  }
  if (bmacText) {
    bmacText.textContent = hasBmac ? bmacUrl : t('support.bmacMissingText');
  }

  if (kofiLink) {
    kofiLink.href = hasKoFi ? kofiUrl : '#';
    kofiLink.textContent = hasKoFi ? 'Ko-fi' : t('support.kofiPending');
    kofiLink.classList.toggle('is-disabled', !hasKoFi);
    kofiLink.setAttribute('aria-disabled', hasKoFi ? 'false' : 'true');
    kofiLink.tabIndex = hasKoFi ? 0 : -1;
  }
  if (kofiText) {
    kofiText.textContent = hasKoFi ? kofiUrl : t('support.kofiMissingText');
  }
}

function showSupport() {
  document.getElementById('support-modal').classList.remove('hidden');
  applySupportLinks();
  switchSupportTab('cn');
}
function hideSupport() {
  document.getElementById('support-modal').classList.add('hidden');
}
function switchSupportTab(tab) {
  const isCn = tab === 'cn';
  const cnTab = document.getElementById('support-tab-cn');
  const intlTab = document.getElementById('support-tab-intl');
  const cnPanel = document.getElementById('support-panel-cn');
  const intlPanel = document.getElementById('support-panel-intl');

  if (cnTab) cnTab.classList.toggle('active', isCn);
  if (intlTab) intlTab.classList.toggle('active', !isCn);
  if (cnPanel) cnPanel.classList.toggle('hidden', !isCn);
  if (intlPanel) intlPanel.classList.toggle('hidden', isCn);
}
function copySupportContact() {
  const value = supportConfig.contact || '';
  const button = document.getElementById('support-contact-copy-btn');
  if (!value) return;
  writeTextToClipboard(value).then(() => {
    if (!button) return;
    const originalText = button.dataset.originalText || t('support.copyContact');
    button.dataset.originalText = originalText;
    button.textContent = t('support.copiedContact');
    setTimeout(() => {
      button.textContent = button.dataset.originalText || t('support.copyContact');
    }, 1200);
  });
}
document.getElementById('support-modal').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) hideSupport();
});

document.getElementById('ts-timestamp').addEventListener('input', () => {
  const val = document.getElementById('ts-timestamp').value.trim();
  if (val) {
    tsToDate();
  } else {
    document.getElementById('ts-to-date').textContent = '--';
    updateTimestampDetectHint('');
  }
});

document.addEventListener('click', (e) => {
  const panel = document.getElementById('ts-picker-panel');
  const wrap = document.querySelector('.ts-picker-wrap');
  if (!panel || panel.classList.contains('hidden') || !wrap) return;
  if (!wrap.contains(e.target)) {
    closeTimestampPicker();
  }
});

document.addEventListener('keydown', (e) => {
  const panel = document.getElementById('ts-picker-panel');
  if (!panel || panel.classList.contains('hidden')) return;
  if (e.key === 'Escape') {
    closeTimestampPicker();
    return;
  }
  if (e.key === 'Enter') {
    if (typeof e.preventDefault === 'function') e.preventDefault();
    confirmTimestampPicker();
  }
});

window.addEventListener('resize', updateTimestampPickerPlacement);
window.addEventListener('scroll', updateTimestampPickerPlacement, true);


const imageInput = document.getElementById('img-input');
const imageCanvas = getImageCanvas();
const imageCanvasWrap = document.getElementById('img-canvas-wrap');
const convertInput = document.getElementById('convert-input');
const convertDropzone = document.getElementById('convert-dropzone');

if (imageInput) {
  imageInput.addEventListener('change', onImageInputChange);
}

if (imageCanvas) {
  imageCanvas.addEventListener('pointerdown', onImageCanvasPointerDown);
  imageCanvas.addEventListener('pointermove', onImageCanvasPointerMove);
  imageCanvas.addEventListener('pointerup', onImageCanvasPointerUp);
  imageCanvas.addEventListener('pointercancel', onImageCanvasPointerUp);
}

if (imageCanvasWrap) {
  imageCanvasWrap.addEventListener('dragover', onImageDragOver);
  imageCanvasWrap.addEventListener('dragleave', onImageDragLeave);
  imageCanvasWrap.addEventListener('drop', onImageDrop);
}

if (convertInput) {
  convertInput.addEventListener('change', onConvertFileChange);
}

if (convertDropzone) {
  convertDropzone.addEventListener('dragover', onConvertDragOver);
  convertDropzone.addEventListener('dragleave', onConvertDragLeave);
  convertDropzone.addEventListener('drop', onConvertDrop);
}

window.addEventListener('resize', () => {
  if (imageToolState.image) {
    drawImageEditor();
  }
});

applyI18n();
onImageQualityChange();
renderImageQueue();
updateImageCompressionSummary();
syncImageMeta();
clearImageResult();
updateImageActionButtons();
onConvertTypeChange();
updateConvertAdvancedOptions();
updateConvertButtons();
applySupportLinks();
