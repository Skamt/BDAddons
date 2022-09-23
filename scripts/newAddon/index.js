module.exports = (Plugin, Api) => {
	const {
		Patcher,
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

		clean() {
			PluginUtilities.removeStyle(this.getName());
			Patcher.unpatchAll();
		}
		onStart() {
			try {
				this.patch();
			} catch (e) {
				console.error(e);
			}
		}
		onStop() {
			try {
				this.clean();
			} catch (e) {
				console.error(e);
			}
		}
		getSettingsPanel() {
			return this.buildSettingsPanel().getElement();
		}
	};
};