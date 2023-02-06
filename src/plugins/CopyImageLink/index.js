module.exports = () => {
	const {
		UI,
		DOM,
		React,
		Patcher,
		Webpack: {
			getModule
		}
	} = new BdApi(config.info.name);

	// https://discord.com/channels/86004744966914048/196782758045941760/1062604534922367107
	function getModuleAndKey(filter) {
		let module;
		const target = BdApi.Webpack.getModule((entry, m) => filter(entry) ? (module = m) : false, { searchExports: true })
		return [module.exports, Object.keys(module.exports).find(k => module.exports[k] === target)];
	}
	// Modules
	const [ImageModalModule,ImageModalKey] = getModuleAndKey(DiscordModules.ImageModal);

	// Helper functions
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
	const copyButton = require("components/CopyButton.jsx");

	// styles
	const css = require("styles.css");

	return class CopyImageLink {
		start() {
			try {
				DOM.addStyle(css);
				Patcher.after(ImageModalModule, ImageModalKey, (_, __, returnValue) => {
					const children = Utils.getNestedProp(returnValue, "props.children");
					const { href } = Utils.getNestedProp(returnValue, "props.children.2.props");
					children.push(React.createElement(copyButton, { href }));
				});
			} catch (e) {
				console.error(e);
			}
		}

		stop() {
			DOM.removeStyle();
			Patcher.unpatchAll();
		}
	};
};