const { program } = require("commander");
const { getPlugins } = require("./helpers");

program
	.command("list")
	.alias("l")
	.description("lists all available valid plugins")
	.action(() => {
		const plugins = getPlugins();
		console.log(plugins.map(a => `-\u0020${a.name}`).join("\n"));
	});
