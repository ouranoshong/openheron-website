/**
 * 站点文案：所有中英文界面文字的单一来源。
 *
 * 页面模板只按 lang 取值，不在模板里写死中英两种字符串。
 * 章节正文来自 openheron 仓库的手册原文（构建时拆章），不在这里。
 */

import type { Lang } from './i18n';

type Dict = Record<Lang, string>;

/** 给定语言取词条。 */
export function t(lang: Lang, dict: Dict): string {
  return dict[lang];
}

export const site = {
  name: 'openheron',
  tagline: {
    zh: 'Agent 即工具 多 Agent 运行时',
    en: 'Agent-as-tool multi-agent runtime',
  } satisfies Dict,
  description: {
    zh: 'openheron 是一个多 Agent 运行时：每个专家 Agent 绑定适合自己的模型，父 Agent 只做编排与合成 —— token 花在真正需要它的地方。附完整使用手册。',
    en: 'openheron is a multi-agent runtime where every expert agent binds the model that suits it, while the parent agent only orchestrates and synthesises — tokens are spent where they actually matter. Full user manual included.',
  } satisfies Dict,
} as const;

export const nav = {
  home: { zh: '首页', en: 'Home' } satisfies Dict,
  manual: { zh: '用户手册', en: 'Manual' } satisfies Dict,
  commands: { zh: '命令速查', en: 'Commands' } satisfies Dict,
  quickstart: { zh: '快速开始', en: 'Quick start' } satisfies Dict,
  language: { zh: '语言', en: 'Language' } satisfies Dict,
  github: { zh: 'GitHub', en: 'GitHub' } satisfies Dict,
  desktop: { zh: '桌面版', en: 'Desktop' } satisfies Dict,
} as const;

