---
name: baseline
description: 픽스처의 현재 측정치(lint/타입/테스트/커버리지, 도입 후에는 뮤테이션 스코어)를 규격대로 재고 reports/ 에 기록한다. "베이스라인 재라", "지금 커버리지 얼마야", "측정해줘", 또는 에이전트 실행 전후로 숫자를 비교해야 할 때 사용한다.
---

# 베이스라인 측정

측정 절차를 매번 똑같이 밟기 위한 스킬. 절차가 흔들리면 실행 간 비교가 무의미해진다.

## 1. 픽스처가 깨끗한지 먼저 확인

```bash
cd fixtures/sundaes && git status --short .
```

변경사항이 있으면 **멈추고 사용자에게 알린다.** 더러운 트리에서 잰 숫자는
베이스라인이 아니다. 직전 실험의 잔재일 수 있으므로 임의로 `git checkout` 하지 않는다.

## 2. 측정

네 개를 순서대로 돌리고, **각각의 exit code를 기록한다.**

```bash
cd fixtures/sundaes
npm ci
npm run lint;          echo "lint=$?"
npx tsc --noEmit;      echo "tsc=$?"
npm run test:coverage; echo "vitest=$?"
```

Stryker 도입(로드맵 3단계) 후에는 뮤테이션도 함께 잰다.

```bash
npx stryker run
```

`npm ci`는 락파일 기준 설치라 재현성이 보장된다. `npm install`을 쓰지 않는다.

## 3. 기록

`reports/` 에 남긴다. 형식은 `reports/baseline.md` 를 따른다.

- 사람이 쓴 테스트 기준선을 다시 잰 것이면 → `reports/baseline.md` 갱신
- 에이전트 실행 결과면 → `reports/run-<설명>.md` 새로 작성

반드시 포함할 항목:

| 항목 | 비고 |
|---|---|
| 측정일 | |
| 픽스처 커밋 | `git rev-parse --short HEAD` |
| 테스트 수 | passed / total |
| Statements / Branch / Functions / Lines | 커버리지 4종 전부 |
| 뮤테이션 스코어 | 3단계 이후. 미측정이면 "미측정"이라고 명시 |
| 알려진 미탐지 결함 | `docs/00-베이스라인-발견.md` 기준 |

## 4. 해석할 때 지키는 것

커버리지 상승만으로 "테스트가 좋아졌다"고 쓰지 않는다. 이 레포의 논지가
커버리지의 한계이므로 자기모순이 된다. 뮤테이션 스코어가 없는 시점이면
"커버리지 N% (검증 강도는 미측정)"처럼 한계를 같이 적는다.

숫자가 나빠졌으면 나빠졌다고 그대로 쓴다. 실패한 실행도 기록 대상이다.
