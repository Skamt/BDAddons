const config = {{ PLUGIN__CONFIG }};

function getPlugin() {
	const [ParentPlugin, Api] = global.ZeresPluginLibrary.buildPlugin(config);
	const { Modules, Plugin } = ({{ PLUGIN__BODY }})(Api);
	return [ParentPlugin, Plugin, Modules]
}

function pluginErrorAlert(content){
	BdApi.alert(config.info.name, content);
}

function getErrorPlugin(message) {
	return () => ({
		stop() {},
		start() {
			pluginErrorAlert(message);
		}
	})
}

function checkModules(Modules) {
	return Object.entries(Modules).reduce((acc, [moduleName, { module, fallback, isBreakable, withKey }]) => {
		if ((withKey && !module.module) || !module) {
			if (isBreakable) acc[0] = true;
			acc[2].push(moduleName);
			if(fallback) acc[1][moduleName] = fallback;
		} else
			acc[1][moduleName] = module;
		return acc;
	}, [false, {}, []]);
}

function initPlugin() {
	const [ParentPlugin, Plugin, Modules] = getPlugin();

	const [pluginBreakingError, SafeModules, BrokenModules] = checkModules(Modules);
	if (pluginBreakingError)
		return getErrorPlugin([
			"**Plugin is broken**",
			"Take a screenshot of this popup and show it to the dev.",
			`\`\`\`md\n[Missing modules]\n\n${BrokenModules.map((moduleName,i) => `${++i}. ${moduleName}`).join('\n')}\`\`\``
		]);
	else {
		if (BrokenModules.length > 0)
			pluginErrorAlert([
				"Detected some Missing modules, certain aspects of the plugin may not work properly."
				,`\`\`\`md\n[Missing modules]\n\n${BrokenModules.map((moduleName,i) => `${++i}. ${moduleName}`).join('\n')}\`\`\``
			]);
		return Plugin(ParentPlugin, SafeModules);
	}
}

module.exports = !global.ZeresPluginLibrary ?
	getErrorPlugin(["**Library plugin is needed**", 
		`**ZeresPluginLibrary** is needed to run **${this.config.info.name}**.`,
		"Please download it from the officiel website",
		"https://betterdiscord.app/plugin/ZeresPluginLibrary"
	]) :
	initPlugin();