/** 首页各区块 */
export const home = {
  badges: {
    local: { zh: '本地优先', en: 'Local-first' } satisfies Dict,
    multi: { zh: '多 Agent', en: 'Multi-agent' } satisfies Dict,
  },

  heroTitle: {
    zh: 'Agent 即工具\n多 Agent 运行时',
    en: 'Agent-as-tool\nmulti-agent runtime',
  } satisfies Dict,

  heroLead: {
    zh: '每个专家 Agent 绑定适合自己的模型，父 Agent 只做编排与合成。省 token 不是靠压缩提示词，是靠边界让不该跨界的内容不跨界 —— 隔离是完全的：专家的中间过程不进父的任何一轮上下文。',
    en: 'Every expert agent binds the model that suits it, while the parent agent only orchestrates and synthesises. Tokens are saved not by compressing prompts, but by drawing boundaries so content that should not cross does not cross — isolation is complete: an expert’s intermediate steps never enter any turn of the parent’s context.',
  } satisfies Dict,

  /**
   * 首屏指标块：大号数字 + 口径说明。
   * 数字来自 openheron 自带基准的实测，完整口径见 boundaries 里的同一条。
   */
  heroStat: {
    value: '41%',
    label: {
      zh: '在可分解、工具输出冗长的编码任务上实测省下的费用，对照「一个强模型直干」。',
      en: 'lower cost on decomposable coding tasks with verbose tool output, measured against one strong model doing the same work.',
    } satisfies Dict,
  } satisfies Dict,

  heroCta: {
    primary: { zh: '五分钟跑起来 →', en: 'Run it in five minutes →' } satisfies Dict,
    secondary: { zh: '先看看它能做什么', en: 'See what it can do' } satisfies Dict,
  } satisfies Dict,

  heroNote: {
    zh: '名字来自苍鹭（heron）：长久静立、瞬间精准出手。',
    en: 'Named after the heron: standing still for a long time, striking with precision in an instant.',
  } satisfies Dict,

  /**
   * 桌面版安装包区块。
   * 版本号、大小、sha256 不在这里 —— 那些由构建时实测写入 desktop.json，
   * 页面读那份文件，写死的文案只管「怎么说话」。
   */
  desktop: {
    eyebrow: { zh: '桌面版', en: 'Desktop' } satisfies Dict,
    title: { zh: '托盘里的 openheron', en: 'openheron in the tray' } satisfies Dict,
    lead: {
      zh: '装上之后它常驻系统托盘：双击图标就起服务、开界面，不用敲命令。端口每次重选，地址只显示在托盘上。',
      en: 'It lives in the system tray: one click starts the service and opens the interface — nothing to type. The port is picked on every start, and the address shows in the tray and nowhere else.',
    } satisfies Dict,
    button: { zh: '下载', en: 'Download' } satisfies Dict,
    meta: {
      version: { zh: '版本', en: 'Version' } satisfies Dict,
      size: { zh: '大小', en: 'Size' } satisfies Dict,
      platform: { zh: '平台', en: 'Platform' } satisfies Dict,
      built: { zh: '构建日期', en: 'Built' } satisfies Dict,
      sha256: { zh: 'SHA256', en: 'SHA256' } satisfies Dict,
    } satisfies Dict,
    checksums: { zh: 'SHA256SUMS.txt', en: 'SHA256SUMS.txt' } satisfies Dict,
    other: {
      zh: 'macOS 还没有安装包；Linux 用 AppImage，同样在这一页下载。',
      en: 'There is no package for macOS yet; Linux uses the AppImage, downloadable from this page too.',
    } satisfies Dict,
    guide: {
      zh: '安装与使用说明',
      en: 'Install and use',
    } satisfies Dict,
  },

  /** 三条机制 */
  mechanisms: {
    eyebrow: { zh: 'How it saves', en: 'How it saves' } satisfies Dict,
    title: { zh: '三条机制拿到「省 token」', en: 'Three mechanisms deliver the token saving' } satisfies Dict,
    lead: {
      zh: '省 token 有三种做法，openheron 走的是第三条。',
      en: 'There are three ways to save tokens. openheron takes the third.',
    } satisfies Dict,
    items: [
      {
        name: { zh: '专家配专模', en: 'Expert gets expert model' } satisfies Dict,
        desc: {
          zh: '每个 Agent 在 agents/*.md 里声明自己的 model:，简单检索不为不需要的推理能力付费，复杂任务也不将就小模型。',
          en: 'Every agent declares its own model: in agents/*.md, so a simple retrieval does not pay for reasoning capability it does not need, and a complex task does not settle for a small model.',
        } satisfies Dict,
      },
      {
        name: { zh: '工具即隔离', en: 'Tools are isolation' } satisfies Dict,
        desc: {
          zh: '专家 Agent 作为一个有界能力被调用：它自己的工具循环与中间推理留在自己的上下文里，父 Agent 只拿到它写的那份结构化总结。',
          en: 'An expert agent is called as a bounded capability: its own tool loop and intermediate reasoning stay in its context, and the parent receives only the structured summary it wrote.',
        } satisfies Dict,
      },
      {
        name: { zh: '结构即节省', en: 'Structure is savings' } satisfies Dict,
        desc: {
          zh: '边界让不该跨界的内容不跨界 —— 隔离是完全的：专家的中间过程不进父的任何一轮上下文。',
          en: 'Boundaries keep content from crossing — isolation is complete: an expert’s intermediate steps never enter any turn of the parent’s context.',
        } satisfies Dict,
      },
    ],
  },

  /** 边界声明 */
  boundaries: {
    eyebrow: { zh: 'Boundaries', en: 'Boundaries' } satisfies Dict,
    title: {
      zh: '边界先说清楚，比事后解释便宜',
      en: 'Stating the boundaries up front is cheaper than explaining them afterwards',
    } satisfies Dict,
    items: [
      {
        text: {
          zh: '省 token 在可分解、工具输出冗长的任务上最显著；顺序依赖强的任务，单 Agent 反而可能更快更准。',
          en: 'The token saving is largest on tasks that are decomposable with verbose tool output; on strongly order-dependent tasks a single agent may be faster and more accurate.',
        } satisfies Dict,
      },
      {
        text: {
          zh: '「省 41%」是 openheron 自带基准的实测口径：三类编码任务、同一张价格表下，多 Agent 拓扑花了「一个强模型直干」的 0.587 倍；同一轮它通过 6/9（基线 9/9，其中两次失败是端点超时）—— 省钱和可靠性要一起看。',
          en: '"41% cheaper" is a measured figure from openheron’s own benchmark: on three coding tasks with one price table, the multi-agent topology cost 0.587× what one strong model spent on the same work; in that sweep it passed 6 of 9 (the baseline passed 9 of 9, two of the failures being endpoint timeouts) — cost and reliability have to be read together.',
        } satisfies Dict,
      },
      {
        text: {
          zh: '「高性能」指单位 token 的有效产出，不承诺零延迟或无限并发。',
          en: '"High performance" means useful output per token; it promises neither zero latency nor unlimited concurrency.',
        } satisfies Dict,
      },
      {
        text: {
          zh: '专家配专模要配对才划算：出厂四个 Agent 都指向 init 时选定的同一个模型，model 不继承也不回退 —— 想给某个专家换模型，得改它自己那一行。',
          en: 'Expert-models-only pays off when the pairing is right: all four factory agents point at the single model chosen at init, and model is never inherited or defaulted — to change one expert, edit its own line.',
        } satisfies Dict,
      },
      {
        text: {
          zh: '可观测性同样是完全的 —— 专家的思考与工具调用实时出现在界面上（带归属），也留在记录里。',
          en: 'Observability is equally complete: the expert’s reasoning and tool calls appear live in the interface (with attribution) and stay in the record.',
        } satisfies Dict,
      },
    ],
  },

  /** 硬规则 */
  rules: {
    eyebrow: { zh: 'Rules', en: 'Rules' } satisfies Dict,
    title: {
      zh: '多 Agent 运行时最容易出的问题，openheron 把它变成硬规则',
      en: 'The failure modes of multi-agent runtimes, turned into hard rules',
    } satisfies Dict,
    lead: {
      zh: '「谁还能干什么，说不清」是多 Agent 系统最常见的翻车方式。这几条是出厂就成立的约束。',
      en: 'Ambiguity about who may do what is the most common way multi-agent systems go wrong. These constraints hold from the factory configuration.',
    } satisfies Dict,
    items: [
      {
        name: { zh: '工具清单与审批档位，从不合并', en: 'Tool lists and approval levels are never merged' } satisfies Dict,
        desc: {
          zh: 'Agent 的 tools: 行点名它看得见哪些工具（不写就一个都没有），工具自己文件里的 allows: 行点名哪些不用问，其余一律先问。没有全局权限清单，两处也从不合并 —— 会话里那面盾牌只调「要不要点头」，不参与这份合并。',
          en: 'An agent’s tools: line names the tools it can see — omit it and it sees none. Each tool file’s allows: line names those that run without asking; everything else asks. There is no global permission list, and the two never merge — and the shield in a session only turns whether to ask; it plays no part in this merge.',
        } satisfies Dict,
      },
      {
        name: { zh: '委派有深度上限', en: 'Delegation has a depth cap' } satisfies Dict,
        desc: {
          zh: '入口 Agent 是第 0 层，深度 d 的 Agent 当且仅当 d < max_depth 才能再生子 Agent；拓扑超限启动期就报错，不静默截断。',
          en: 'The entry agent is level 0, and an agent at depth d may spawn children if and only if d < max_depth; a topology over the cap is a startup error, never a silent truncation.',
        } satisfies Dict,
      },
      {
        name: { zh: '一个会话能同时跑多个 Agent', en: 'One session can run several agents' } satisfies Dict,
        desc: {
          zh: '互不依赖的活并行分派；用量按 Agent 分账。',
          en: 'Independent work is dispatched in parallel; usage is accounted per agent.',
        } satisfies Dict,
      },
      {
        name: { zh: '配置是文件', en: 'Configuration is files' } satisfies Dict,
        desc: {
          zh: '模型档案、提示词、审批策略都是能读能改的文件：要 review 就 review，要提交进版本库就提交 —— 全放本地、只你自己看。',
          en: 'Model profiles, prompts and approval policy are files you can read and edit: review them, commit them — all local, visible only to you.',
        } satisfies Dict,
      },
      {
        name: { zh: '一个二进制，扔哪都能跑', en: 'One binary, runs anywhere' } satisfies Dict,
        desc: {
          zh: '前端嵌进单文件，跨平台静态编译，运行时没有额外依赖要一起装。',
          en: 'The frontend is embedded into a single file, compiled statically across platforms, with no extra runtime dependencies.',
        } satisfies Dict,
      },
    ],
  },

  /** 能力表 */
  capabilities: {
    eyebrow: { zh: 'Capabilities', en: 'Capabilities' } satisfies Dict,
    title: { zh: '核心能力', en: 'Core capabilities' } satisfies Dict,
    lead: {
      zh: '不是「一问一答」的聊天窗口，而是一个能被打断、能恢复、能被审批卡掐住的多轮运行时。',
      en: 'Not a one-question-one-answer chat window, but a multi-turn runtime that can be interrupted, resumed, and held up by approvals.',
    } satisfies Dict,
    items: [
      {
        name: { zh: '多轮持久会话', en: 'Multi-round persistent session' } satisfies Dict,
        desc: {
          zh: '每个会话一条常驻运行线，随时接着聊；历史落盘，关掉浏览器再打开还在。',
          en: 'Each session is a resident run line you can pick up at any time; history is persisted and survives closing the browser.',
        } satisfies Dict,
      },
      {
        name: { zh: '上下文压缩', en: 'Context compaction' } satisfies Dict,
        desc: {
          zh: '对话到 Agent 的阈值（默认窗口的 80%）自动压成摘要，也可以 /compact 立刻压。压的是上下文，记录仍然读得到。',
          en: 'The conversation is compacted into a summary at the agent’s threshold (80% of the window by default), or on demand with /compact. The context shrinks; the transcript stays readable.',
        } satisfies Dict,
      },
      {
        name: { zh: '一个会话一轮', en: 'One turn per session' } satisfies Dict,
        desc: {
          zh: '同一会话同时只跑一轮；另一个窗口再发会被拒（409 session_busy），正在跑的那轮不受影响 —— 停止它才能接管。',
          en: 'A session runs one turn at a time; a send from another window is refused (409 session_busy) without disturbing the running turn — stop it to take over.',
        } satisfies Dict,
      },
      {
        name: { zh: '中止', en: 'Abort' } satisfies Dict,
        desc: { zh: '立刻停掉当前这一轮。', en: 'Stop the current turn immediately.' } satisfies Dict,
      },
      {
        name: { zh: '人工审批（HITL）', en: 'Human in the loop' } satisfies Dict,
        desc: {
          zh: '写文件、执行命令等动作在执行前挂起，你批准后从 checkpoint 恢复。',
          en: 'Actions like writing files or running commands suspend before executing; once approved, the run resumes from a checkpoint.',
        } satisfies Dict,
      },
      {
        name: { zh: '会话授权模式', en: 'Session authorization mode' } satisfies Dict,
        desc: {
          zh: '输入框旁一面盾牌，三档可选：默认全问 / 受信路径（项目目录、上传目录、配置目录）里的写不问 / 完全授权什么都不问。它只决定「这次要不要点头」，不会给 Agent 变出新的工具。',
          en: 'A shield beside the composer, three levels: everything asks by default / writes inside the trusted paths (project, uploads, configuration) run unasked / full authorization asks for nothing. It only answers whether to ask — it never grants a new tool.',
        } satisfies Dict,
      },
      {
        name: { zh: '多 Agent 委派', en: 'Multi-agent delegation' } satisfies Dict,
        desc: {
          zh: '主 Agent 把活派给子 Agent（task 执行、agent-expert 域专家、skill-expert 技能专家），互不依赖的活并行跑，用量按 Agent 分账。',
          en: 'A parent agent hands work to sub agents — task executes, agent-expert handles a domain, skill-expert applies a skill — running independent jobs in parallel, with usage billed per agent.',
        } satisfies Dict,
      },
      {
        name: { zh: 'MCP 服务器', en: 'MCP servers' } satisfies Dict,
        desc: {
          zh: '在 mcps/ 里挂服务器，Agent 用 frontmatter 的 mcps: 键点名领用；服务器的工具以 mcp__github__create_issue 这样的名字出现在它面前。',
          en: 'Mount servers under mcps/ and let an agent claim them by name in its frontmatter mcps: key; their tools arrive as mcp__github__create_issue.',
        } satisfies Dict,
      },
      {
        name: { zh: '配置工具', en: 'Config tools' } satisfies Dict,
        desc: {
          zh: '六个工具让 Agent 读改自己跑在其中的那份配置：能查、能校验到出错的那一行、也能写 —— 写要点头。',
          en: 'Six tools let an agent read and rewrite the configuration it runs in: inspect it, validate a draft down to the offending line, or write it back — writes still need your nod.',
        } satisfies Dict,
      },
      {
        name: { zh: '知识库', en: 'Knowledge base' } satisfies Dict,
        desc: {
          zh: '把自己的语料建成索引，Agent 用 kb_search 检索并给出来源。',
          en: 'Index your own corpus; agents retrieve with kb_search and cite sources.',
        } satisfies Dict,
      },
      {
        name: { zh: '配置热更新', en: 'Hot configuration reload' } satisfies Dict,
        desc: {
          zh: '改 agents/ 或 mcps/ 保存即生效，不用重启；server/ 和 skills/ 要重启。',
          en: 'Edit agents/ or mcps/ and save — no restart needed. server/ and skills/ still require one.',
        } satisfies Dict,
      },
      {
        name: { zh: '图形化配置编辑器', en: 'Graphical config editor' } satisfies Dict,
        desc: {
          zh: '界面里直接编辑配置文件，写入前预检到具体行；明文密钥直接拒绝保存。',
          en: 'Edit configuration files in the interface; a draft is pre-checked down to the offending line, and literal secrets are refused outright.',
        } satisfies Dict,
      },
      {
        name: { zh: '发附件', en: 'Attachments' } satisfies Dict,
        desc: {
          zh: '回形针、拖拽、粘贴三个入口。图片直接进模型看得见；二进制会如实说处理不了，而不是假装读过。',
          en: 'Paperclip, drag or paste. Images reach the model as images it can see; binaries are told plainly they cannot be read, instead of pretending.',
        } satisfies Dict,
      },
      {
        name: { zh: '斜杠命令与技能', en: 'Slash commands and skills' } satisfies Dict,
        desc: {
          // 命令之间用空格而不是顿号：中文顿号不是断行机会，窄卡片里只能把命令从中间劈开。
          zh: '/new /stop /compact /review /fix /explain /test /attach /agents /mcps 开箱可用；技能可自建。',
          en: '/new, /stop, /compact, /review, /fix, /explain, /test, /attach, /agents and /mcps out of the box; skills are yours to define.',
        } satisfies Dict,
      },
    ],
  },

  /** 快速开始 */
  quickstart: {
    eyebrow: { zh: 'Quick start', en: 'Quick start' } satisfies Dict,
    title: { zh: '五分钟跑起来', en: 'Run it in five minutes' } satisfies Dict,
    lead: {
      zh: '构建、生成配置、给一个密钥，就能开始。',
      en: 'Build, generate a configuration, supply a key — and you are running.',
    } satisfies Dict,
    steps: [
      {
        title: { zh: '构建', en: 'Build' } satisfies Dict,
        desc: {
          zh: '前端 + 单文件二进制',
          en: 'Frontend plus a single binary with the UI embedded',
        } satisfies Dict,
        code: 'task build',
      },
      {
        title: { zh: '生成配置', en: 'Generate config' } satisfies Dict,
        desc: { zh: '在你的项目里写出最小可运行配置', en: 'Write a minimal runnable configuration in your project' } satisfies Dict,
        code: 'cd /your/project && openheron init',
      },
      {
        title: { zh: '给密钥', en: 'Supply a key' } satisfies Dict,
        desc: {
          zh: '环境变量，或者界面 Secrets 标签页里的钥匙串',
          en: 'The environment, or the keyring behind the Secrets tab',
        } satisfies Dict,
        code: 'export LLM_DEEPSEEK_API_KEY=sk-...',
      },
      {
        title: { zh: '启动', en: 'Start' } satisfies Dict,
        desc: { zh: '打开 http://localhost:8080', en: 'Open http://localhost:8080' } satisfies Dict,
        code: 'openheron',
      },
    ],
  },

  /** 出厂配置 */
  factory: {
    eyebrow: { zh: 'Multi-agent', en: 'Multi-agent' } satisfies Dict,
    title: { zh: '出厂就四个 Agent', en: 'Four agents from the start' } satisfies Dict,
    lead: {
      zh: 'openheron init 写下一棵完整配置树：一个入口 Agent 带三个执行专家。main 在 subagents: 里点名这三个，引用不存在的 Agent 或声明成环，都是启动期硬错误。',
      en: 'openheron init writes a full configuration tree: one entry agent with three execution experts. main names them in subagents:, and a missing reference or a cycle is a hard startup error.',
    } satisfies Dict,
    roles: [
      {
        role: 'main',
        job: { zh: '理解需求、给方案、按改什么分派、汇总；只拿委派与只读配置工具', en: 'Understands intent, proposes a plan, dispatches by what changes, summarises; holds delegation and read-only config tools only' } satisfies Dict,
        write: { zh: '否', en: 'No' } satisfies Dict,
      },
      {
        role: 'task',
        job: { zh: '通用执行：llm/ tools/ mcps/ server/，外加跨目录核验与排障', en: 'General execution: llm/, tools/, mcps/, server/, plus cross-directory checks and troubleshooting' } satisfies Dict,
        write: { zh: '能', en: 'Yes' } satisfies Dict,
      },
      {
        role: 'agent-expert',
        job: { zh: '只管 agents/*.md：frontmatter、模型引用、拓扑与三张清单', en: 'Owns agents/*.md only: frontmatter, model references, topology and the three lists' } satisfies Dict,
        write: { zh: '能', en: 'Yes' } satisfies Dict,
      },
      {
        role: 'skill-expert',
        job: { zh: '只管 skills/<name>/SKILL.md，并同步技能的允许清单', en: 'Owns skills/<name>/SKILL.md only, and keeps skill allow-lists in sync' } satisfies Dict,
        write: { zh: '能', en: 'Yes' } satisfies Dict,
      },
    ],
  },

  /** 手册入口 */
  manual: {
    eyebrow: { zh: 'Manual', en: 'Manual' } satisfies Dict,
    title: { zh: '完整使用手册', en: 'The full user manual' } satisfies Dict,
    lead: {
      zh: '十章，按需查阅。每一章都能直达小节。',
      en: 'Ten chapters, reference as needed. Every chapter links straight to its sections.',
    } satisfies Dict,
    more: { zh: '从第一次使用开始', en: 'Start with first run' } satisfies Dict,
  },
} as const;

