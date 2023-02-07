module.exports = (Plugin, Api) => {
	const {
		UI,
		DOM,
		Patcher,
		Webpack: {
			Filters,
			getModule
		}
	} = new BdApi(config.info.name);

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
				console.error(e);
			}
		}

		onStop() {
			DOM.removeStyle();
			Patcher.unpatchAll();
		}

		getSettingsPanel() {
			return this.buildSettingsPanel().getElement();
		}
		
	};
};