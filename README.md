# test-agent-lab

> 에이전트에게 테스트를 쓰게 하고, 그 테스트가 실제로 버그를 잡는지 측정한다.

커버리지는 테스트가 코드를 **실행했는지**를 말한다. **검증했는지**는 말하지 않는다.
이 레포는 그 간극을 숫자로 만들고, 에이전트가 그 간극을 좁힐 수 있는지 실험한다.

## 지금까지 나온 숫자

| 지표 | 값 |
|---|---|
| 테스트 | 28 passed (28) |
| 커버리지 (stmts / branch) | **97.62% / 93.05%** |
| 그럼에도 남아 있는 실제 결함 | **2건** |

커버리지 97.62%인 앱에서 **이미지가 한 장도 뜨지 않는다.**
이걸 검증했어야 할 테스트의 이름은 `displays image for each scoop option from server`다.
테스트는 이미지 개수와 `alt`를 확인하고, `src`는 확인하지 않는다.

```html
<img src="undefined/undefined" alt="Chocolate scoop" />
```

`img` 요소의 커버리지는 100%다.

→ 자세한 내용: [`docs/00-베이스라인-발견.md`](docs/00-베이스라인-발견.md)

## 측정 규격

실행 간 비교가 성립하려면 측정 절차가 매번 같아야 한다. 네 개를 같은 순서로 돌리고
결과는 전부 [`reports/`](reports/)에 남긴다.

```bash
npm ci                # 락파일 기준 설치 (npm install 을 쓰지 않는다)
npm run lint          # --max-warnings 0
npx tsc --noEmit
npm run test:coverage
```

커버리지 단독으로 "테스트가 좋아졌다"고 판정하지 않는다.
이 레포의 논지가 커버리지의 한계이므로 자기모순이 된다.
3단계에서 뮤테이션 스코어를 붙이면 두 숫자를 함께 본다.

| 기준선 | 내용 |
|---|---|
| [`reports/baseline.md`](reports/baseline.md) | 사람이 쓴 테스트 — 28개, 97.62% |
| [`reports/baseline-zero.md`](reports/baseline-zero.md) | 테스트를 전부 지운 출발점 — 0%, 대상 코드 25개 파일 · 631줄 |

## 구조

```
agent/              에이전트 구현 — 테스트 생성 / 자가수복 / 비평
fixtures/sundaes/   실험 대상 앱 (아래 출처 참고)
docs/               실행에서 나온 발견 기록
reports/            실행별 커버리지 · 뮤테이션 스코어
```

## 픽스처

