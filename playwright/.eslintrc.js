/** @type {import('@types/eslint').Linter.BaseConfig} */
module.exports = {
	extends: ['../.eslintrc.js'],
	rules: {
		'testing-library/prefer-screen-queries': 0,
		'@typescript-eslint/consistent-type-imports': 0,
	},
}
