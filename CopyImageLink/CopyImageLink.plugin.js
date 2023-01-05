/**
 * @name CopyImageLink
 * @description Adds (Copy Link) button next to (Open Original) under images
 * @version 1.0.2
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/CopyImageLink
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/CopyImageLink/CopyImageLink.plugin.js
 */
const config = {
	info: {
		name: "CopyImageLink",
		version: "1.0.2",
		description: "Adds (Copy Link) button next to (Open Original) under images",
		source: "https://raw.githubusercontent.com/Skamt/BDAddons/main/CopyImageLink/CopyImageLink.plugin.js",
		github: "https://github.com/Skamt/BDAddons/tree/main/CopyImageLink",
		authors: [{
			name: "Skamt"
		}]
	}
};
module.exports = (() => {
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
	const ImageModal = getModule(m => {
		if (!m?.toString || typeof(m?.toString) !== "function" || !m.prototype?.render) return;
		const strs = ["original", "maxHeight", "maxWidth", "noreferrer noopener"];
		const funcStr = m?.prototype?.render?.toString();
		for (const s of strs)
			if (!funcStr.includes(s)) return false;
		return true;
	});
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
	// components
	const copyButton = ({ href }) => {
		return (
			React.createElement(React.Fragment, null,
				React.createElement("span", { className: "copyBtnSpan" }, "|"),
				React.createElement("a", {
					className: "downloadLink-1OAglv anchorUnderlineOnHover-2qPutX copyBtn",
					onClick: (_) => Utils.copy(href)
				}, "Copy link")));
	};
	// styles
	const css = `.copyBtn {
	left: 115px;
	white-space: nowrap;
}

.copyBtnSpan {
	left: 105px;
	position: absolute;
	top: 100%;
	font-weight: 500;
	color: hsl(0, calc(var(--saturation-factor, 1) * 0%), 100%) !important;
	line-height: 30px;
	opacity: 0.5;
}`;
	return class CopyImageLink {
		get name() { return config.info.name }
		start() {
			try {
				DOM.addStyle(this.name, css);
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
})();
