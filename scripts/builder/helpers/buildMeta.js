module.exports = function buildMeta(config) {
	const metaString = ["/**"];
	const line = (label, val) => val && metaString.push(` * @${label} ${val}`);
	line("name", config.info.name);
	line("description", config.info.description);
	line("version", config.info.version);
	line("author", config.info.authors.map(a => a.name).join(", "));
	line("website", config.info.github);
	line("source", config.info.source);
	metaString.push(" */");
	metaString.push("");
	return metaString.join("\n");
}