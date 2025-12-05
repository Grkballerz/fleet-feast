# CLAUDE.md

**Note**: This project uses [bd (beads)](https://github.com/steveyegge/beads)
for issue tracking. Use `bd` commands instead of markdown TODOs.
See AGENTS.md for workflow details.

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MASTER WIZARD is a multi-agent automated workflow system that orchestrates 21 specialized AI agents through a complete software development lifecycle. The system transforms PRD/GDD/ERP documents into production-ready applications with minimal user intervention.

## Quick Start

```bash
# Step 1: Generate requirements document
/MASTER_Requirements

# Step 2: Generate task list from PRD
/MASTER_Task_Generator

# Step 3: Execute the workflow
/MASTER_Orchestrator
```

## Commands

| Command | Phase | Purpose |
|---------|-------|---------|
| `/MASTER_Requirements` | 1 | Create PRD/ERP/GDD from user input |
| `/MASTER_Task_Generator` | 2 | Generate tasks from MASTER_PRD.md |
| `/MASTER_Orchestrator` | 3 | Execute multi-agent workflow |

Commands are located in: `.claude/commands/`

## Architecture

### Three-Phase Workflow

1. **Phase 1 - Requirements**: User provides project idea → system asks clarifying questions → generates `MASTER_PRD.md`
2. **Phase 2 - Task Generation**: Reads PRD → matches tasks to agents → creates task list with dependencies
3. **Phase 3 - Implementation**: Multi-agent execution with hot/cold task management

### Task System (Hot/Cold Storage)

| Location | Purpose | Status |
|----------|---------|--------|
| `context/tasks/hot/` | Active tasks (max 10) | `[~]` in-progress |
| `context/tasks/cold/` | Pending + completed | `[ ]` pending, `[x]` done |
| `context/tasks/briefings/` | Dynamic briefings (created at dispatch) | Active |
| `context/tasks/briefings/archive/` | Completed briefings | Historical |

**Task Statuses**: `[ ]` pending → `[~]` in-progress → `[x]` done | `[!]` blocked

**Briefing Creation**: Briefings are created by the Orchestrator at dispatch time (not by Task Generator), ensuring they include:
- Latest dependency outputs from Message Board
- Current project state
- Relevant context from completed tasks

### Agent File Structure

```
.claude/agents/                    # 21 agent definitions
├── Blake_Backend.md               # Agent definition + 9-step workflow
└── ... (all 21 agents)

.claude/skills/                    # Nested by agent name
├── Blake_Backend/
│   ├── Blake_Backend.md           # Full capabilities, workflow steps, examples
│   ├── Blake_Backend_MEMORY.md    # Hot memory (recent, max ~50 entries)
│   └── Blake_Backend_MEMORY_ARCHIVE.md  # Cold archive (historical)
├── Alex_Architect/
│   ├── Alex_Architect.md
│   ├── Alex_Architect_MEMORY.md
│   └── Alex_Architect_MEMORY_ARCHIVE.md
├── ... (21 agent folders, each with 3 files)
└── Frontend_Assets.md             # Shared frontend tools (fal.ai, SVGmaker, 21st.dev)
```

### 9 Agent Domains (21 Agents)

| Domain | Agents | Focus |
|--------|--------|-------|
| Architecture | Alex_Architect, Petra_Patterns | System design, patterns |
| Backend | Blake_Backend, Dana_Database, Ellis_Endpoints | APIs, data, endpoints |
| Frontend | Casey_Components, Sam_Styler, Parker_Pages | UI, styling, pages |
| Fullstack | Jordan_Junction, Morgan_Middleware | Integration, middleware |
| Quality | Quinn_QA, Taylor_Tester, Riley_Reviewer | Testing, reviews |
| Infrastructure | Devon_DevOps, Cameron_CICD | DevOps, pipelines |
| Security | Sage_Security, Avery_Audit | Security audits |
| Optimization | Peyton_Performance, Logan_Load | Performance, load testing |
| Documentation | Drew_Docs, Kendall_Knowledge | Docs, knowledge base |

### Context Files

| File | Purpose |
|------|---------|
| `context/MASTER_PRD.md` | Source of truth for requirements |
| `context/MASTER_Task_Summary.md` | Task overview and progress |
| `context/MASTER_Gap_Analysis.md` | Active gaps to address |
| `context/MASTER_Gap_Archive.md` | Resolved gaps |
| `context/MASTER_Message_Board.md` | Inter-agent communication (hot) |
| `context/MASTER_Message_Archive.md` | Historical messages |
| `context/MASTER_Component_Registry.md` | UI component tracking |

### Registry Files

| File | Updated By |
|------|------------|
| `docs/API_Registry.md` | Backend agents |
| `docs/Schema_Registry.md` | Dana_Database |
| `docs/Util_Registry.md` | All agents |

## Orchestrator Workflow

```
1. Scan cold/ → find [ ] tasks, sort by priority
2. Check dependencies → verify required tasks are [x]
3. Check file conflicts → no [~] task touches same files
4. Move to hot/ → max 10 active tasks
5. CREATE briefing → build fresh with dependency outputs + message board context
6. Match agent → read ## Assigned from task
7. Dispatch → set [~], send briefing to agent
8. Monitor → watch for completion or failure
9. On complete → task to cold/ [x], briefing to archive/
10. On failure → retry 2x → alert human [!]
```

## Subagent Workflow

```
0. Load own SKILL.md
1. Load briefing (full context baked in)
2. Read own MEMORY.md (hot memory)
3. Execute work (Playwright MCP for visual feedback)
4. Validation check (tests, verification)
5. Update registries if applicable
6. Post to Message Board
7. Update Memory (Hot/Cold):
   - If MEMORY.md > 50 entries → archive oldest to MEMORY_ARCHIVE.md
   - Append new entry with timestamp to MEMORY.md
8. Handoff signal
```

## Gap Checkpoints

| # | When | What's Checked |
|---|------|----------------|
| 1 | After PRD creation | PRD completeness |
| 2 | After task generation | All features have tasks |
| 3 | During implementation | Implementation matches PRD |
| 4 | End of each phase | Phase deliverables vs PRD |

## Tools Available

| Tool | Available To | Purpose |
|------|--------------|---------|
| Playwright MCP | All agents | Visual feedback, E2E testing |
| fal.ai MCP | Frontend agents | AI image generation |
| SVGmaker.io | Frontend agents | SVG generation |
| 21st.dev / Componentor | Frontend agents | UI component library |

## Core Principles

1. **Source Document Sacred**: MASTER_PRD.md is the single source of truth
2. **Autonomous Execution**: Agents decide; only critical blockers escalate
3. **File-Based State**: All state persists in files; pause/resume anytime
4. **Gap Vigilance**: Continuous checking at 4 checkpoints
5. **Auto-Commit**: Git commit after each task ("Task_X.X: [title] ✓")

## Folder Structure

```
.claude/
├── commands/
│   ├── MASTER_Requirements.md
│   ├── MASTER_Task_Generator.md
│   └── MASTER_Orchestrator.md
├── agents/                        # 21 agent definitions
│   ├── Alex_Architect.md
│   ├── Blake_Backend.md
│   └── ... (all 21 agents)
├── skills/                        # Nested by agent name
│   ├── Alex_Architect/
│   │   ├── Alex_Architect.md      # Skill capabilities
│   │   ├── Alex_Architect_MEMORY.md        # Hot memory
│   │   └── Alex_Architect_MEMORY_ARCHIVE.md # Cold archive
│   ├── Blake_Backend/
│   │   ├── Blake_Backend.md
│   │   ├── Blake_Backend_MEMORY.md
│   │   └── Blake_Backend_MEMORY_ARCHIVE.md
│   ├── ... (21 agent folders, each with 3 files)
│   └── Frontend_Assets.md         # Shared: fal.ai, SVGmaker, 21st.dev
├── context/
│   ├── MASTER_PRD.md
│   ├── MASTER_Task_Summary.md
│   ├── MASTER_Gap_Analysis.md
│   ├── MASTER_Gap_Archive.md
│   ├── MASTER_Message_Board.md
│   ├── MASTER_Message_Archive.md
│   ├── MASTER_Component_Registry.md
│   └── tasks/
│       ├── hot/
│       ├── cold/
│       └── briefings/
│           └── archive/
└── docs/
    ├── API_Registry.md
    ├── Schema_Registry.md
    └── Util_Registry.md
```

## Error Handling

1. **Retry**: Same agent retries up to 2 times
2. **Log**: Failure logged to Message Board
3. **Alert**: Human intervention flagged with `[!]`

## Context Overflow

Large tasks are automatically split:
- Task_2.1 → Task_2.1a, Task_2.1b, Task_2.1c
- User notified of split
- Subtasks added with dependencies
