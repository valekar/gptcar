# GPTcar

[查看Opus与GPT对比画廊](https://valekar.github.io/gptcar/)：一个页面，51种风格，左侧为原始Opus影片，右侧为GPT-6.1 Sol High独立制作的20秒样片。

面向 Codex 的 51 种纯代码影片风格，基于 Lemomo / LemoLab 的 [Lemo-Opuscar](https://github.com/lemomo-ai/lemo-opuscar) 独立改编。保留原始风格提示词、样片源码、MIT 许可与署名。原始样片使用 Claude Opus 5.5 制作，不是 Codex 的效果基准。

在 Codex 中打开此仓库，然后输入 `$gptcar`。需要在任意目录使用时，运行 `python3 tools/install_codex_skill.py`。完整安装步骤、依赖与限制见 [英文说明](README.md)。

- [全部 51 种风格](styles/README.md)
- [兼容性检查](docs/COMPATIBILITY.md)
- [验证结果](docs/VALIDATION.md)
- [原始样片画廊](https://lemomo-ai.github.io/lemo-opuscar/)

生产工具不绑定某个语言模型；GPT-6.1 Sol 及其他具备本地执行工具的 Codex 模型可以使用这些指南。普通文本聊天本身不能渲染影片，模型间的画面质量也不保证相同。原始 Claude 插件与画廊文件保留为上游资料；Codex 入口是 `.agents/skills/gptcar/SKILL.md`。
