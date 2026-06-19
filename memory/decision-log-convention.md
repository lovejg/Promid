---
name: decision-log-convention
description: promid keeps a portfolio-oriented decision log at docs/DECISIONS.md; append after design debates
metadata: 
  node_type: memory
  type: project
  originSessionId: 4ee6c7ff-1b3d-4116-8aa2-97d550709698
---

promid는 설계 쟁점·트레이드오프 결정을 `docs/DECISIONS.md`에 기록한다. 사용자가 **나중에 이걸로 포트폴리오를 작성할 계획**이라 만든 문서.

**Why:** 포트폴리오엔 "무슨 기능을 만들었나"보다 "어떤 트레이드오프에서 왜 이걸 골랐나"가 더 강력하다. 대화 중 나오는 핵심 쟁점이 그냥 흘러가 버리지 않게 남긴다.

**How to apply:** 의미 있는 설계 논쟁/결정이 나올 때마다 `docs/DECISIONS.md`에 항목을 **이어 붙인다**(배경 → 선택지 → 결정 → 이유 틀). 사소한 구현 디테일 말고, 트레이드오프가 있었던 결정만. 관련: [[promid-progress]] [[promid-collaboration-model]]
