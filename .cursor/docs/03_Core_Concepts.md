# APM Glossary of Core Concepts & Terms

This document provides concise definitions for the key terms used within the Agentic Project Management (APM) framework. Use this as a quick reference and navigate to the linked documents for more detailed explanations, guides, or format specifications.

---

**Agent Handover / Handover Protocol**

The defined procedure for transferring project context and responsibilities between AI agent instances (e.g., Manager to new Manager, or between Specialized Agents). It utilizes a `Handover_File.md` and `Handover_Prompt.md` to ensure project continuity, especially when dealing with LLM context limits.

- _See procedure:_ `prompts/01_Manager_Agent_Core_Guides/05_Handover_Protocol_Guide.md`
- _See artifact formats:_ `prompts/02_Utility_Prompts_And_Format_Definitions/Handover_Artifact_Formats.md`
- _See practical steps:_ `docs/02_Getting_Started.md` (Step 6)
- _See visual overview:_ `docs/01_Workflow_Overview.md` (Handover Protocol Flow)

**APM (Agentic Project Management)**

The overall framework, consisting of prompts, format definitions, protocols, and best practices, designed to structure complex project execution using multiple collaborating AI assistants.

- _See overview:_ `docs/00_Introduction.md`

**Core APM Cycle**

The main iterative loop of activity in an APM project: Manager prepares prompt -> User delivers -> Implementer executes -> Implementer reports -> User confirms log -> Implementer logs -> User informs Manager -> Manager reviews -> Repeat.

- _See visual overview:_ `docs/01_Workflow_Overview.md` (Core APM Cycle)
- _See practical steps:_ `docs/02_Getting_Started.md` (Step 5)

**Handover File (`Handover_File.md`)**

A structured Markdown document created during the Handover Protocol. It serves as a comprehensive context dump, containing the current project state, plan status, recent logs, decisions, and other critical information needed by the incoming agent.

- _See format definition:_ `prompts/02_Utility_Prompts_And_Format_Definitions/Handover_Artifact_Formats.md` (Section 2)
- _See procedure context:_ `prompts/01_Manager_Agent_Core_Guides/05_Handover_Protocol_Guide.md` (Section 3.1)

**Handover Prompt (`Handover_Prompt.md`)**

A Markdown prompt used to initialize a new agent instance during a handover. It includes standard APM onboarding information (if applicable), instructions to process the `Handover_File.md`, and specifies the immediate next steps for the incoming agent.

- _See format definition:_ `prompts/02_Utility_Prompts_And_Format_Definitions/Handover_Artifact_Formats.md` (Section 3)
- _See procedure context:_ `prompts/01_Manager_Agent_Core_Guides/05_Handover_Protocol_Guide.md` (Section 3.2)

**Implementation Agent**

An AI agent instance responsible for executing specific, assigned tasks based on the `Implementation_Plan.md` and instructions provided in a `Task Assignment Prompt`. They report status back to the User and log their work to the `Memory_Bank.md` upon User confirmation.

- _See onboarding prompt:_ `prompts/02_Utility_Prompts_And_Format_Definitions/Implementation_Agent_Onboarding.md`
- _See role in workflow:_ `docs/01_Workflow_Overview.md`

**Implementation Plan (`Implementation_Plan.md`)**

A detailed, structured Markdown document created by the Manager Agent (after User approval of the structure). It breaks down the project into phases (optional), tasks, and granular sub-tasks, assigning responsibility to specific Implementation Agents. It serves as the blueprint for project execution.

- _See formatting guide:_ `prompts/01_Manager_Agent_Core_Guides/01_Implementation_Plan_Guide.md`
- _See creation process:_ `docs/02_Getting_Started.md` (Step 4)

**Manager Agent**

The central AI agent instance responsible for overall project coordination. Its duties include understanding requirements, creating the Implementation Plan, assisting the User with Task Assignment Prompts, reviewing work logged in the Memory Bank, and managing the Handover Protocol.

- _See initiation prompt:_ `prompts/00_Initial_Manager_Setup/01_Initiation_Prompt.md`
- _See core guides:_ `prompts/01_Manager_Agent_Core_Guides/`
- _See role in workflow:_ `docs/01_Workflow_Overview.md`

**Memory Bank (`Memory_Bank.md`)**

One or more designated Markdown files acting as the project's persistent, chronological logbook. Implementation and Specialized Agents record their actions, outputs, results, and issues here in a standardized format after User confirmation. It provides shared context and an audit trail.

- _See system setup guide:_ `prompts/01_Manager_Agent_Core_Guides/02_Memory_Bank_Guide.md`
- _See log entry format definition:_ `prompts/02_Utility_Prompts_And_Format_Definitions/Memory_Bank_Log_Format.md`
- _See conceptual overview:_ `docs/01_Workflow_Overview.md` (Memory Bank Concept)
- _See setup in practice:_ `docs/02_Getting_Started.md` (Step 4)

**Specialized Agent**

An AI agent instance assigned to perform specific, specialized functions beyond standard implementation, such as debugging code (`Debugger Agent`), explaining concepts (`Tutor Agent`), or performing detailed reviews (`Reviewer Agent`). They follow similar interaction patterns as Implementation Agents (task assignment via User, logging to Memory Bank).

- _See onboarding prompt (shared):_ `prompts/02_Utility_Prompts_And_Format_Definitions/Implementation_Agent_Onboarding.md`

**Task Assignment Prompt**

A prompt, typically drafted by the Manager Agent and delivered by the User, used to assign a specific task from the `Implementation_Plan.md` to an Implementation or Specialized Agent. It includes the task objective, detailed steps, necessary context, expected outputs, and mandatory logging instructions.

- _See crafting guide:_ `prompts/01_Manager_Agent_Core_Guides/03_Task_Assignment_Prompts_Guide.md`
- _See usage in workflow:_ `docs/02_Getting_Started.md` (Step 5)

**User**

The human project principal. The User defines the project goals, acts as the crucial communication bridge between all AI agents, makes key decisions (e.g., plan approval, logging confirmation), reviews progress, and provides overall supervision.

- _See role in workflow diagrams:_ `docs/01_Workflow_Overview.md`
