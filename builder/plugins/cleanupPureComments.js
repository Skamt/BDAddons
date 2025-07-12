module.exports = () => ({
	name: "cleanupPureComments",
	renderChunk(source) {
		return source.replace(/\/\*@__PURE__\*\//ig,"");
	},
});