실험 대상은 [enzy-o0/react-vite-vitest](https://github.com/enzy-o0/react-vite-vitest)다.
Udemy [Jest / Vitest 를 활용한 React 테스팅 라이브러리](https://www.udemy.com/course/react-testing-library/) 과정을 따라가며
직접 만든 아이스크림 주문 앱으로, React 18 + Context API + react-router + msw + Cypress를 쓴다.

벤치마크 대상으로 이걸 고른 이유:

- **정답지가 있다.** 사람이 쓴 테스트가 통과 상태로 존재해 에이전트 결과와 직접 비교된다
- **작다.** 소스 657줄 · 테스트 654줄이라 에이전트 루프가 몇 초 만에 돈다
- **가짜가 아니다.** 비동기 로딩, 에러 처리, 전역 상태, 라우팅이 다 들어있다

원본 레포는 학습 기록으로 두고, 여기엔 복사본을 격리해서 쓴다.
에이전트가 테스트를 지우고 다시 쓰는 게 핵심 루프라 원본과 분리해야 한다.

---

## 기준선을 만들며 정리한 것

학습용으로 만든 앱이라 벤치마크 픽스처로 쓰려면 **측정이 매번 같은 결과를 내야** 했다.
`npm ci → lint → tsc → test` 가 재현 가능해질 때까지 정리한 내용이다.

### 정확성

| 항목 | 이전 | 현재 |
|---|---|---|
| 테스트 격리 | `server.resetHandlers(...h)`가 초기 핸들러를 영구 교체 → 단독 실행은 통과, 전체 실행은 실패 | 테스트 범위 오버라이드인 `server.use()`로 교체 |

전체 실행이 빨간불이면 베이스라인 자체를 잴 수 없어 이것부터 고쳤다.
원인은 [발견 1](docs/00-베이스라인-발견.md)에 정리했다.

### CI

| 항목 | 이전 | 현재 |
|---|---|---|
| 파이프라인 | GitHub Pages 배포만 수행 | `lint` → `tsc --noEmit` → `test:coverage` |
| 패키지 매니저 | `yarn.lock`이 있는데 CI는 `cache: 'npm'` + `npm install` | npm으로 통일, `package-lock.json` 커밋 |
| Node | 18 | 22 |
| 액션 버전 | `checkout@v3`, `setup-node@v3`, `upload-artifact@v1` | 전부 v4 |

측정이 로컬에서만 재현되면 기준선으로 쓸 수 없어 CI에서도 같은 네 단계를 돌리게 했다.

### 린트

| 항목 | 이전 | 현재 |
|---|---|---|
| 실행 가능 여부 | `cypress/.eslintrc.js`가 `module.exports`인데 `"type": "module"` → `npm run lint` 크래시 | `.eslintrc.cjs`로 확장자 교정 |
| 중복 룰 | base `no-unused-vars`와 `@typescript-eslint/no-unused-vars`가 동시에 켜짐 → 같은 위치를 warning + error로 두 번 보고, 타입 선언부 파라미터까지 오탐 | base 룰 `off` (TS-ESLint 권장) |
| 우회 주석 | 위 오탐을 막으려 소스에 붙은 `eslint-disable-next-line no-unused-vars` | 원인을 고쳤으므로 제거 |
| 잔여 지적 | 크래시로 드러나지 않던 상태 | 미사용 파라미터, 빠진 훅 의존성, 테스트에 남은 `screen.debug()` 정리 |

설정 파일 확장자 문제로 린트가 크래시하고 있었다. 고치자 에러 2건 + 경고 8건이 드러났고,
전부 정리한 뒤 `--max-warnings 0`으로 CI에서 강제한다.

### 의존성

| 항목 | 이전 | 현재 |
|---|---|---|
| 오타로 설치된 패키지 | `add@2.0.6`, `yarn@1.22.21` (`yarn add add`의 흔적) | 제거 |
| 불필요한 타입 패키지 | `@types/react-router-dom@5` — v6는 타입 내장 | 제거 |
| dep / devDep 분류 | 테스트 라이브러리 6종이 `dependencies`에 (`@testing-library/*`, `@vitest/ui`, `eslint-plugin-vitest`) | `devDependencies`로 이동 |
| 죽은 스크립트 | `deploy: gh-pages -d dist` — `gh-pages`가 설치되어 있지 않음 | 제거 |
| husky | 픽스처의 `prepare: husky install`이 `.git` 부재로 설치를 실패시킴 | 제거 — 현재 커밋 훅은 쓰지 않는다 |
| 빌드 설정 | `base: '/react-vite-vitest/'` — Pages 배포 경로 | 픽스처는 배포 대상이 아니므로 제거 |

정리 전에는 `npm install`이 exit 1로 끝나 설치 단계부터 재현되지 않았다.

### 고정해둔 것

메이저 버전(React 18 → 19, ESLint 8 → 9 flat config, Vitest 1 → 3)은 올리지 않았다.

픽스처의 가치는 *고정된* 비교 기준이라는 데 있다. 에이전트 실행 결과가 나빠졌을 때
에이전트 탓인지 업그레이드 탓인지 구분되지 않으면 측정이 성립하지 않는다.
업그레이드는 픽스처를 흔드는 변경이라 별도 실험으로 분리한다.

[발견 2·3](docs/00-베이스라인-발견.md)의 결함 2건도 같은 이유로 고치지 않았다.
에이전트가 이 두 건을 잡아내는지가 평가 지표이므로, 지금 고치면 지표가 사라진다.

---

## 로드맵

- [x] **0** — 픽스처 이관, 재현 가능한 측정 확보, CI, [베이스라인 측정](reports/baseline.md)
- [x] **1** — 기존 테스트 전량 제거 → [출발점 측정](reports/baseline-zero.md), 에이전트 결과를 비교할 기준값 확보
- [ ] **2** — `agent/generate.ts` — 커버리지 갭을 읽고 테스트 작성
- [ ] **3** — Stryker 도입, 뮤테이션 스코어 측정 · *커버리지와의 간극이 여기서 드러난다*
- [ ] **4** — `agent/critique.ts` — 살아남은 뮤턴트를 근거로 테스트 재작성
- [ ] **5** — 결과 정리

## 실행

```bash
cd fixtures/sundaes
npm ci
npm run test:coverage
```
