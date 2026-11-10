---
title: "HTTP 接口速查"
chapter: "9"
order: 9
chapterSlug: "http-api"
lang: "zh"
kind: "manual-chapter"
sourceFile: "user-manual_zh.md"
---

服务只暴露 `/v2` 接口族。没有认证、没有 CORS；默认 `:8080` 会绑全部网卡，
要在公网暴露请自己套反向代理，或把 `listen_addr` 收到 `127.0.0.1`。

| 方法 | 路径 | 作用 |
|---|---|---|
| POST | `/v2/sessions` | 建会话，返回 `threadId` |
| GET | `/v2/sessions` | 列会话 |
| GET | `/v2/sessions/:id` | 会话详情 |
| PATCH | `/v2/sessions/:id` | 改标题 |
| PATCH | `/v2/sessions/:id/agent` | 换会话的 Agent |
| DELETE | `/v2/sessions/:id` | 删会话 |
| GET | `/v2/sessions/:id/messages` | 历史 + 用量（可 `?agent=` 过滤） |
| GET | `/v2/sessions/:id/runs` | run 账本：这个会话的每一次 run，以及当前那一次 |
| GET | `/v2/sessions/:id/runs/:runId` | 这个会话的某一次 run |
| POST | `/v2/sessions/:id/abort` | 中断在跑的这轮 |
| POST | `/v2/sessions/:id/compact` | 立刻压缩当前对话（见 §6.6） |
| POST/GET | `/v2/sessions/:id/files` | 上传 / 列会话工作区文件（单文件上限 32 MiB） |
| GET | `/v2/project/files` | 列项目根文件（`?q=` `?limit=`） |
| GET | `/v2/commands` | 斜杠命令清单 |
| POST | `/v2/run` | **SSE 入口**：提问，或回复审批（见 §6.7） |
| GET | `/v2/skills` | 技能清单 |
| GET | `/v2/agents` `/v2/agents/:agentId` | Agent 及其生效工具表 |
| GET | `/v2/mcps` | 某个 Agent 的 MCP 服务器（`?agent=`）；见 §6.8 |
| GET | `/v2/config` | 生效配置（其中的 `policy` 字段带着缺省档位与那些不用问的工具名） |
| GET | `/v2/health` | 健康检查（含 `deferred` 告警） |
| GET | `/v2/runtime` | 运行时状态 |
| GET | `/v2/settings` | 可编辑项清单 |
| GET/POST/PUT/DELETE | `/v2/settings/item` | 配置读写（带 `baseRevision`） |
| POST | `/v2/settings/validate` | 不落盘地校验一份配置 |

## 9.1 跑一轮

```bash
# 1. Create a session
curl -s -X POST localhost:8080/v2/sessions \
  -H 'content-type: application/json' -d '{"agentId":"main"}'
# → {"threadId":"...","state":"idle",...}

# 2. Ask (SSE stream)
curl -N -X POST localhost:8080/v2/run \
  -H 'content-type: application/json' \
  -d '{"threadId":"<the id from step 1>","query":"read the README"}'
```

★ **`threadId` 必填**。不传会得到
`threadId is required; create the session with POST /v2/sessions first`。

★ **一个会话同时只跑一轮。** 对已经在跑的会话再发一个请求，会得到 `409`，错误码是
`session_busy` —— 正在跑的那一轮不受影响（见 §6.7）。

响应是 **AG-UI 事件流**，事件类型：`RUN_STARTED`、`TEXT_MESSAGE_*`、`REASONING_*`、
`TOOL_CALL_*`、`CUSTOM`（`model_retry`）、`RUN_FINISHED`、`RUN_ERROR`。
子 Agent 的产出靠事件上的 `subagentRunId` 归属。

## 9.2 回审批

审批的决定塞回**同一个** `/v2/run`：

```json
{
  "threadId": "...",
  "resume": [
    {"interruptId": "...", "payload": {"approved": true}},
    {"interruptId": "...", "payload": {"approved": false, "reason": "do not touch that file"}}
  ]
}
```
