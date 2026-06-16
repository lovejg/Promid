---
name: promid-collaboration-model
description: Division of labor on the promid project — who writes frontend vs backend
metadata:
  type: project
---

promid = 약속 중간지점 추천 서비스 (Spring Boot 4.1/Java 21 backend + React/Vite/TypeScript frontend, monorepo).

Division of labor:
- **Frontend (React/TS)**: Claude writes it fully, matched to the backend API.
- **Backend (Spring Boot)**: the USER writes it; Claude is a guide — lays out order, what to build, how, and reasons through design *collaboratively* (not handing down finished specs). Claude writes a backend file only when the user explicitly asks ("이건 네가 짜줘").
- **Config files** (build.gradle, application.properties, secrets wiring): Claude handles these directly.

MVP is stateless (no DB). JPA & Security were removed from build.gradle; re-add at roadmap step 4 (auth). Kakao Local API for geocoding + keyword place search. See [[workflow-wait-for-go]].
