# 베이스라인 — 사람이 쓴 테스트 (0단계)

이후 모든 에이전트 실행은 이 표와 비교한다.

| 항목 | 값 |
|---|---|
| 측정일 | 2026-08-11 |
| 픽스처 커밋 | 0단계 종료 시점 |
| 테스트 파일 | 9 |
| 테스트 | 28 passed / 28 |
| Statements | 97.62% |
| Branch | 93.05% |
| Functions | 90.32% |
| Lines | 97.62% |
| 뮤테이션 스코어 | 미측정 (3단계에서 도입) |
| 알려진 미탐지 결함 | 2 (`docs/00-베이스라인-발견.md` 발견 2·3) |

## 재현

```bash
cd fixtures/sundaes
npm ci
npm run lint          # exit 0
npx tsc --noEmit      # exit 0
npm run test:coverage # exit 0
```

## 커버리지가 100%가 아닌 곳

`src/shared/ui/index.ts`와 `src/widgets/Options/index.ts` — FSD 배럴 파일이라
아무 테스트도 이 경로로 import 하지 않는다. 로직이 없으므로 결함 위험은 없다.

## 이 표를 읽는 법

Statements 97.62%는 **28개 테스트가 코드의 97.62%를 실행했다**는 뜻이지,
97.62%를 검증했다는 뜻이 아니다. 실제로 이 상태에서 결함 2건이 살아있다.

3단계에서 뮤테이션 스코어를 측정하면 두 숫자의 간격이 나온다.
그 간격이 이 레포의 관심사다.
