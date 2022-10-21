module.exports = () => {
	const {
		UI,
		DOM,
		React,
		Patcher,
		Webpack: {
			getModule
		}
	} = BdApi;

	// Modules
	const ImageModal = getModule(m => m?.prototype?.render?.toString().includes("OPEN_ORIGINAL_IMAGE"));

	// Helper functions
	const Utils = {
		showToast: (content, type) => UI.showToast(`[${config.info.name}] ${content}`,{type}),
		copy: (data) => {
			DiscordNative.clipboard.copy(data);
			Utils.showToast("Link Copied!", "success");
		},
		/* Stolen from Zlib until it gets added to BdApi */
		getNestedProp: (obj, path) => path.split(".").reduce(function(ob, prop) {
			return ob && ob[prop];
		}, obj)
	};

	// components
	const copyButton = require("components/CopyButton.jsx");

	// styles
	const css = require("styles.css");

	return class CopyImageLink {
		get name() { return config.info.name }

		start() {
			try {
				DOM.addStyle(this.name,css);
				Patcher.after(this.name, ImageModal.prototype, "render", (_, __, returnValue) => {
					const children = Utils.getNestedProp(returnValue, "props.children");
					const { href } = Utils.getNestedProp(returnValue, "props.children.2.props");
					children.push(React.createElement(copyButton, { href }));
				});
			} catch (e) {
				console.error(e);
			}
		}

		stop() {
			DOM.removeStyle(this.name);
			Patcher.unpatchAll(this.name);
		}
	};
};