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
          zh: '专家配专模要配对才划算：出厂配置里两个 Agent 共用一个模型，配错模型比不配更浪费。',
          en: 'Expert-models-only pays off when the pairing is right: the factory configuration has two agents sharing one model. A wrong model pairing wastes more than no pairing.',
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
        name: { zh: '工具权限分两层，永不合并', en: 'Tool permissions have two layers and are never merged' } satisfies Dict,
        desc: {
          zh: '外层 policy/permissions.yaml 定全局 ask / deny，内层每个 Agent 用自己的 disabled_tools 收窄。外层的 deny 对所有 Agent 生效，子 Agent 放松不了它。',
          en: 'The outer policy/permissions.yaml sets the global ask/deny, and each inner agent narrows it with its own disabled_tools. The outer deny beats the inner one, and a sub agent cannot relax it.',
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
        name: { zh: '多 Agent 委派', en: 'Multi-agent delegation' } satisfies Dict,
        desc: {
          zh: '一个主 Agent 把活分给子 Agent（只读检索 / 改代码 / 审阅），可并行。',
          en: 'A parent agent splits work among sub agents (read-only retrieval / coding / review), in parallel where independent.',
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
          zh: '改 llm/ agents/ policy/ 保存即生效，不用重启。',
          en: 'Edit llm/, agents/, policy/ and save — it takes effect without a restart.',
        } satisfies Dict,
      },
      {
        name: { zh: '图形化配置编辑器', en: 'Graphical config editor' } satisfies Dict,
        desc: {
          zh: '界面里直接编辑配置文件，写入前自动校验。',
          en: 'Edit configuration files in the interface, validated before writing.',
        } satisfies Dict,
      },
      {
        name: { zh: '斜杠命令与技能', en: 'Slash commands and skills' } satisfies Dict,
        desc: {
          zh: '/review、/explain、/fix 等开箱可用；技能可自建。',
          en: '/review, /explain, /fix and more out of the box; skills are yours to define.',
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
        code: 'make build',
      },
      {
        title: { zh: '生成配置', en: 'Generate config' } satisfies Dict,
        desc: { zh: '在你的项目里写出最小可运行配置', en: 'Write a minimal runnable configuration in your project' } satisfies Dict,
        code: 'cd /your/project && openheron init',
      },
      {
        title: { zh: '给密钥', en: 'Supply a key' } satisfies Dict,
        desc: { zh: '密钥只从环境变量读', en: 'Secrets are read from the environment only' } satisfies Dict,
        code: 'export DEEPSEEK_API_KEY=sk-...',
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
    title: { zh: '出厂就两个 Agent', en: 'Two agents from the start' } satisfies Dict,
    lead: {
      zh: 'openheron init 写出 main 与 task 两个 Agent —— main 的 subagents: [task] 引用 task，少一个就是启动期硬错误，所以总是两个一起写。',
      en: 'openheron init writes the main and task agents — main references task via subagents: [task], and a missing one is a hard startup error, so they are always written together.',
    } satisfies Dict,
    roles: [
      {
        role: 'main',
        job: { zh: '只做决策与委派，不自己写文件', en: 'Only decides and delegates, never writes files itself' } satisfies Dict,
        write: { zh: '否', en: 'No' } satisfies Dict,
      },
      {
        role: 'task',
        job: { zh: '按任务单执行', en: 'Executes against the task order' } satisfies Dict,
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
    more: { zh: '查看全部十章', en: 'Browse all ten chapters' } satisfies Dict,
  },
} as const;

/** 手册索引页 */
export const manualPage = {
  eyebrow: { zh: 'User manual', en: 'User manual' } satisfies Dict,
  title: { zh: 'openheron 用户手册', en: 'openheron user manual' } satisfies Dict,
  lead: {
    zh: '面向使用者：怎么装、怎么配、怎么用。内部设计与取舍不在这里 —— 本手册描述的行为以仓库当前代码为准。',
    en: 'Written for users: how to install, configure and use. Internal design and trade-offs are not here — the behaviour described follows the code as it stands.',
  } satisfies Dict,
  note: {
    zh: '手册原文按章拆开，每章一页。左边目录列出全部小节，滚动时会跟着高亮当前小节。',
    en: 'The manual is split by chapter, one chapter per page. The sidebar lists every section and highlights the current one as you scroll.',
  } satisfies Dict,
  backToManual: { zh: '用户手册', en: 'User manual' } satisfies Dict,
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
