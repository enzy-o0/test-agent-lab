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

CI 잡 두 개이고, 둘 다 required check 이라 빨간불이면 머지 버튼이 잠긴다.

| 잡 | 하는 일 |
|---|---|
| `픽스처 (sundaes)` | `npm ci → lint → tsc --noEmit → test:coverage` |
| `픽스처 불변 확인` | PR 이 `fixtures/sundaes/` 를 건드리면 실패시킨다 |

앞의 것은 로컬 측정 절차와 같은 네 단계다. 여기서 빨간불이면 그 실행에서 나온
숫자는 `reports/` 에 기록하지 않는다 — 재현되지 않는 측정값이기 때문이다.

### 픽스처를 정말 바꿔야 할 때

PR 에 `fixture-change` 라벨을 붙이면 가드가 통과한다.
라벨은 사람이 직접 붙이는 것이라, 예외를 쓴 PR 이 목록에 그대로 남는다.

붙이기 전에 `docs/` 에 근거를 적는다. 예외는 *측정 자체를 불가능하게 만드는* 결함뿐이다
([`CLAUDE.md`](CLAUDE.md) 픽스처 불변 원칙).

가드가 예상치 못하게 빨간불이면 실험 후 롤백을 빠뜨린 것이다.

```bash
cd fixtures/sundaes && git checkout -- src/
```

## 자동으로 강제되지 않는 것

아래는 규칙이지만 막아주는 장치가 없다. 사람이 확인한다.

| 규칙 | 왜 자동화하지 않았나 |
|---|---|
| 커밋 메시지 형식 (한국어 본문 · 50/72 · **왜**를 쓴다) | commitlint 를 붙이면 형식은 강제되지만 "왜"는 강제되지 않는다. 형식만 통과하는 커밋이 늘 뿐이다 |
| 로드맵 단계 브랜치 번호 | 로드맵이 6단계뿐이라 자동화 비용이 값을 못 한다 |
| 측정값을 `reports/` 에 남기기 | 무엇이 "측정 실행"인지 CI 가 알 수 없다 |
