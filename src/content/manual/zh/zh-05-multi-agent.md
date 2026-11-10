---
title: "多 Agent 与委派"
chapter: "5"
order: 5
chapterSlug: "multi-agent"
lang: "zh"
kind: "manual-chapter"
sourceFile: "user-manual_zh.md"
---

## 5.1 谁能委派给谁

在 Agent 的 frontmatter 里声明：

```markdown
---
model: deepseek/deepseek-flash
subagents: [task]
---
```

这表示「这个 Agent 可以把活派给 `task`」。

★ **引用不存在的 Agent、或者声明成环，都是启动错误**，不会被静默截断。

## 5.2 深度上限

深度上限就是 `server/config.yaml` 里的 `agent.max_depth`。默认 `1`，意思是「只有入口
Agent 能委派，子 Agent 不能再生子」。

想跑更深的委派链：

```yaml
# .openheron/server/config.yaml
agent:
  max_depth: 3
```

★ 声明的拓扑超过上限是**启动错误**，不是「截断到上限然后继续跑」。
后者会让深度保护形同虚设。

★ **`server/` 不热重载**（§4.5）—— 上限调深要重启才生效。

## 5.3 一次会话能同时跑多个 Agent

互不依赖的活可以并行分派。用量**按 Agent 分账**（`/v2/sessions/{id}/messages` 的
`usage.byAgent`），谁花了多少一目了然。

在界面上：
- **会话列表**左边的 Agent 徽标可以按 Agent 过滤历史。
- 消息里的子 Agent 产出带**归属标记**，能看到是谁做的。
