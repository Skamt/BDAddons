const path = require('path');
const pluginutils = require('@rollup/pluginutils');
const eslint = require('eslint');

function normalizePath(id) {
	return path.relative(process.cwd(), id).split(path.sep).join('/');
}

module.exports = (options = {}) => {
	if (typeof options === 'string') {
		const configFile = path.resolve(process.cwd(), options);
		// eslint-disable-next-line global-require, import/no-dynamic-require, no-param-reassign
		options = require(configFile);
		// Tell eslint not to look for configuration files.
		// eslint-disable-next-line no-param-reassign
		options.useEslintrc = false;
	}
	const { include, exclude = /node_modules/, throwOnWarning = false, throwOnError = false, formatter = 'stylish', ...eslintOptions } = options;
	const eslintInstance = new eslint.ESLint(eslintOptions);
	const filter = pluginutils.createFilter(include, exclude);
	return {
		name: 'eslint',
		async transform(_, id) {
			const file = normalizePath(id);
			if (!filter(id) || (await eslintInstance.isPathIgnored(file))) {
				return null;
			}
			const results = await eslintInstance.lintText(_);
			const [result] = results;
			if (eslintOptions.fix) {
				await eslint.ESLint.outputFixes(results);
			}
			if (result.warningCount === 0 && result.errorCount === 0) {
				return null;
			}
			const eslintFormatter = typeof formatter === 'string' ?
				await eslintInstance.loadFormatter(formatter) :
				{ format: formatter };
			const output = await eslintFormatter.format(results);
			if (output) {
				console.log("\n======================ESLint======================\n");
				console.log(file);
				console.log(output);
				console.log("======================ESLint======================\n");
			}
			const errorMessages = [];
			if (result.warningCount > 0 && throwOnWarning) {
				errorMessages.push(`${result.warningCount} warning${result.warningCount > 1 ? 's' : ''}`);
			}
			if (result.errorCount > 0 && throwOnError) {
				errorMessages.push(`${result.errorCount} error${result.errorCount > 1 ? 's' : ''}`);
			}
			if (errorMessages.length > 0) {
				throw new Error(`Found ${errorMessages.join(' and ')} in ${path.relative('.', result.filePath)}`);
			}
			return null;
		}
	};
}