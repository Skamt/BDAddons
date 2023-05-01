module.exports = function css() {
	return {
		name: 'css',
		transform(code, id) {
			if (id.endsWith('.css'))
				return `export default \`\n${code}\``
		}
	};
}