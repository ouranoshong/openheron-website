---
title: "Multiple agents and delegation"
chapter: "5"
order: 5
chapterSlug: "multi-agent"
lang: "en"
kind: "manual-chapter"
sourceFile: "user-manual.md"
---

## 5.1 Who may delegate to whom

Declare it in the agent's frontmatter:

```markdown
---
model: deepseek/deepseek-flash
subagents: [task]
---
```

This means "this agent may hand work to `task`".

★ **Referencing an unknown agent, or declaring a cycle, is a startup error** — never a
silent truncation.

## 5.2 The depth cap

The cap is decided by `agent.max_depth` in `server/config.yaml` together with the same
key in `policy/limits.yaml`, and **the stricter one wins**. The default `1` means "only
the entry agent may delegate; a sub-agent may not spawn children".

For a deeper delegation chain:

```yaml
# policy/limits.yaml
agent:
  max_depth: 3
```

★ A declared topology that exceeds the cap is a **startup error**, not "truncate to the
cap and carry on". The latter would make the depth protection meaningless.

## 5.3 Several agents in one session

Independent work can be dispatched in parallel. Usage is **accounted per agent**
(`usage.byAgent` in `/v2/sessions/{id}/messages`), so it is obvious who spent what.

In the interface:
- The **agent badges** in the session list filter the history by agent.
- A sub-agent's output in a message carries an **attribution marker**, so you can see
  who produced it.