/**
 * 桌面版说明页（站内精简版）。
 *
 * 正文按桌面版项目自己的用户手册（openheron-desktop/docs/USER-GUIDE.md）精简：
 * 只留「安装 + 第一次启动 + 托盘菜单 + 出问题了」四段。
 *
 * ★ 版本号、大小、sha256 **不在这里** —— 那些由构建时实测写进
 * public/downloads/desktop.json，页面读那份文件。
 * ★ 托盘菜单的行名**保持中文原样**：桌面版的界面本身就是中文的，
 * 英文版照实写，不翻成「看起来更整齐」的英文。
 */
export const desktopGuide = {
  eyebrow: { zh: '桌面版', en: 'Desktop' } satisfies Dict,

  title: {
    zh: '装上它，openheron 就住在托盘里',
    en: 'Install it and openheron lives in your tray',
  } satisfies Dict,

  lead: {
    zh: '桌面版是一个常驻系统托盘的启动器：它把 openheron 服务拉起来，开一个内嵌窗口给你看，顺便管更新。密钥、配置、项目——它一个字都不碰。',
    en: 'The desktop is a launcher that lives in the system tray: it starts the openheron service, opens an embedded window for you, and keeps the binary up to date. Keys, configuration and projects — it does not touch a single byte of them.',
  } satisfies Dict,

  scope: {
    zh: '本页是桌面版手册的**站内精简版**：安装、第一次启动、托盘菜单、出问题怎么办。更细的实现细节（更新流程、数据目录、配置文件）在桌面版项目源码的 USER-GUIDE.md 里。',
    en: 'This page is the **condensed site version** of the desktop manual: installing, the first launch, the tray menu, and what to do when something breaks. The finer details (the update flow, data directories, the configuration file) live in USER-GUIDE.md in the desktop project’s sources.',
  } satisfies Dict,

  /** 下载区 */
  download: {
    title: { zh: '下载', en: 'Download' } satisfies Dict,
    unsigned: {
      zh: '两个包都**未签名** —— Windows 可能弹 SmartScreen，核对上面那串 sha256 即可。',
      en: 'Neither package is **signed** — Windows may raise SmartScreen; check it against the sha256 above.',
    } satisfies Dict,
    absent: {
      zh: '这台机器上没有取到桌面版产物 —— 下载入口暂时不显示。',
      en: 'No desktop build was found on the machine that produced this page — the download entry is hidden for now.',
    } satisfies Dict,
  },

  /** 一、安装 */
  install: {
    title: { zh: '安装', en: 'Installation' } satisfies Dict,
    windows: {
      title: { zh: 'Windows：安装包', en: 'Windows: the installer' } satisfies Dict,
      steps: [
        {
          text: {
            zh: '下载本页上的 Windows 安装包。',
            en: 'Download the Windows installer from this page.',
          } satisfies Dict,
        },
        {
          text: {
            zh: '运行它。默认装到 `%LOCALAPPDATA%\\Programs\\openheron-desktop`（可改）；这是 **per-user 安装，不需要管理员权限**。',
            en: 'Run it. It installs into `%LOCALAPPDATA%\\Programs\\openheron-desktop` by default (changeable); it is a **per-user install, so no administrator rights are needed**.',
          } satisfies Dict,
        },
        {
          text: {
            zh: '安装包**自带一份校验过的 openheron**，放在 `%LOCALAPPDATA%\\openheron-desktop\\bin\\openheron.exe` —— 桌面版启动时找的就是这个位置。',
            en: 'The installer **carries a verified openheron of its own**, placed at `%LOCALAPPDATA%\\openheron-desktop\\bin\\openheron.exe` — that is exactly where the desktop looks for it on startup.',
          } satisfies Dict,
        },
        {
          text: {
            zh: '装完有一页可以勾三件事：「立刻启动」「读首次运行说明」「**打开官网上的手册**」。勾最后一个会**直接开浏览器**。',
            en: 'When it finishes, a page offers three checkboxes: "launch now", "read the first-run notes" and "**open the user manual online**". Ticking the last one **opens your browser straight away**.',
          } satisfies Dict,
        },
      ],
      notes: [
        {
          zh: '★ 安装包**未签名**：SmartScreen 可能拦一下，选「更多信息 → 仍要运行」；想更稳就核对上面那串 sha256。',
          en: '★ The installer is **unsigned**: SmartScreen may object once — choose "More info → Run anyway"; if you want to be sure, check it against the sha256 above.',
        } satisfies Dict,
        {
          zh: '★ 内嵌窗口需要 **WebView2 Runtime**（Win11 与较新的 Win10 一般自带）。缺了**不是故障** —— 窗口会自动退回复系统浏览器，功能一样在。',
          en: '★ The embedded window needs the **WebView2 Runtime** (Win11 and newer Win10 usually ship it). A missing one is **not a fault** — the window falls back to your system browser and everything still works.',
        } satisfies Dict,
      ],
    },
    linux: {
      title: { zh: 'Linux：AppImage', en: 'Linux: the AppImage' } satisfies Dict,
      steps: [
        {
          text: {
            zh: '下载本页上的 Linux AppImage。',
            en: 'Download the Linux AppImage from this page.',
          } satisfies Dict,
        },
        {
          text: {
            zh: '给它执行权限，然后直接跑：',
            en: 'Give it execute permission, then run it:',
          } satisfies Dict,
          code: 'chmod +x openheron-desktop-*-linux-amd64.AppImage\n./openheron-desktop-*-linux-amd64.AppImage',
        },
        {
          text: {
            zh: '**没有「安装」这一步** —— AppImage 是**自包含归档**，跑起来就在了。★ 第一次运行时它会把自带的 openheron 放进 `~/.config/openheron-desktop/bin/`，相当于替你做了一次安装；之后你用托盘「检查更新」换上的新版本**不会被它盖回去**。',
            en: 'There is **no "installation" step** — an AppImage is a **self-contained archive**, so running it is all it takes. ★ On the first run it puts **its own openheron** into `~/.config/openheron-desktop/bin/`, which is the install done for you; a newer version you install later through the tray’s "check for updates" is **never overwritten** by it.',
          } satisfies Dict,
        },
        {
          text: {
            zh: '想放到菜单里：文件管理器里右键 → 「允许作为程序执行」→ 再右键选「集成到桌面 / Add to Application Menu」。',
            en: 'Want it in your menu? In the file manager, right-click → "Allow to run as program" → then right-click again and choose "Integrate / Add to Application Menu".',
          } satisfies Dict,
        },
      ],
      notes: [
        {
          zh: '★ Linux 需要系统里有 **GTK 3 + WebKitGTK 4.1**（Debian/Ubuntu 上是 `libgtk-3-0` 与 `libwebkit2gtk-4.1-0`）—— 缺了**不是故障**：窗口会**自动退回复系统浏览器**，托盘和功能都照旧。',
          en: '★ Linux needs **GTK 3 + WebKitGTK 4.1** on the system (on Debian/Ubuntu: `libgtk-3-0` and `libwebkit2gtk-4.1-0`) — a missing one is **not a fault**: the window **falls back to your system browser**, and the tray and all features work as usual.',
        } satisfies Dict,
        {
          zh: '★ AppImage 靠 FUSE 把自己挂成文件系统；缺 FUSE 起不来（装 `fuse3` 或 `libfuse2` 即可），也可以用 `--appimage-extract-and-run` 跑起来 —— 慢一点，但不用装东西。',
          en: '★ The AppImage mounts itself as a filesystem through FUSE; without FUSE it will not start (install `fuse3` or `libfuse2`), or run it with `--appimage-extract-and-run` — slower, but nothing to install.',
        } satisfies Dict,
      ],
    },
  },

  /** 二、第一次启动 */
  firstRun: {
    title: { zh: '第一次启动', en: 'The first launch' } satisfies Dict,
    steps: [
      {
        text: {
          zh: '开始菜单 → **openheron desktop**。（Linux 上就是再跑一次那个 AppImage；集成到桌面的话，从菜单点也一样。）',
          en: 'Start menu → **openheron desktop**. (On Linux, run the AppImage again; if you integrated it, start it from the menu.)',
        } satisfies Dict,
      },
      {
        text: {
          zh: '托盘出现 openheron 标记图标。**鼠标悬停在图标上**会看到一行字：`openheron-desktop · 127.0.0.1:53214 · 运行中` —— ★ **地址只在这里出现一次**，窗口标题里没有地址栏，界面里也没有。',
          en: 'The openheron mark appears in the tray. **Hovering over the icon** shows one line: `openheron-desktop · 127.0.0.1:53214 · running` — ★ **the address appears here and nowhere else**: there is no address bar in the window title and none in the interface.',
        } satisfies Dict,
      },
      {
        text: {
          zh: '内嵌窗口自动打开，就是 openheron 的界面。',
          en: 'The embedded window opens on its own — that is the openheron interface.',
        } satisfies Dict,
      },
      {
        text: {
          zh: '如果这是第一次跑、你的大本营里还没有配置树，桌面版会**自动**执行一次 `openheron init` 建好 —— 你不用管。',
          en: 'If this is the first run and your home base has no configuration tree yet, the desktop **runs `openheron init` for you** — you do not have to.',
        } satisfies Dict,
      },
    ],
    notes: [
      {
        zh: '★ **再启动一次不会开第二个服务**：第二个实例会把第一个实例的界面**顶到你面前**，然后自己退出。',
        en: '★ **Starting it again does not open a second service**: the second instance **brings the first instance’s window to the front** and quits itself.',
      } satisfies Dict,
      {
        zh: '★ **密钥不在这里设**：桌面版**不读、不写、不检测、不提醒**密钥。请在 openheron 界面的 **Settings → Secrets** 标签页里设，或运行 `openheron secret set llm <provider>`。',
        en: '★ **Keys are not set here**: the desktop **does not read, write, detect or remind** about keys. Set them in the openheron interface’s **Settings → Secrets** tab, or run `openheron secret set llm <provider>`.',
      } satisfies Dict,
      {
        zh: '★ 端口每次启动都会**重新选一个空闲的**，所以数字会变 —— 当前地址看托盘的悬停提示。',
        en: '★ A free port is **re-picked on every start**, so the number changes — the current address is in the tray tooltip.',
      } satisfies Dict,
    ],
  },

  /** 三、托盘菜单 */
  tray: {
    title: { zh: '托盘菜单，逐行', en: 'The tray menu, line by line' } satisfies Dict,
    lead: {
      zh: '右键托盘图标，一共 **9 行**（8 个动作 + 1 个只读信息块）。★ 桌面版的界面本身是中文的，下面的行名**照原样写**。',
      en: 'Right-click the tray icon: **9 rows** in all (eight actions plus one read-only block). ★ The desktop interface is Chinese, so the row names below are given as they appear.',
    } satisfies Dict,
    columns: {
      item: { zh: '行', en: 'Item' } satisfies Dict,
      action: { zh: '干什么', en: 'What it does' } satisfies Dict,
      note: { zh: '注意', en: 'Note' } satisfies Dict,
    } satisfies Dict,
    rows: [
      {
        label: '打开界面',
        action: {
          zh: '打开内嵌窗口。',
          en: 'Opens the embedded window.',
        } satisfies Dict,
        note: {
          zh: '窗口已经开着就**把它顶到前面**，**绝不**开第二个。服务还没起来时这一行是**灰的**。',
          en: 'If the window is already open it **brings it to the front**, and **never** opens a second one. While the service is still starting this row is **greyed out**.',
        } satisfies Dict,
      },
      { separator: true },
      {
        label: '打开 openheron 大本营',
        action: {
          zh: '打开大本营目录。',
          en: 'Opens the home-base directory.',
        } satisfies Dict,
        note: {
          zh: '配置、会话、项目表、日志**都在它下面** —— 不知道东西在哪，从这里开始。',
          en: 'The configuration, sessions, project table and logs **all live under it** — if you do not know where your stuff is, start here.',
        } satisfies Dict,
      },
      {
        label: '打开配置目录',
        action: {
          zh: '打开 openheron 的配置根目录。',
          en: 'Opens openheron’s configuration root.',
        } satisfies Dict,
        note: {
          zh: '——',
          en: '—',
        } satisfies Dict,
      },
      {
        label: '打开默认项目目录',
        action: {
          zh: '打开「不属于任何项目的会话」的工作目录。',
          en: 'Opens the working directory of "sessions that belong to no project".',
        } satisfies Dict,
        note: {
          zh: '——',
          en: '—',
        } satisfies Dict,
      },
      {
        label: '打开日志',
        action: {
          zh: '打开桌面版自己的日志目录。',
          en: 'Opens the desktop’s own log directory.',
        } satisfies Dict,
        note: {
          zh: '——',
          en: '—',
        } satisfies Dict,
      },
      { separator: true },
      {
        label: '重启服务',
        action: {
          zh: '停掉服务再起来。',
          en: 'Stops the service and starts it again.',
        } satisfies Dict,
        note: {
          zh: '★ **会换一个端口**，窗口跟着重开 —— 因为窗口刚才显示的还是旧地址。',
          en: '★ **It picks a different port**, and the window reopens with it — the window was still showing the old address.',
        } satisfies Dict,
      },
      {
        label: '检查更新',
        action: {
          zh: '真的去问 GitHub 有没有新的 openheron。',
          en: 'Really asks GitHub whether a newer openheron exists.',
        } satisfies Dict,
        note: {
          zh: '这是**唯一**一条更新入口 —— 桌面版**不定时检查**，也**不在后台偷换版本**。',
          en: 'It is the **only** update entry point — the desktop **never polls** and **never swaps versions behind your back**.',
        } satisfies Dict,
      },
      {
        label: '版本信息 ▸',
        action: {
          zh: '一个**只读块**，三行灰字：desktop 版本 / openheron 版本 / 更新检查：…。',
          en: 'A **read-only block**, three grey lines: desktop version / openheron version / update check: …',
        } satisfies Dict,
        note: {
          zh: '★ 灰的 = **点不动**，不是坏了。',
          en: '★ Grey means **not clickable**, not broken.',
        } satisfies Dict,
      },
      { separator: true },
      {
        label: '退出',
        action: {
          zh: '停掉服务并退出。',
          en: 'Stops the service and quits.',
        } satisfies Dict,
        note: {
          zh: '服务进程会被一起带走。',
          en: 'The service process goes with it.',
        } satisfies Dict,
      },
    ],
  },

  /** 四、出问题了 */
  trouble: {
    title: { zh: '出问题了', en: 'When something goes wrong' } satisfies Dict,
    log: {
      title: { zh: '先看日志', en: 'Start with the log' } satisfies Dict,
      windows: {
        zh: 'Windows：%LOCALAPPDATA%\\openheron-desktop\\logs\\desktop.log',
        en: 'Windows: %LOCALAPPDATA%\\openheron-desktop\\logs\\desktop.log',
      } satisfies Dict,
      linux: {
        zh: 'Linux：~/.config/openheron-desktop/logs/desktop.log',
        en: 'Linux: ~/.config/openheron-desktop/logs/desktop.log',
      } satisfies Dict,
      note: {
        zh: '里面只有端口、参数和子进程的原始输出，**不会有密钥值**。（托盘菜单「打开日志」可以直接把它翻出来。）',
        en: 'It holds the port, the arguments and the raw output of the child processes, and **no key values**. (The tray’s "open the logs" item brings it up straight away.)',
      } satisfies Dict,
    },
    casesTitle: { zh: '常见情况', en: 'Common situations' } satisfies Dict,
    columns: {
      symptom: { zh: '你看到的', en: 'What you see' } satisfies Dict,
      cause: { zh: '原因', en: 'Why' } satisfies Dict,
      fix: { zh: '怎么办', en: 'What to do' } satisfies Dict,
    } satisfies Dict,
    cases: [
      {
        symptom: {
          zh: '界面没出来，但**浏览器弹了**',
          en: 'No interface, but **a browser opened**',
        } satisfies Dict,
        cause: {
          zh: '内嵌窗口起不来（多半是缺 WebView2 Runtime / WebKitGTK）',
          en: 'The embedded window could not start (usually a missing WebView2 Runtime / WebKitGTK)',
        } satisfies Dict,
        fix: {
          zh: '这是**降级路径，不是故障**。想用内嵌窗口就装 WebView2 Runtime；用浏览器完全一样。',
          en: 'This is the **fallback path, not a fault**. Install the WebView2 Runtime to get the embedded window; the browser does exactly the same.',
        } satisfies Dict,
      },
      {
        symptom: {
          zh: '**托盘图标不出现**（Linux）',
          en: '**The tray icon never appears** (Linux)',
        } satisfies Dict,
        cause: {
          zh: '你的桌面环境**没有托盘宿主**',
          en: 'Your desktop environment **has no tray host**',
        } satisfies Dict,
        fix: {
          zh: 'KDE Plasma 自带；**GNOME 默认不带** ⇒ 装个 AppIndicator 扩展（Debian/Ubuntu：`gnome-shell-extension-appindicator`）并启用。',
          en: 'KDE Plasma has one built in; **GNOME does not by default** ⇒ install the AppIndicator extension (on Debian/Ubuntu: `gnome-shell-extension-appindicator`) and enable it.',
        } satisfies Dict,
      },
      {
        symptom: {
          zh: '端口号变了',
          en: 'The port number changed',
        } satisfies Dict,
        cause: {
          zh: '每次启动都会**重新选一个空闲端口**',
          en: 'A **free port is re-picked on every start**',
        } satisfies Dict,
        fix: {
          zh: '正常。地址看托盘的悬停提示。',
          en: 'Normal. The address is in the tray tooltip.',
        } satisfies Dict,
      },
      {
        symptom: {
          zh: '窗口显示的还是旧地址',
          en: 'The window still shows the old address',
        } satisfies Dict,
        cause: {
          zh: '你刚点过「重启服务」，端口换了',
          en: 'You just clicked "restart the service", so the port changed',
        } satisfies Dict,
        fix: {
          zh: '窗口会自己重开；没重开就再点一次「打开界面」。',
          en: 'The window reopens by itself; if it does not, click "open the interface" once more.',
        } satisfies Dict,
      },
      {
        symptom: {
          zh: '启动时弹「这个 openheron 太旧了」',
          en: 'A dialog on startup saying "this openheron is too old"',
        } satisfies Dict,
        cause: {
          zh: '你的 openheron **不支持**新根模型（需要 `v0.3.0+`）',
          en: 'Your openheron **does not support** the new root model (needs `v0.3.0+`)',
        } satisfies Dict,
        fix: {
          zh: '★ 桌面版起不来，**托盘也用不了** ⇒ 手动更新：去 openheron 的 Releases 下载 `install.ps1`（Windows）或 `install.sh`（Linux）运行它，再回来启动桌面版。',
          en: '★ The desktop cannot start, so **the tray is unusable too** ⇒ update by hand: download `install.ps1` (Windows) or `install.sh` (Linux) from openheron’s releases, run it, then start the desktop again.',
        } satisfies Dict,
      },
      {
        symptom: {
          zh: '点「检查更新」没反应',
          en: 'Clicking "check for updates" does nothing',
        } satisfies Dict,
        cause: {
          zh: '——',
          en: '—',
        } satisfies Dict,
        fix: {
          zh: '★ 现在**每次点都有回话**（对话框 + 菜单里那一行 + 日志）。若真的一点反应都没有，**日志里也不会有任何记录** —— 这种情况请提 issue。',
          en: '★ Every click **answers back now** (a box + a line in the menu + the log). If there is genuinely no reaction, **the log has no record either** — please file an issue.',
        } satisfies Dict,
      },
      {
        symptom: {
          zh: '**找不到手册**',
          en: '**You cannot find the manual**',
        } satisfies Dict,
        cause: {
          zh: '手册**不再随安装包分发**了',
          en: 'The manual is **no longer shipped with the installer**',
        } satisfies Dict,
        fix: {
          zh: '它在**官网上** —— 就是这一页。Windows：程序目录的 `FIRST-RUN.txt` 里写着地址；Linux：菜单项的说明里写着地址。',
          en: 'It is on the **website** — this very page. On Windows the address is in the program’s `FIRST-RUN.txt`; on Linux it is in the description of the menu entry.',
        } satisfies Dict,
      },
    ],
    recovery: {
      zh: '绝大多数状态**点一次「重启服务」**就能恢复。还是不行就**退出**再启动；再不行就看日志。',
      en: 'Almost every broken state **is fixed by clicking "restart the service" once**. If that does not do it, **quit and start again**; if that does not do it either, read the log.',
    } satisfies Dict,
  },

  /** 结尾 */
  keys: {
    title: { zh: '密钥在哪设', en: 'Where the keys go' } satisfies Dict,
    text: {
      zh: '桌面版**一个字都不碰**：不读、不写、不检测、不提醒。密钥在 openheron 界面的 **Settings → Secrets** 标签页里设，或者跑 `openheron secret set llm <provider>`；环境变量也可以。',
      en: 'The desktop **does not touch a single byte**: it does not read, write, detect or remind. Set keys in the openheron interface’s **Settings → Secrets** tab, run `openheron secret set llm <provider>`, or use the environment.',
    } satisfies Dict,
  },
  more: {
    title: { zh: 'openheron 本身怎么用', en: 'How openheron itself works' } satisfies Dict,
    text: {
      zh: '界面、配置、多 Agent 委派、命令行速查 —— 都在用户手册里。',
      en: 'The interface, configuration, multi-agent delegation and the command-line reference — all in the user manual.',
    } satisfies Dict,
  },
} as const;

