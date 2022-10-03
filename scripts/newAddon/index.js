module.exports = (Plugin, Api) => {
	const {
		Patcher,
		Logger,
		WebpackModules,
		PluginUtilities,
		DiscordModules: {
			React,
			React: { useState }
		}
	} = Api;

	return class pluginTEMPLATE extends Plugin {
		constructor() {
			super();
		}

		patch() {
			Patcher.after(MODULE, "FUNCNAME", (_, args, returnValue) => {
				console.log(args, returnValue);
			});
		}

		onStart() {
			try {
				this.patch();
			} catch (e) {
				Logger.err(e);
			}
		}
		onStop() {
			PluginUtilities.removeStyle(this.getName());
			Patcher.unpatchAll();
		}
		getSettingsPanel() {
			return this.buildSettingsPanel().getElement();
		}
	};
};