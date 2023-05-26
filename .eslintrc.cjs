/* eslint-disable import/no-commonjs */
/** @type {import('@types/eslint').Linter.BaseConfig} */
module.exports = {
	extends: [
		'@remix-run/eslint-config',
		'@remix-run/eslint-config/node',
		'@remix-run/eslint-config/jest-testing-library',
		'prettier',
	],
	rules: {
		'@typescript-eslint/consistent-type-imports': [
			'warn',
			{
				prefer: 'type-imports',
				disallowTypeAnnotations: true,
				fixStyle: 'inline-type-imports',
			},
		],
		'testing-library/no-await-sync-events': 'off',
		'jest-dom/prefer-in-document': 'off',
		'@typescript-eslint/no-duplicate-imports': 'warn',
		'import/no-unresolved': 2,
		'import/no-commonjs': 2,
		'import/extensions': [2, 'ignorePackages'],
	},
	// we're using vitest which has a very similar API to jest
	// (so the linting plugins work nicely), but it we have to explicitly
	// set the jest version.
	settings: {
		jest: {
			version: 28,
		},
	},
}