/** 手册章节页 */
export const manualPage = {
  backHome: { zh: '返回首页', en: 'Back to home' } satisfies Dict,
  backToStart: { zh: '快速开始', en: 'Quick start' } satisfies Dict,
  chapters: { zh: '章', en: 'Chapter' } satisfies Dict,
  sections: { zh: '本章小节', en: 'Sections' } satisfies Dict,
  toc: { zh: '目录', en: 'Contents' } satisfies Dict,
  prev: { zh: '上一章', en: 'Previous' } satisfies Dict,
  next: { zh: '下一章', en: 'Next' } satisfies Dict,
} as const;

export const footer = {
  tagline: {
    zh: '跑在本地、配置是文件的多 Agent 运行时。',
    en: 'A multi-agent runtime that runs locally, configured by files.',
  } satisfies Dict,
  motto: {
    zh: '「长久静立，瞬间精准出手。」',
    en: '"Standing still for a long time, striking with precision in an instant."',
  } satisfies Dict,
  manualGroup: { zh: '手册', en: 'Manual' } satisfies Dict,
  referenceGroup: { zh: '查阅', en: 'Reference' } satisfies Dict,
} as const;

/** 侧边栏与提示 */
export const ui = {
  approve: { zh: '同意', en: 'Approve' } satisfies Dict,
  reject: { zh: '拒绝', en: 'Reject' } satisfies Dict,
  reason: { zh: '理由', en: 'Reason' } satisfies Dict,
  reasonHint: {
    zh: '拒绝时写一句理由会回灌给模型（可不填）',
    en: 'On rejection, a reason is sent back to the model (optional)',
  } satisfies Dict,
  hint: { zh: '下面是审批卡的真实形态，可以直接点。', en: 'This is the real approval card — go ahead and click it.' } satisfies Dict,
  detail: { zh: '审批模型细节 →', en: 'Approval model details →' } satisfies Dict,
} as const;
