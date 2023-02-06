module.exports = {
  root: true,
  env: {
    es2022: true,
    browser: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:prettier/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.json'],
  },
  plugins: ['import', '@typescript-eslint'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'no-debugger': 'off',
    "react/react-in-jsx-scope": "off"
  },
};
