# 테스트가 하나도 없을 때의 기준값 (1단계)

2단계부터는 에이전트가 테스트를 쓴다. 그 결과를 "잘했다/못했다"로 말하려면
**출발점이 어디였는지** 먼저 적어둬야 한다. 이 문서가 그 출발점이다.

한 일은 간단하다. 사람이 쓴 테스트 9개 파일을 전부 지우고 → 측정하고 → 되돌렸다.

| 항목 | 값 |
|---|---|
| 측정일 | 2026-08-12 |
| 픽스처 커밋 | `1d54765` |
| 지운 테스트 파일 | 9 (vitest 전량) |
| 테스트 | 0 — `No test files found` |
| Statements | 0% |
| Branch | 0% |
| Functions | 0% |
| Lines | 0% |
| 뮤테이션 스코어 | 미측정 (3단계에서 도입) |
| `npm run lint` | exit 0 |
| `npx tsc --noEmit` | exit 0 |
| `npm run test:coverage` | **exit 1** |

E2E(`cypress/e2e/sample.cy.js`)는 지우지 않았다. vitest 커버리지에 잡히지 않아
이 표의 숫자를 움직이지 않는다.

측정이 끝난 뒤 `git checkout -- src/` 로 되돌렸고, 28개 테스트가 다시 통과하는 것과
커버리지 97.62%가 그대로인 것을 확인했다. 픽스처는 건드리지 않은 상태다.

## 0%가 나온 게 성과는 아니다

테스트를 지웠으니 0%가 나오는 건 당연하다. 이 문서의 값어치는 0%가 아니라,
**지우고 돌려보지 않았으면 몰랐을 세 가지**에 있다.

### 1. 커버리지의 "전체"가 무엇인지 확인했다

커버리지는 이렇게 계산된다.

```
커버리지 = 테스트가 실행한 코드 ÷ 전체 코드
```

여기서 아래쪽 "전체 코드"를 무엇으로 잡느냐가 도구 설정에 따라 갈린다.

- **모든 소스 파일** — 아무 테스트도 없는 파일까지 포함
- **테스트가 import 한 파일만** — 손대지 않은 파일은 계산에서 빠짐

두 번째 설정이면 문제가 생긴다. 에이전트가 파일 3개만 골라 테스트해도
나머지가 계산에서 빠지니 **커버리지 90%가 나온다.** 테스트를 적게 쓸수록
점수가 좋아지는 셈이라, 실행끼리 비교할 수가 없다.

테스트를 0개로 만들고 돌렸더니 **25개 파일이 전부 0%로 보고됐다.**
아무것도 import 되지 않았는데도 목록에 나왔으니, 첫 번째 설정이 맞다.
"전체 코드"는 25개 파일 · 631줄(statement)로 고정돼 있다.

이 숫자가 움직이지 않는다는 걸 확인했으니, 앞으로 나올 커버리지는
실행끼리 나란히 놓고 비교해도 된다.

### 2. 기존 28개 테스트 중 9개는 이 앱을 테스트하지 않는다

`ButtonTest` / `ButtonTextWithCheckBoxTest` 는 강의를 따라가며 만든 연습용 버튼
컴포넌트다. 아이스크림 주문 앱과 아무 상관이 없는데 `src/` 안에 있다 보니
커버리지 계산에도 들어가 있다.

- 테스트 수의 **32%** (9/28)
- 전체 코드의 **9.4%** (59/631줄)

그래서 2단계에서 "에이전트 28개 vs 사람 28개"로 표를 만들면 공정한 비교가 아니다.
**앱을 테스트하는 19개**를 기준으로 놓고, 연습용 몫은 따로 적는다.

### 3. 테스트가 0개면 vitest 가 실패로 끝난다

```
No test files found, exiting with code 1
```

에이전트 루프는 보통 "테스트를 돌려보고, 실패하면 고친다"로 돌아간다.
그런데 종료 코드만 보면 **"테스트가 깨졌다"와 "테스트가 아직 없다"가 똑같이 1**이다.
첫 사이클에서 아직 아무것도 안 썼을 뿐인데 루프가 이걸 실패로 읽고 헛돌게 된다.

`--passWithNoTests` 를 쓰거나, 파일 개수를 먼저 세서 구분해야 한다.
2단계 설계에 바로 걸리는 문제라 여기 적어둔다.

## 그 외에 알게 된 것

**커버리지 리포터는 테스트가 0개여도 정상 출력된다.** `coverage-final.json` 에
631줄이 전부 "실행 안 됨"으로 실려 나온다. 즉 에이전트에게 건넬
"지금 비어 있는 곳" 목록을 이 상태에서 그대로 만들 수 있다.
1단계 산출물이 2단계 입력이 된다.

**lint 와 tsc 는 테스트가 0개여도 통과한다.** 둘 다 exit 0.
에이전트가 테스트를 한 줄도 안 써도 이 둘은 초록불이라, 품질 게이트로 쓸 수 없다.
쓸 수 있는 건 커버리지와 (3단계 이후) 뮤테이션 스코어뿐이다.

## 지운 테스트 목록

| 파일 | 테스트 | 대상 |
|---|---|---|
| `src/pages/entry/test/totalUpdate.test.tsx` | 6 | 앱 |
| `src/pages/entry/test/Options.test.tsx` | 3 | 앱 |
| `src/pages/entry/test/OrderEntry.test.tsx` | 2 | 앱 |
| `src/pages/entry/test/ScoopOptions.test.tsx` | 1 | 앱 |
| `src/pages/summary/tests/SummaryForm.test.tsx` | 3 | 앱 |
| `src/pages/confirmation/test/OrderConfirmation.test.tsx` | 1 | 앱 |
| `src/features/orderPhase.test.tsx` | 3 | 앱 |
| `src/pages/example/tests/ButtonTextWithCheckBoxTest.test.tsx` | 6 | 연습용 |
| `src/pages/example/tests/ButtonTest.test.tsx` | 3 | 연습용 |
| **합계** | **28** | |

테스트 헬퍼(`testing-library-utils.tsx`), msw 핸들러, `setupVitest.ts` 는 남겼다.
에이전트가 다시 쓸 대상은 테스트지 실행 환경이 아니다.

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

## 이 표를 읽는 법

0%는 성과가 아니라 **출발선**이다. 그리고 여기서 커버리지를 올리는 건 쉽다 —
화면을 그리기만 하고 아무것도 확인하지 않는 테스트도 코드를 "실행"하기 때문에
커버리지는 올라간다.

그래서 2단계 결과를 커버리지만으로 판정하지 않는다.
[`baseline.md`](baseline.md)의 97.62%짜리 테스트가 실제 결함 2건을 놓치고 있다는 것이
이 레포의 출발점이다.
