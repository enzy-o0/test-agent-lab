/**
 * 2단계 — 커버리지 갭을 읽고 테스트를 작성하는 에이전트.
 *
 * 1라운드는 통제 조건이다: 에이전트가 소스를 스스로 탐색하지 않고, 대상 파일의
 * 내용을 프롬프트로 주입받는다. 결과가 나빠졌을 때 "테스트를 못 쓴 것"과
 * "파일을 못 찾은 것"을 구분하기 위해서다. 자율 탐색 조건은 2라운드에서
 * 별도 실험으로 붙이고 두 숫자를 비교한다.
 *
 * 사용법:
 *   npm run generate -- pages/summary/ui/SummaryForm/SummaryForm.tsx
 */
import { execFile } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

import Anthropic from '@anthropic-ai/sdk';
import { betaTool } from '@anthropic-ai/sdk/helpers/beta/json-schema';

const execFileAsync = promisify(execFile);

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FIXTURE_ROOT = join(REPO_ROOT, 'fixtures', 'sundaes');
const FIXTURE_SRC = join(FIXTURE_ROOT, 'src');

/** 테스트 실행 출력이 길어지면 토큰이 갭 정보를 밀어낸다. */
const MAX_TEST_OUTPUT_CHARS = 6000;
/** 자가수복 루프 상한. 이 값에 닿으면 실패로 기록한다. */
const MAX_ITERATIONS = 8;

/**
 * 모델이 준 경로를 그대로 파일 시스템에 넘기지 않는다. 정규화한 뒤 픽스처
 * src 안에 남아 있는지 확인한다 — 벗어나면 거부한다.
 */
function resolveInsideFixtureSrc(candidate: string): string {
    const absolute = resolve(FIXTURE_SRC, candidate.replace(/^\/+/, ''));
    const rel = relative(FIXTURE_SRC, absolute);
    if (rel.startsWith('..') || resolve(FIXTURE_SRC, rel) !== absolute) {
        throw new Error(`픽스처 src 밖의 경로는 쓸 수 없습니다: ${candidate}`);
    }
    return absolute;
}

function truncate(text: string): string {
    if (text.length <= MAX_TEST_OUTPUT_CHARS) return text;
    return `${text.slice(0, MAX_TEST_OUTPUT_CHARS)}\n…(출력이 잘렸습니다)`;
}

const SYSTEM_PROMPT = `당신은 이 저장소의 테스트를 작성한다. 대상 컴포넌트의 소스는 사용자 메시지에 들어 있다.

## 이 픽스처의 관례

- React 18 + TypeScript + Vitest + React Testing Library + msw
- \`@\` 는 \`src\` 의 별칭이다 (\`@/shared/lib\` 처럼 쓴다)
- 전역 컨텍스트가 필요한 컴포넌트는 \`renderWithContext\` 로 렌더한다:
  \`import { renderWithContext } from '@/shared/lib/testing-library-utils';\`
- msw 서버는 \`setupVitest.ts\` 에서 자동으로 뜨고 매 테스트 후 리셋된다.
  핸들러를 바꿔야 하면 \`server.resetHandlers(...)\` 가 아니라 \`server.use(...)\` 를 쓴다
  (인자를 준 resetHandlers 는 초기 핸들러 목록을 영구 교체해서 다음 테스트를 깬다)
- UI 문구는 한국어다. 화면에서 실제로 보이는 문자열로 쿼리한다
- \`vitest\` 의 globals 가 켜져 있어 \`describe\`/\`test\`/\`expect\` 를 import 하지 않아도 된다

## 무엇을 검증할 것인가

커버리지는 코드를 **실행**했는지만 말한다. 실행이 아니라 **검증**을 목표로 쓴다.

- 렌더만 하고 아무것도 확인하지 않는 테스트를 쓰지 않는다
- 요소의 **개수와 접근성 이름만** 확인하고 실제 값(\`src\`, \`href\`, 표시 금액 등)을
  확인하지 않는 테스트는 통과해도 결함을 놓친다. 값 자체를 단언한다
- 구현 세부사항(state 변수명, 내부 함수)이 아니라 사용자가 관찰할 수 있는 동작을 검증한다
- 경계와 실패 경로를 포함한다: 빈 목록, 서버 에러, 비활성 상태, 0/최대값

## 작업 방식

1. \`write_test_file\` 로 테스트 파일을 쓴다
2. \`run_tests\` 로 돌린다
3. 실패하면 원인을 읽고 고친다

테스트가 실패했을 때 **기대값을 실제 출력에 맞춰 낮추지 않는다.** 소스가 틀렸다고
판단되면 테스트를 약화시키는 대신 그 사실을 마지막 답변에 적는다. 소스 파일은
수정할 수 없고, 수정해서도 안 된다.

전부 통과하면 무엇을 검증했고 무엇을 일부러 검증하지 않았는지 두세 문장으로 요약한다.`;

