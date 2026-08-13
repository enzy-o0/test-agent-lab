# 저장소 에이전트 지침

이 문서는 **Git / PR 워크플로**만 다룬다.
무엇을 만들고 무엇을 건드리지 않을지에 대한 판단 기준 — 레포 무게중심,
픽스처 불변 원칙, 측정 규칙 — 은 [`CLAUDE.md`](CLAUDE.md)에 있다.

## Git 워크플로

- `main` 에 직접 커밋하지 않는다
- 항상 최신 `main` 에서 시작한다
- 브랜치 이름은 `<타입>/<케밥-케이스-설명>`
- 커밋 메시지와 PR 제목은 Conventional Commits
- 작업 브랜치를 푸시하고 `main` 을 향하는 **draft PR** 을 연다
- 사용자가 명시적으로 요청하지 않는 한 PR 을 ready 로 바꾸거나, 승인·머지하거나,
  브랜치를 삭제하지 않는다

## 이 저장소의 규칙

### 타입

[`.gitmessage.txt`](.gitmessage.txt) 가 정의한 집합을 쓴다. 공용 기준
(`feat` `fix` `docs` `refactor` `test` `ci` `chore`)에 `style` `build` `perf` 가 더 있다.

### 로드맵 단계는 번호를 붙인다

README 로드맵의 한 단계가 브랜치 하나다. 순서가 드러나도록 번호를 앞에 둔다.

```
docs/01-zero-baseline
feat/02-generate-agent
build/03-stryker
feat/04-critique-agent
docs/05-writeup
```

로드맵과 무관한 작업은 번호 없이 `<타입>/<설명>` 으로 딴다.

### 커밋

- 제목 50자 / 본문 72자, 본문은 한국어
- **무엇보다 왜를 쓴다.** diff 가 이미 무엇을 말해준다
- 픽스처를 건드린 커밋은 `fix(fixture):` / `chore(fixture):` 처럼 스코프를 붙여
  루트 코드 변경과 구분한다

커밋 템플릿을 이 저장소에 연결하려면 클론 후 한 번 실행한다.

```bash
git config --local commit.template .gitmessage.txt
```

### 픽스처와 문서를 한 커밋에 섞지 않는다

실험 결과 커밋에는 `reports/` 와 `docs/` 만 담는다. 픽스처는 실험이 끝난 시점에
`git checkout -- src/` 로 되돌아가 있어야 하고, `git status --short` 가 비어 있는 것을
확인한 뒤 커밋한다. 절차 전체는 `experiment` 스킬에 있다.

픽스처 변경이 섞이면 그 커밋 이후의 측정값은 이전 실행과 비교할 수 없게 된다.

### PR 이 통과해야 하는 것

CI 잡 `픽스처 (sundaes)` 하나다.

```
npm ci → npm run lint → npx tsc --noEmit → npm run test:coverage
```

로컬 측정 절차와 같은 네 단계다. 여기서 빨간불이면 그 실행에서 나온 숫자는
`reports/` 에 기록하지 않는다 — 재현되지 않는 측정값이기 때문이다.

## 자동으로 강제되지 않는 것

아래는 규칙이지만 막아주는 장치가 없다. 사람이 확인한다.

| 규칙 | 현재 상태 |
|---|---|
| `main` 직접 커밋 금지 | 브랜치 보호 규칙이 없어 직접 푸시가 가능하다 |
| CI 통과 후 머지 | required check 이 아니라 빨간불에도 머지된다 |
| 픽스처 소스 수정 금지 | CI 는 테스트만 본다. 소스가 바뀌어도 초록불이면 통과한다 |

세 번째가 이 레포에서 제일 비싼 실수다. 픽스처가 흔들리면 그 이후의 모든 측정값이
이전 실행과 비교 불가능해지고, 어느 시점부터 어긋났는지 되짚기 어렵다.
PR 리뷰에서 `fixtures/sundaes/src/` 변경이 있는지 먼저 본다.
