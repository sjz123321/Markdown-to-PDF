[**English**](README.md) | [**中文**](README_zh.md)

---

# md2pdf — Markdown 转 PDF 命令行工具

将 Markdown 文件转换为排版精美的 PDF，支持中文、代码高亮、表格、目录、自定义样式等特性。

## 特性

- **即装即用** — Node.js + Chromium（Puppeteer），无需额外系统依赖
- **中文优先** — 内置中文字体栈（PingFang / Microsoft YaHei / Noto Sans SC）
- **多文件合并** — 将多个 `.md` 合并为一个 PDF
- **自动目录** — `--toc` 根据标题层级生成超链接目录
- **自定义样式** — `--css` 传入自定义 CSS 覆盖默认主题
- **页眉页脚** — `--header / --footer` 支持页码占位符
- **代码高亮** — 深色背景代码块 + 可选行号（`--line-numbers`）
- **页面控制** — 支持 A4 / Letter / 横向 / 自定义边距
- **打印友好** — `--print` 保留背景色

## 安装

```bash
# 克隆项目
git clone https://github.com/your-username/md2pdf-tool.git
cd md2pdf-tool

# 安装依赖
npm install

# （可选）全局安装，之后可直接使用 md2pdf 命令
npm link
```

要求 Node.js >= 18。

## 使用

```bash
# 转换单个文件（输出同名的 .pdf）
node cli.js input.md

# 指定输出路径
node cli.js input.md -o output.pdf

# 合并多个文件
node cli.js chapter1.md chapter2.md -o book.pdf

# 生成目录
node cli.js readme.md --toc

# 横向页面 + 自定义边距
node cli.js document.md --landscape --margin 15mm

# 页眉页脚
node cli.js doc.md --header "项目文档" --footer "第 %page% 页"

# 自定义样式
node cli.js doc.md --css my-theme.css

# 代码块行号 + 打印友好
node cli.js doc.md --line-numbers --print

# 生成后自动打开 PDF
node cli.js readme.md --open
```

全局安装后：

```bash
md2pdf readme.md
md2pdf chap1.md chap2.md -o book.pdf --toc --landscape
```

## 选项

| 选项 | 说明 | 默认 |
|------|------|------|
| `-o, --output` | 输出 PDF 路径 | 输入文件名 + `.pdf` |
| `--css` | 自定义 CSS 文件 | 内置默认样式 |
| `--header` | 页眉文本（HTML） | 无 |
| `--footer` | 页脚文本（支持 `%page%`） | 无 |
| `--page-size` | 页面大小 | `A4` |
| `--margin` | 页面边距（CSS 单位） | `25.4mm` |
| `--landscape` | 横向布局 | 否 |
| `--toc` | 生成标题目录 | 否 |
| `--line-numbers` | 代码块显示行号 | 否 |
| `--print` | 打印友好模式 | 否 |
| `--open` | 生成后打开 PDF | 否 |

## 技术栈

- **[marked](https://github.com/markedjs/marked)** — Markdown → HTML 解析
- **[Puppeteer](https://github.com/puppeteer/puppeteer)** — Headless Chromium HTML → PDF
- **[commander](https://github.com/tj/commander.js)** — CLI 参数解析

## License

MIT