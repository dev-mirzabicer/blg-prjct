module.exports = {
    parser: "@typescript-eslint/parser",
    extends: [
        "plugin:@typescript-eslint/recommended",
        "plugin:prettier/recommended",
    ],
    plugins: ["@typescript-eslint", "prettier"],
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: "module",
    },
    rules: {
        "linebreak-style": ["error", "unix"],
        quotes: ["error", "double"],
        semi: ["error", "always"],
        "prettier/prettier": "error",
        "prefer-destructuring": ["error", { object: true, array: false }],
        "no-unused-vars": [
            "warn",
            { argsIgnorePattern: "next|req|res|val|err|this" },
        ],
        "@typescript-eslint/no-unused-vars": [
            "warn",
            { argsIgnorePattern: "next|req|res|val|err" },
        ],
        indent: ["error", 4, { SwitchCase: 1 }],
    },
};
