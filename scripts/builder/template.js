const config = {{ PLUGIN__CONFIG }};

function getPlugin() {
	const { Modules, Plugin } = ({{ PLUGIN__BODY }})();
	return [Plugin, Modules]
}

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
	}, [false, {}, []]);
}

function ensuredata() {
	return BdApi.Data.load(config.info.name, 'brokenModulesData') || {
		version: config.info.version,
		first: true,
		errorPopupCount: 0,
		savedBrokenModules: []
	};
}

function setPluginMetaData() {
	const { version, first } = ensuredata();
	if (version != config.info.version || first)
		BdApi.Data.save(config.info.name, 'brokenModulesData', {
			version: config.info.version,
			errorPopupCount: 0,
			first: false,
			savedBrokenModules: []
		});
}

function handleBrokenModules(brokenModules) {
	const { version, errorPopupCount, savedBrokenModules } = ensuredata();

	const newBrokenModules = brokenModules.some(([newItem]) => !savedBrokenModules.includes(newItem));
	const isUpdated = version != config.info.version;
	const isPopupLimitReached = errorPopupCount === 3;

	if (isUpdated || !isPopupLimitReached || newBrokenModules) {
		pluginErrorAlert([
			"Detected some Missing modules, certain aspects of the plugin may not work properly.",
			`\`\`\`md\nMissing modules:\n\n${brokenModules.map(([moduleName, errorNote]) => `[${moduleName}]: ${errorNote || ""}`).join('\n')}\`\`\``
		]);

		BdApi.Data.save(config.info.name, 'brokenModulesData', {
			version,
			errorPopupCount: (errorPopupCount + 1) % 4,
			savedBrokenModules: brokenModules.map(([moduleName]) => moduleName)
		});
	}
}

function initPlugin() {
	setPluginMetaData();
	const [Plugin, Modules] = getPlugin();

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