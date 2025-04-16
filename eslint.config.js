// eslint.config.js
import nextJs from '@next/eslint-plugin-next';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import tseslint from 'typescript-eslint';

export default [
  {
    linterOptions: {
      noInlineConfig: false,
      reportUnusedDisableDirectives: true,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parser: tseslint.parser,
      parserOptions: {
        // Don't use project since it causes issues
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
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
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
    ignores: [
      // Build output
      'node_modules/**',
      '.next/**',
      'out/**',
      'dist/**',
      'build/**',
      
      // TypeScript declaration files
      '*.d.ts',
      
      // Public assets
      'public/**',
      
      // Config files
      'next.config.js',
      'postcss.config.js',
      'tailwind.config.js',
      'jest.config.js',
      
      // Test files
      'coverage/**',
      '**/__tests__/coverage/**',
      '**/*.test.js.snap',
      
      // Package files
      'package.json',
      'package-lock.json',
      
      // Generated files
      'src/types/generated/**',
      
      // Specific files with known issues (keep these)
      'src/app/admin/forms/[id]/edit/page.tsx',
      'src/app/admin/forms/[id]/responses/[responseId]/edit/page.tsx',
      'src/__tests__/helpers/testing-utils.tsx'
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