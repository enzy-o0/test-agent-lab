const vitest = require("eslint-plugin-vitest");

module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:testing-library/react',
    'plugin:vitest/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    // base 룰은 반드시 꺼야 한다. @typescript-eslint/recommended 가 이미
    // @typescript-eslint/no-unused-vars 를 켜므로, 켜 두면 같은 위치를 두 번
    // 보고하고 타입 선언부의 파라미터까지 오탐한다.
    "no-unused-vars": "off",
    "vitest/expect-expect": "off", // eliminate distracting red squiggles while writing tests
    "react/prop-types": "off", // turn off props validation
  },
  globals: {
    ...vitest.environments.env.globals,
  },
}