interface RunMetrics {
    iterations: number;
    testRuns: number;
    writes: number;
    inputTokens: number;
    outputTokens: number;
    cacheReadTokens: number;
    cacheCreationTokens: number;
}

async function main(): Promise<void> {
    const targetArg = process.argv[2];
    if (!targetArg) {
        console.error(
            '대상 소스 파일을 지정하세요 (fixtures/sundaes/src 기준 상대 경로).\n' +
                '  예: npm run generate -- pages/summary/ui/SummaryForm/SummaryForm.tsx',
        );
        process.exit(2);
    }

    if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) {
        console.error(
            '자격증명이 없습니다. 둘 중 하나를 쓰세요:\n' +
                '  export ANTHROPIC_API_KEY=...\n' +
                '  또는 ant CLI 설치 후 `ant auth login` (프로파일을 SDK 가 자동으로 읽습니다)',
        );
        process.exit(2);
    }

    const sourcePath = resolveInsideFixtureSrc(targetArg);
    const sourceCode = await readFile(sourcePath, 'utf8');
    const sourceRel = relative(FIXTURE_SRC, sourcePath);

    const client = new Anthropic();
    const metrics: RunMetrics = {
        iterations: 0,
        testRuns: 0,
        writes: 0,
        inputTokens: 0,
        outputTokens: 0,
        cacheReadTokens: 0,
        cacheCreationTokens: 0,
    };

    const writeTestFile = betaTool({
        name: 'write_test_file',
        description:
            '테스트 파일을 픽스처에 쓴다. 경로는 fixtures/sundaes/src 기준 상대 경로이고 ' +
            '.test.tsx 로 끝나야 한다. 이미 있으면 덮어쓴다.',
        inputSchema: {
            type: 'object',
            properties: {
                path: {
                    type: 'string',
                    description: '예: pages/summary/tests/SummaryForm.test.tsx',
                },
                content: { type: 'string', description: '테스트 파일 전체 내용' },
            },
            required: ['path', 'content'],
            additionalProperties: false,
        },
        run: async ({ path, content }) => {
            if (!path.endsWith('.test.tsx')) {
                return `거부됨: 테스트 파일은 .test.tsx 로 끝나야 합니다 (받은 값: ${path})`;
            }
            let absolute: string;
            try {
                absolute = resolveInsideFixtureSrc(path);
            } catch (error) {
                return `거부됨: ${(error as Error).message}`;
            }
            await mkdir(dirname(absolute), { recursive: true });
            await writeFile(absolute, content, 'utf8');
            metrics.writes += 1;
            return `작성했습니다: src/${relative(FIXTURE_SRC, absolute)} (${content.length}자)`;
        },
    });

    const runTests = betaTool({
        name: 'run_tests',
        description:
            '테스트 파일 하나를 vitest 로 실행하고 결과를 돌려준다. ' +
            '경로는 fixtures/sundaes/src 기준 상대 경로.',
        inputSchema: {
            type: 'object',
            properties: {
                path: { type: 'string', description: '실행할 테스트 파일 경로' },
            },
            required: ['path'],
            additionalProperties: false,
        },
        run: async ({ path }) => {
            let absolute: string;
            try {
                absolute = resolveInsideFixtureSrc(path);
            } catch (error) {
                return `거부됨: ${(error as Error).message}`;
            }
            metrics.testRuns += 1;
            const target = relative(FIXTURE_ROOT, absolute);
            try {
                const { stdout, stderr } = await execFileAsync(
                    'npx',
                    ['vitest', 'run', target, '--reporter=verbose'],
                    { cwd: FIXTURE_ROOT, timeout: 180_000, maxBuffer: 20 * 1024 * 1024 },
                );
                return truncate(`통과 (exit 0)\n\n${stdout}\n${stderr}`);
            } catch (error) {
                const failure = error as { stdout?: string; stderr?: string; code?: number };
                return truncate(
                    `실패 (exit ${failure.code ?? '?'})\n\n${failure.stdout ?? ''}\n${failure.stderr ?? ''}`,
                );
            }
        },
    });

    const userMessage = [
        `대상 파일: src/${sourceRel}`,
        '',
        '이 컴포넌트의 동작을 검증하는 테스트를 작성하세요. 소스는 아래에 전부 들어 있습니다.',
        '파일 시스템을 탐색하는 도구는 주지 않았습니다 — 필요한 정보는 여기 있는 것이 전부입니다.',
        '',
        '```tsx',
        sourceCode,
        '```',
    ].join('\n');

    const startedAt = Date.now();
    const runner = client.beta.messages.toolRunner({
        model: 'claude-opus-5',
        max_tokens: 16000,
        thinking: { type: 'adaptive' },
        output_config: { effort: 'high' },
        system: SYSTEM_PROMPT,
        tools: [writeTestFile, runTests],
        messages: [{ role: 'user', content: userMessage }],
        max_iterations: MAX_ITERATIONS,
    });

    let finalText = '';
    for await (const message of runner) {
        metrics.iterations += 1;
        metrics.inputTokens += message.usage.input_tokens ?? 0;
        metrics.outputTokens += message.usage.output_tokens ?? 0;
        metrics.cacheReadTokens += message.usage.cache_read_input_tokens ?? 0;
        metrics.cacheCreationTokens += message.usage.cache_creation_input_tokens ?? 0;

        for (const block of message.content) {
            if (block.type === 'text') {
                finalText = block.text;
                process.stdout.write(`\n${block.text}\n`);
            } else if (block.type === 'tool_use') {
                process.stdout.write(`  → ${block.name}\n`);
            }
        }

        if (message.stop_reason === 'refusal') {
            console.error('\n모델이 요청을 거절했습니다:', message.stop_details);
            break;
        }
    }

    const elapsedMs = Date.now() - startedAt;
    const record = {
        target: `src/${sourceRel}`,
        condition: 'source-injected',
        model: 'claude-opus-5',
        effort: 'high',
        elapsedSeconds: Math.round(elapsedMs / 100) / 10,
        ...metrics,
        // 첫 실행은 작성만 하므로, 자가수복 루프가 실제로 돈 횟수는 실행 수 - 1이다.
        selfRepairRounds: Math.max(0, metrics.testRuns - 1),
        hitIterationCap: metrics.iterations >= MAX_ITERATIONS,
        summary: finalText,
    };

    const outPath = join(REPO_ROOT, 'reports', `run-generate-${sourceRel.replace(/[\/.]/g, '-')}.json`);
    await mkdir(dirname(outPath), { recursive: true });
    await writeFile(outPath, `${JSON.stringify(record, null, 2)}\n`, 'utf8');

    console.log('\n─── 측정 ───');
    console.log(`소요 시간        ${record.elapsedSeconds}s`);
    console.log(`모델 왕복        ${metrics.iterations}`);
    console.log(`테스트 실행      ${metrics.testRuns} (자가수복 ${record.selfRepairRounds}회)`);
    console.log(`파일 작성        ${metrics.writes}`);
    console.log(
        `토큰             입력 ${metrics.inputTokens} / 출력 ${metrics.outputTokens} / ` +
            `캐시읽기 ${metrics.cacheReadTokens} / 캐시쓰기 ${metrics.cacheCreationTokens}`,
    );
    if (record.hitIterationCap) {
        console.log(`\n⚠ 반복 상한(${MAX_ITERATIONS})에 닿았습니다. 미완료로 취급하세요.`);
    }
    console.log(`\n기록: ${relative(REPO_ROOT, outPath)}`);
    console.log('실험이 끝나면 픽스처를 되돌리세요: cd fixtures/sundaes && git checkout -- src/');
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
