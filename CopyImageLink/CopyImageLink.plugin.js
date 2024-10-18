/**
 * @name CopyImageLink
 * @description Adds (Copy Link) button next to (Open Original) under images
 * @version 1.2.3
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/CopyImageLink
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/CopyImageLink/CopyImageLink.plugin.js
 */

const config = {
	"info": {
		"name": "CopyImageLink",
		"version": "1.2.3",
		"description": "Adds (Copy Link) button next to (Open Original) under images",
		"source": "https://raw.githubusercontent.com/Skamt/BDAddons/main/CopyImageLink/CopyImageLink.plugin.js",
		"github": "https://github.com/Skamt/BDAddons/tree/main/CopyImageLink",
		"authors": [{
			"name": "Skamt"
		}]
	}
}

const Api = new BdApi(config.info.name);

const UI = Api.UI;
const DOM = Api.DOM;
const React = Api.React;
const Patcher = Api.Patcher;

const getModule = Api.Webpack.getModule;

const RenderLinkComponent = getModule(m => m.type?.toString?.().includes("MASKED_LINK"), { searchExports: false });

function copy(data) {
	DiscordNative.clipboard.copy(data);
}

const Logger = {
	error(...args) {
		this.p(console.error, ...args);
	},
	patch(patchId) {
		console.error(`%c[${config.info.name}] %c Error at %c[${patchId}]`, "color: #3a71c1;font-weight: bold;", "", "color: red;font-weight: bold;");
	},
	log(...args) {
		this.p(console.log, ...args);
	},
	p(target, ...args) {
		target(`%c[${config.info.name}]`, "color: #3a71c1;font-weight: bold;", ...args);
	}
};

function showToast(content, type) {
	UI.showToast(`[${config.info.name}] ${content}`, { timeout: 5000, type });
}

const Toast = {
	success(content) { showToast(content, "success"); },
	info(content) { showToast(content, "info"); },
	warning(content) { showToast(content, "warning"); },
	error(content) { showToast(content, "error"); }
};

const CopyButtonComponent = ({ href }) => {
	return (
		React.createElement(React.Fragment, null, React.createElement('span', { className: "copyBtnSpan", }, "|"), React.createElement('a', {
				className: "copyBtn",
				onClick: () => {
					copy(href);
					Toast.success("Link Copied!");
				},
			}, "Copy link"

		))
	);
};

class CopyImageLink {
	start() {
		try {

			DOM.addStyle(css);
			if (!RenderLinkComponent) return Logger.patch("RenderLinkComponent");
			Patcher.after(RenderLinkComponent, "type", (_, [{ href }], returnValue) => {
				if (!returnValue || !href) return;
				return [returnValue, React.createElement(CopyButtonComponent, { href: href, })];
			});
		} catch (e) {
			Logger.error(e);
		}
	}

	stop() {
		DOM.removeStyle();
		Patcher.unpatchAll();
	}
}

module.exports = CopyImageLink;

const css = `.copyBtn {
	left: 115px;
	white-space: nowrap;
	margin-right: auto;
	font-size: 14px;
	font-weight: 500;
	color: #fff;
	line-height: 30px;
	transition: opacity 0.15s ease;
	opacity: 0.5;
}
.copyBtn:hover {
	opacity: 1;
	text-decoration: underline;
}

.copyBtnSpan {
	font-weight: 500;
	color: hsl(0, calc(var(--saturation-factor, 1) * 0%), 100%) !important;
	line-height: 30px;
	opacity: 0.5;
}
`;
