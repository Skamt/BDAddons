function main() {
	const { Webpack: { Filters, getModule } } = BdApi;

	// https://discord.com/channels/86004744966914048/196782758045941760/1062604534922367107
	function getModuleAndKey(filter) {
		let module;
		const target = getModule((entry, m) => filter(entry) ? (module = m) : false, { searchExports: true });
		module = module?.exports;
		if (!module) return { module: undefined };
		const key = Object.keys(module).find(k => module[k] === target);
		if (!key) return undefined;
		return { module, key };
	}

	return {
		Modules: {
			ImageModal: {
				module: getModuleAndKey(DiscordModules.ImageModal),
				isBreakable: true,
				withKey: true
			}
		},
		Plugin(Modules) {
			const {
				UI,
				DOM,
				React,
				Patcher
			} = new BdApi(config.info.name);

			// Utilities
			const Utils = {
				showToast: (content, type) => UI.showToast(`[${config.info.name}] ${content}`, { type }),
				copy: (data) => {
					DiscordNative.clipboard.copy(data);
					Utils.showToast("Link Copied!", "success");
				},
				/* Stolen from Zlib until it gets added to BdApi */
				getNestedProp: (obj, path) => path.split(".").reduce(function(ob, prop) {
					return ob && ob[prop];
				}, obj)
			};

			// Components
			const CopyButtonComponent = require("components/CopyButtonComponent.jsx");

			// Styles
			function addStyles(){
				DOM.addStyle(require("styles.css"));
			}

			return class CopyImageLink {
				start() {
					try {
						addStyles();
						Patcher.after(Modules.ImageModal.module, Modules.ImageModal.key, (_, __, returnValue) => {
							const children = Utils.getNestedProp(returnValue, "props.children");
							const { href } = Utils.getNestedProp(returnValue, "props.children.2.props");
							children.push(React.createElement(CopyButtonComponent, { href }));
						});
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