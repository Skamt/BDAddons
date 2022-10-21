const config = {{ PLUGIN__CONFIG }};

function initPlugin([Plugin, Api]) {
	const plugin = {{ PLUGIN__BODY }};
	return plugin(Plugin, Api);
}

module.exports = !global.ZeresPluginLibrary 
	? () => ({
		stop() {},
		start() {
			BdApi.UI.showConfirmationModal("Library plugin is needed", [`**ZeresPluginLibrary** is needed to run **${this.config.info.name}**.`, `Please download it from the officiel website`, "https://betterdiscord.app/plugin/ZeresPluginLibrary"], {
				confirmText: "Ok"
			});
		}
	}) 
	: initPlugin(global.ZeresPluginLibrary.buildPlugin(config));
