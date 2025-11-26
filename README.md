# ImageSeg

一个简洁的图片网格切割工具，可以将图片按指定行列数切割成多个小图片并批量下载。

## 功能特性

- 🖼️ 图片上传与预览
- 📐 自定义网格行列数（1-20）
- 🔲 支持原比例/正方形裁剪模式
- ↔️ 独立的横向/纵向缩放控制
- ✂️ 自定义切割边距
- 📁 自定义文件命名前缀
- 💾 支持 PNG/JPG/WebP 格式导出
- 📦 批量打包 ZIP 下载

## 技术栈

- Vue 3 + TypeScript
- Vite
- Tailwind CSS
- Lucide Icons
- JSZip + FileSaver

## 本地运行

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 致谢

原项目：[BlockX](https://github.com/onebtcdesign/BlockX)
