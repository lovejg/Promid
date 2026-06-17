---
name: dev-environment
description: How the dev machine/IDE is set up for promid (WSL + Windows IntelliJ) and the SDK gotcha
metadata:
  type: reference
---

- OS: Windows running IntelliJ IDEA 2026.1; project lives in WSL (Ubuntu 24.04) at `/home/tmakdrl/promid`. IntelliJ opens the WSL folder over `\\wsl$`. Claude Code runs in IntelliJ's integrated terminal (cwd `/home/tmakdrl/promid`) — so closing/reinstalling IntelliJ ends the Claude session; resume via `claude --resume` from `/home/tmakdrl/promid`.
- JDK 21 available at `/home/tmakdrl/.jdks/temurin-21.0.11` (and system `/usr/lib/jvm/java-21-openjdk-amd64`). `backend/gradle.properties` pins `org.gradle.java.home=/home/tmakdrl/.jdks/temurin-21.0.11` so terminal Gradle builds work regardless of IDE.
- KNOWN IDE ISSUE: opening the `promid` ROOT project shows "Project JDK undefined" + no autocomplete because the root `.idea` never got a Project SDK (yesterday the working setup was the `backend` folder opened directly; backend/.idea has project-jdk-name=temurin-21). For a WSL project the SDK must be a WSL JDK (Add JDK → `\\wsl.localhost\Ubuntu\home\tmakdrl\.jdks\temurin-21.0.11`), NOT "Download JDK" (which creates Windows-side copies that don't stick → caused duplicate downloads temurin-21.0.11-1/-2).
- Terminal build always works: `cd /home/tmakdrl/promid/backend && ./gradlew classes`.
