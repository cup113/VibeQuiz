# 🧠 VibeQuiz - AI智能测验生成器

[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

**AI智能测验生成器与交互式学习工具** — 通过AI提示生成测验，导入JSON格式问题，进行交互式评估，并获取AI驱动的错误分析来提升知识掌握度。

**GitHub 描述**：AI智能测验生成器：支持AI提示生成测验、JSON导入、交互式评估和AI错误分析。

---

## ✨ 功能特性

- **🪄 AI测验生成**：使用提供的提示词模板以供复制给 AI 生成测验
- **📝 JSON导入**：导入标准JSON格式的测验问题
- **🎯 交互式评估**：简洁现代的测验界面，支持进度跟踪
- **🤖 AI错误分析**：获取整合的AI提示词，批量分析错误
- **🎨 现代UI**：基于Tailwind CSS的漂亮响应式设计
- **📱 移动端友好**：在所有设备上无缝运行
- **🔄 测验随机化**：每次会话中问题和选项随机排列

---

## 🚀 快速开始

### 1. 使用AI生成测验（平台外）

复制以下提示词模板，向您的 AI 助手请求生成测验问题：

```markdown
# 能力与规则：

## 出题方向

【输入你的出题方向】

## 干扰项设计（Distractor Quality）

- **避免主观**：干扰项必须有据可查。
- **难度适中**：干扰项应具有迷惑性，能够区分"模糊记忆"与"精准掌握"。
- **选项数量**：每题总共 3-6 个选项，若考点单一可设为 3-4 个。

# 输出格式：

输出一个 JSON 代码块，格式如下：

```typescript
Array<{
  question: string, // 题干，需标明题目类型（单选/多选）
  keys: string[],   // 正确答案数组
  distractors: string[] // 干扰项数组
}>
```

**AI提示词示例：**

1. 生成 5 个关于第二次世界大战历史的问题
2. 创建 3 个关于async/await的JavaScript编程问题

### 2. 导入JSON

将生成的JSON复制到主页的文本区域：

```json
[
  {
    "question": "以下哪些是JavaScript框架？",
    "keys": ["React", "Vue"],
    "distractors": ["Django", "Flask", "Laravel"]
  },
  {
    "question": "第二次世界大战在哪一年结束？",
    "keys": ["1945"],
    "distractors": ["1944", "1946", "1939"]
  }
]
```

### 3. 进行测验

- 点击"开始测验 →"
- 选择答案（多选题支持多选）
- 检查答案并查看解释
- 查看带有AI错误分析的详细结果

---

## 📦 安装与开发

### 环境要求
- Node.js 18+ 和 npm/pnpm

### 设置步骤
```bash
# 克隆仓库
git clone <your-repo-url>
cd VibeQuiz

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build
```

### 项目结构
```
VibeQuiz/
├── src/
│   ├── main.ts          # 主应用逻辑
│   ├── style.css        # Tailwind CSS导入
│   └── counter.ts       # (示例计数器组件)
├── index.html           # 主HTML文件，包含SEO和说明
├── package.json         # 依赖和脚本
├── tsconfig.json        # TypeScript配置
├── vite.config.ts       # Vite配置
└── public/              # 静态资源
```

## 🤝 贡献指南

欢迎贡献！请随时提交Pull Request。

1. Fork本仓库
2. 创建功能分支（`git checkout -b feature/amazing-feature`）
3. 提交更改（`git commit -m '添加一些很棒的功能'`）
4. 推送到分支（`git push origin feature/amazing-feature`）
5. 开启Pull Request

---

## 📄 许可证

本项目采用开源[MIT许可证](LICENSE)。
