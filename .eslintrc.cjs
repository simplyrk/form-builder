module.exports = {
  extends: [
    'next/core-web-vitals',
    'eslint:recommended',
  ],
  plugins: [
    '@next/next',
    '@typescript-eslint'
  ],
  rules: {
    'import/order': 'off',
    'import/first': 'off',
    'import/newline-after-import': 'off',
    'import/no-duplicates': 'off',
    'import/no-unresolved': 'off',
    'import/no-named-as-default': 'off',
    'import/no-named-as-default-member': 'off',
    'import/namespace': 'off',
    'import/no-empty-named-blocks': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['warn'],
  },
  ignorePatterns: [
    'node_modules/',
    '.next/',
    '*.d.ts',
    'coverage/'
  ]
}; 