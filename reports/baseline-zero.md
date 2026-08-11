# 0% 기준점 — 테스트 전량 제거 (1단계)

에이전트가 무(無)에서 시작할 때의 바닥값. 2단계 이후 모든 실행은
이 표에서 출발해 [`baseline.md`](baseline.md)(사람이 쓴 테스트)에
얼마나 접근하는지로 읽는다.

| 항목 | 값 |
|---|---|
| 측정일 | 2026-08-12 |
| 픽스처 커밋 | `1d54765` |
| 제거한 테스트 파일 | 9 (vitest 전량) |
| 테스트 | 0 — `No test files found` |
| Statements | 0% |
| Branch | 0% |
| Functions | 0% |
| Lines | 0% |
| 뮤테이션 스코어 | 미측정 (3단계에서 도입) |
| `npm run lint` | exit 0 |
| `npx tsc --noEmit` | exit 0 |
| `npm run test:coverage` | **exit 1** |

E2E(`cypress/e2e/sample.cy.js`)는 제거 대상에서 뺐다. vitest 커버리지에
잡히지 않아 이 표의 숫자를 움직이지 않는다.

## 분모

| 항목 | 값 |
|---|---|
| 커버리지 대상 파일 | 25 |
| statement | 631 |

`coverage.all`이 켜져 있음을 **테스트 0개 상태에서 확인했다** — 25개 파일이
전부 0%로 보고됐다. 아무 테스트도 import 하지 않은 파일이 분모에 들어간다는 뜻이다.

이걸 확인해둔 이유: `all: false`였다면 분모가 "테스트가 건드린 파일"로 줄어들어,
**에이전트가 테스트를 적게 쓸수록 커버리지가 높게** 나온다. 그 상태로 잰 숫자는
실행 간 비교가 불가능하다. 분모가 631로 고정되어 있어야 0% → N% 가 의미를 갖는다.

## 제거한 것

| 파일 | 테스트 | 대상 |
|---|---|---|
| `src/pages/entry/test/totalUpdate.test.tsx` | 6 | 앱 |
| `src/pages/entry/test/Options.test.tsx` | 3 | 앱 |
| `src/pages/entry/test/OrderEntry.test.tsx` | 2 | 앱 |
| `src/pages/entry/test/ScoopOptions.test.tsx` | 1 | 앱 |
| `src/pages/summary/tests/SummaryForm.test.tsx` | 3 | 앱 |
| `src/pages/confirmation/test/OrderConfirmation.test.tsx` | 1 | 앱 |
| `src/features/orderPhase.test.tsx` | 3 | 앱 |
| `src/pages/example/tests/ButtonTextWithCheckBoxTest.test.tsx` | 6 | 튜토리얼 예제 |
| `src/pages/example/tests/ButtonTest.test.tsx` | 3 | 튜토리얼 예제 |
| **합계** | **28** | |

테스트 헬퍼(`testing-library-utils.tsx`), msw 핸들러, `setupVitest.ts`는 남겼다.
에이전트가 재작성할 대상은 테스트지 하네스가 아니다.

### 28개 중 9개는 앱을 테스트하지 않는다

`ButtonTest` / `ButtonTextWithCheckBoxTest`는 강의를 따라가며 만든 연습용 컴포넌트다.
아이스크림 주문 앱과 무관한데도 `src/` 아래 있어서 분모에 들어간다.

- 테스트 수의 **32%** (9/28)
- statement 분모의 **9.4%** (59/631)

그래서 "에이전트가 28개를 썼다 vs 사람이 28개를 썼다"는 동률 비교가 아니다.
2단계 비교표에는 **앱 대상 테스트 19개**를 나란히 놓고, 예제 몫은 따로 적는다.

## 2단계에 걸리는 것

바닥값을 재면서 드러난, 에이전트 루프 설계에 영향을 주는 세 가지.

**1. `vitest run`은 테스트가 0개면 exit 1이다.**
`No test files found, exiting with code 1`. 즉 종료 코드만으로는
"테스트가 깨졌다"와 "테스트가 아직 없다"를 구분할 수 없다.
자가수복 루프가 이걸 실패로 읽으면 첫 사이클부터 헛돈다.
`--passWithNoTests`를 쓰거나 파일 개수를 먼저 세야 한다.

**2. 커버리지 리포터는 테스트가 0개여도 정상 출력된다.**
`coverage-final.json`이 631개 statement를 전부 미커버로 실어서 나온다.
에이전트에게 먹일 "지금 비어 있는 곳" 입력을 0-state에서 그대로 생성할 수 있다는 뜻이다.
1단계 산출물을 2단계 입력으로 바로 쓴다.

**3. `lint`와 `tsc`는 테스트가 0개여도 초록불이다.**
둘 다 exit 0. 에이전트가 테스트를 한 줄도 안 써도 두 게이트는 통과한다.
품질 게이트로 쓸 수 있는 건 커버리지와 (3단계 이후) 뮤테이션 스코어뿐이다.

## 재현

```bash
cd fixtures/sundaes
npm ci
find src -name "*.test.tsx" -delete
npm run lint          # exit 0
npx tsc --noEmit      # exit 0
npm run test:coverage # exit 1, All files 0%
git checkout -- src/  # 반드시 되돌린다
```

측정 후 롤백 완료 — `git status --short fixtures/sundaes` 비어 있음을 확인했다.

## 이 표를 읽는 법

0%는 성과가 아니라 **출발선**이다. 여기서 커버리지를 올리는 건 쉽다 —
렌더만 하고 assertion이 없는 테스트도 statement를 지나간다.
그래서 2단계 결과를 커버리지 단독으로 판정하지 않는다.
[`baseline.md`](baseline.md)의 97.62%짜리 테스트가 결함 2건을 놓치고 있다는 게
이 레포의 출발점이다.
