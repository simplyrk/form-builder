// eslint.config.js
import nextJs from '@next/eslint-plugin-next';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';

export default [
  {
    ignores: [
      // Build artifacts
      '.next/**',
      'node_modules/**',
      'build/**',
      'dist/**',
      
      // Config files
      '*.config.js',
      '*.config.mjs',
      'next-env.d.ts',
      
      // Generated files
      '*.generated.*',
      '*.d.ts',
      
      // Files with TypeScript errors to fix separately
      'src/app/admin/forms/[id]/edit/page.tsx',
      'src/app/admin/forms/[id]/responses/[responseId]/edit/page.tsx'
    ]
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    plugins: {
      '@typescript-eslint': tsPlugin,
      'import': importPlugin,
      'jsx-a11y': jsxA11yPlugin,
      '@next/next': nextJs,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    rules: {
      // Next.js rules
      '@next/next/no-html-link-for-pages': 'error',
      '@next/next/no-img-element': 'error',
      '@next/next/no-unwanted-polyfillio': 'warn',
      '@next/next/no-script-component-in-head': 'error',
      
      // TypeScript rules
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-require-imports': 'error',
      
      // Import rules
      'import/order': [
        'warn',
        {
          'groups': [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling', 'index']
          ],
          'pathGroups': [
            {
              'pattern': 'react',
              'group': 'external',
              'position': 'before'
            },
            {
              'pattern': 'next/**',
              'group': 'external',
              'position': 'before'
            },
            {
              'pattern': '@/**',
              'group': 'internal'
            }
          ],
          'pathGroupsExcludedImportTypes': ['react'],
          'newlines-between': 'always',
          'alphabetize': {
            'order': 'asc',
            'caseInsensitive': true
          }
        }
      ],
      'import/no-duplicates': 'warn',
      
      // Accessibility rules
      'jsx-a11y/alt-text': 'warn',
      'jsx-a11y/aria-props': 'warn',
      'jsx-a11y/aria-role': 'warn',
      'jsx-a11y/role-has-required-aria-props': 'warn',
      
      // React rules
      'react/jsx-sort-props': 'off',
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off'
    }
  },
  {
    files: ['**/__tests__/**/*'],
    rules: {
      'import/order': 'off',
      'import/no-duplicates': 'off',
      '@typescript-eslint/no-require-imports': 'off'
    }
  }
]; 