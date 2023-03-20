function main(API) {
	const { Webpack: { Filters, getModule } } = BdApi;
	return {
		Modules: {},
		Plugins(Modules) {
			const {
				UI,
				DOM,
				Patcher,
			} = API;

			return class pluginTEMPLATE {

				constructor() {
					super();
				}

				patch() {
					Patcher.after(MODULE, "FUNCNAME", (_, args, returnValue) => {
						console.log(args, returnValue);
					});
				}

				start() {
					try {
						this.patch();
					} catch (e) {
						console.error(e);
					}
				}

				stop() {
					DOM.removeStyle();
					Patcher.unpatchAll();
				}
			}
		}
	}
}