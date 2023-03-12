
const config = {{ PLUGIN__CONFIG }};

{{ PLUGIN__BODY }}

function pluginErrorAlert(content) {
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

function checkModules(modules) {
	return Object.entries(modules).reduce((acc, [moduleName, { module, fallback, errorNote, isBreakable, withKey }]) => {
		if ((withKey && !module.module) || !module) {
			if (isBreakable) acc[0] = true;
			acc[2].push([moduleName, errorNote]);
			if (fallback) acc[1][moduleName] = fallback;
		} else
			acc[1][moduleName] = module;
		return acc;
	}, [false, {},
		[]
	]);
}

function ensuredata() {
	return BdApi.Data.load(config.info.name, 'brokenModulesData') || {
		version: config.info.version,
		errorPopupCount: 0,
		savedBrokenModules: []
	};
}

function setPluginMetaData() {
	const { version, changelog = false } = ensuredata();
	if (version != config.info.version || !changelog) {
		// TODO showChangelog();
		BdApi.Data.save(config.info.name, 'brokenModulesData', {
			version: config.info.version,
			changelog: true,
			errorPopupCount: 0,
			savedBrokenModules: []
		});
	}
}

function handleBrokenModules(brokenModules) {
	const current = ensuredata();

	const newBrokenModules = brokenModules.some(([newItem]) => !current.savedBrokenModules.includes(newItem));
	const isUpdated = current.version != config.info.version;
	const isPopupLimitReached = current.errorPopupCount === 3;

	if (isUpdated || !isPopupLimitReached || newBrokenModules) {
		pluginErrorAlert([
			"Detected some Missing modules, certain aspects of the plugin may not work properly.",
			`\`\`\`md\nMissing modules:\n\n${brokenModules.map(([moduleName, errorNote]) => `[${moduleName}]: ${errorNote || ""}`).join('\n')}\`\`\``
		]);

		BdApi.Data.save(config.info.name, 'brokenModulesData', {
			...current,
			version : current.version,
			errorPopupCount: (current.errorPopupCount + 1) % 4,
			savedBrokenModules: brokenModules.map(([moduleName]) => moduleName)
		});
	}
}

function initPlugin() {
	setPluginMetaData();
	const { Modules, Plugin } = main();

	const [pluginBreakingError, SafeModules, BrokenModules] = checkModules(Modules);

	if (pluginBreakingError)
		return getErrorPlugin([
			"**Plugin is broken:** Take a screenshot of this popup and show it to the dev.",
			`\`\`\`md\nMissing modules:\n\n${BrokenModules.map(([moduleName],i) => `${++i}. ${moduleName}`).join('\n')}\`\`\``
		]);
	else {
		if (BrokenModules.length > 0)
			handleBrokenModules(BrokenModules);
		return Plugin(SafeModules);
	}
}

module.exports = initPlugin();