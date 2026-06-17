---
name: di-style-lombok-constructor
description: User's preferred dependency-injection style in the promid Spring backend
metadata:
  type: feedback
---

For Spring constructor injection, the user prefers `@RequiredArgsConstructor` (Lombok) + `private final` fields over hand-written constructors.

**Why:** Less boilerplate; idiomatic Spring+Lombok. (Note: only useful when the class actually has final fields to inject — a class with no dependencies should NOT carry @RequiredArgsConstructor.)

**How to apply:** When guiding/writing backend beans (@Service/@Component) that need dependencies, use `@RequiredArgsConstructor` and declare deps as `private final`. See [[promid-collaboration-model]], [[promid-progress]].
