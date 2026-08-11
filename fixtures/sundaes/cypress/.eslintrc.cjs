module.exports = {
    // ...
    overrides: [
        {
            extends: ['plugin:cypress/recommended'],
            files: ['cypress/**/*.ts'],
            rules: {
                // 추후 필요한 rule를 추가해주면 됩니다.
            },
        },
    ],
    // ...
};
