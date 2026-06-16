---
name: workflow-wait-for-go
description: User wants answers-only, then wait for explicit go-ahead before next step
metadata:
  type: feedback
---

When the user asks a question mid-task, answer ONLY that question and do not auto-advance to the next step. Prepare/stage the next step internally but wait until the user explicitly says to proceed.

**Why:** The user is the backend implementer and wants to drive pacing; I'm the guide. Jumping ahead removes their control.

**How to apply:** Reply to the question, then state that the next step is ready and wait. Don't start the next task card or write code until told. See [[promid-collaboration-model]].
