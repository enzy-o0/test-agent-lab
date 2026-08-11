import '@testing-library/jest-dom';
import '@testing-library/react';

import { beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './app/apiMockServer';

// 모든 테스트 전에 API 모킹
beforeAll(() => server.listen());

// 테스트 간에 핸들러를 리셋하는 코드, 다른 핸들러를 테스트를 위해 추가했다면
// 이어지는 테스트에서 그걸 그대로 가져갈 필요가 없음
afterEach(() => server.resetHandlers());

// 모든 테스트가 끝났을 때, 서버 종료
afterAll(() => server.close());
