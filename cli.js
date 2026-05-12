#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { Command } = require('commander');
const { convertMdToPdf } = require('./lib/convert');

const program = new Command();

program
  .name('md2pdf')
  .description('将 Markdown 文件转换为 PDF')
  .version(require('./package.json').version)
  .argument('<files...>', '一个或多个 Markdown 文件路径')
  .option('-o, --output <path>', '输出 PDF 文件路径（默认取第一个输入文件名）')
  .option('--css <path>', '自定义 CSS 样式表路径')
  .option('--header <text>', '页眉文本（HTML 格式）')
  .option('--footer <text>', '页脚文本（支持 %page% 占位符）')
  .option('--page-size <size>', '页面大小，如 A4, Letter, Legal', 'A4')
  .option('--margin <margin>', '页面边距，如 20mm, 1in', '25.4mm')
  .option('--landscape', '横向页面')
  .option('--print', '打印友好模式（保留背景色）')
  .option('--toc', '生成目录')
  .option('--line-numbers', '代码块显示行号')
  .option('--open', '生成后打开 PDF')
  .addHelpText('after', `
示例：
  $ md2pdf readme.md
  $ md2pdf readme.md -o output.pdf --toc
  $ md2pdf chap1.md chap2.md -o book.pdf --header "我的文档"
  $ md2pdf doc.md --css style.css --landscape --page-size A3
  $ md2pdf doc.md --print --line-numbers
  $ md2pdf readme.md --open`);

program.parse(process.argv);

async function main() {
  const opts = program.opts();
  const inputs = program.args;

  // Validate inputs exist
  const missing = inputs.filter(f => !fs.existsSync(f));
  if (missing.length > 0) {
    console.error(`错误: 以下文件不存在:\n  ${missing.join('\n  ')}`);
    process.exit(1);
  }

  // Determine output path
  let output = opts.output;
  if (!output) {
    const first = path.parse(inputs[0]);
    output = path.join(first.dir, first.name + '.pdf');
  }

  // Ensure output directory exists
  const outDir = path.dirname(output);
  if (outDir && !fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Validate CSS if provided
  if (opts.css && !fs.existsSync(opts.css)) {
    console.error(`错误: CSS 文件不存在: ${opts.css}`);
    process.exit(1);
  }

  console.log(`📄 输入: ${inputs.length} 个文件`);
  console.log(`   ${inputs.join('\n   ')}`);
  console.log(`📥 输出: ${output}`);

  const startTime = Date.now();

  try {
    const result = await convertMdToPdf({
      inputs,
      output,
      css: opts.css || null,
      header: opts.header || null,
      footer: opts.footer ? opts.footer.replace(/%page%/g, '__PAGE__').replace(/%total%/g, '__TOTAL__') : null,
      pageSize: opts.pageSize,
      margin: opts.margin,
      print: opts.print || false,
      toc: opts.toc || false,
      landscape: opts.landscape || false,
      lineNumbers: opts.lineNumbers || false,
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`✅ 转换完成 (${elapsed}s): ${output}`);

    // Open PDF if requested
    if (opts.open) {
      const { execSync } = require('child_process');
      try {
        execSync(`start "" "${output}"`, { shell: true });
      } catch {
        // ignore open errors
      }
    }
  } catch (err) {
    console.error(`❌ 转换失败: ${err.message}`);
    process.exit(1);
  }
}

main();